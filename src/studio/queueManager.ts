import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import {
  DeleteArtifactsResult,
  deleteProblemArtifacts,
  discoverExistingProblems,
  getMissingQualityChecklist,
  scanProblemArtifacts,
  updateJobProgressFromArtifacts,
} from "./artifactInspector";
import { createInitialPhases, parseBatchInput } from "./problemParser";
import {
  buildContinuationPrompt,
  buildVisualLeetPrompt,
} from "./promptBuilder";
import {
  AgentProvider,
  BatchJob,
  LogEntry,
  QueueStateSnapshot,
} from "./types";

interface LiveJobHints {
  testsPassed: boolean;
  audioInProgress: boolean;
  renderProgressPct: number;
}

const MAX_LOGS_PER_JOB = 250;
const MAX_AUTO_HEAL_ATTEMPTS = 2;

export class BatchQueueManager extends EventEmitter {
  private workspaceRoot: string;
  private stateFilePath: string;
  private jobs: BatchJob[] = [];
  private queueRunning = false;
  private pauseAfterCurrent = false;
  private activeJobId: string | null = null;
  private activeChild: ChildProcess | null = null;
  private activeJobHints: LiveJobHints = {
    testsPassed: false,
    audioInProgress: false,
    renderProgressPct: 0,
  };
  private defaultAgent: AgentProvider = "agy";
  private defaultModel = "default";
  private pollTimer: NodeJS.Timeout | null = null;
  private logCounter = 1000;

  constructor(workspaceRoot: string) {
    super();
    this.workspaceRoot = workspaceRoot;
    this.stateFilePath = path.join(workspaceRoot, ".batch-studio-state.json");
    this.loadState();
    this.startArtifactPoller();
  }

  private loadState(): void {
    if (fs.existsSync(this.stateFilePath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.stateFilePath, "utf-8"));
        if (Array.isArray(raw.jobs)) {
          this.jobs = raw.jobs.map((j: BatchJob) => {
            // If server restarted while a job was running, mark it paused so user can resume
            if (j.status === "running") {
              j.status = "paused";
              j.currentAction =
                "Tạm dừng do khởi động lại server — bấm Resume để tiếp tục";
              j.pid = undefined;
            }
            if (j.phases?.phase1_solution) {
              j.phases.phase1_solution.shortLabel = "1. Solution (Py)";
              j.phases.phase1_solution.label =
                "Phase 1: Thuật Toán Tối Ưu (Python)";
            }
            const scan = scanProblemArtifacts(this.workspaceRoot, j.slug);
            updateJobProgressFromArtifacts(j, scan, {
              testsPassed: j.status === "completed",
            });
            return j;
          });
        }
        if (raw.defaultAgent) this.defaultAgent = raw.defaultAgent;
        if (raw.defaultModel) this.defaultModel = raw.defaultModel;
        return;
      } catch {
        this.jobs = [];
      }
    }

    this.jobs = discoverExistingProblems(this.workspaceRoot);
  }

  private saveState(): void {
    try {
      const payload = {
        defaultAgent: this.defaultAgent,
        defaultModel: this.defaultModel,
        jobs: this.jobs,
      };
      fs.writeFileSync(
        this.stateFilePath,
        JSON.stringify(payload, null, 2),
        "utf-8"
      );
    } catch {
      // ignore disk write errors
    }
  }

  private emitUpdate(): void {
    this.saveState();
    this.emit("state", this.getSnapshot());
  }

  private startArtifactPoller(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      let changed = false;
      for (const job of this.jobs) {
        if (job.status === "running" || job.status === "paused") {
          const prevPct = job.overallProgress;
          const prevPhase = job.currentPhase;
          const prevDetail = job.phases[job.currentPhase]?.detail;

          const scan = scanProblemArtifacts(this.workspaceRoot, job.slug);
          const hints =
            job.id === this.activeJobId ? this.activeJobHints : undefined;
          updateJobProgressFromArtifacts(job, scan, hints);

          if (
            job.overallProgress !== prevPct ||
            job.currentPhase !== prevPhase ||
            job.phases[job.currentPhase]?.detail !== prevDetail
          ) {
            changed = true;
          }
        }
      }
      if (changed) {
        this.emitUpdate();
      }
    }, 1000);
  }

  public getSnapshot(): QueueStateSnapshot {
    return {
      queueRunning: this.queueRunning,
      pauseAfterCurrent: this.pauseAfterCurrent,
      activeJobId: this.activeJobId,
      defaultAgent: this.defaultAgent,
      defaultModel: this.defaultModel,
      jobs: this.jobs,
      serverTime: Date.now(),
    };
  }

  public setDefaults(agent?: AgentProvider, model?: string): void {
    if (agent) this.defaultAgent = agent;
    if (model !== undefined && model.trim()) this.defaultModel = model.trim();
    this.emitUpdate();
  }

  public addBatchProblems(
    batchText: string,
    options?: {
      agent?: AgentProvider;
      model?: string;
      autoStart?: boolean;
    }
  ): BatchJob[] {
    const parsedList = parseBatchInput(batchText);
    const agent = options?.agent || this.defaultAgent;
    const model = options?.model || this.defaultModel;
    const added: BatchJob[] = [];

    for (const item of parsedList) {
      // Check if an active or queued job with the same slug already exists
      const existing = this.jobs.find((j) => j.slug === item.slug);
      if (existing && (existing.status === "running" || existing.status === "queued")) {
        continue;
      }

      const now = Date.now() + added.length;
      const newJob: BatchJob = {
        id: `job-${item.slug}-${now.toString(36)}`,
        rawInput: item.rawInput,
        slug: item.slug,
        title: item.title,
        problemNumber: item.problemNumber,
        leetcodeUrl: item.leetcodeUrl,
        agent,
        model,
        status: "queued",
        overallProgress: 0,
        currentPhase: "phase1_solution",
        currentAction: "Đang chờ trong hàng đợi...",
        phases: createInitialPhases(),
        createdAt: now,
        accumulatedRunMs: 0,
        attemptCount: 0,
        logs: [
          {
            id: ++this.logCounter,
            timestamp: new Date().toLocaleTimeString("vi-VN"),
            type: "info",
            text: `Đã thêm bài toán "${item.title}" (${item.slug}) vào hàng đợi với agent ${agent} (${model}).`,
          },
        ],
      };

      const scan = scanProblemArtifacts(this.workspaceRoot, newJob.slug);
      updateJobProgressFromArtifacts(newJob, scan);

      this.jobs.unshift(newJob);
      added.push(newJob);
    }

    // Keep queued jobs in the order they were entered (top-to-bottom)
    if (added.length > 1) {
      // Reverse the newly unshifted group so the first line entered is first to run
      const rest = this.jobs.slice(added.length);
      this.jobs = [...added, ...rest];
    }

    this.emitUpdate();

    if (options?.autoStart !== false && added.length > 0) {
      this.startQueue();
    }

    return added;
  }

  private appendJobLog(
    job: BatchJob,
    type: LogEntry["type"],
    text: string
  ): void {
    const clean = text.trim();
    if (!clean) return;

    // Avoid duplicate consecutive log lines
    const last = job.logs[job.logs.length - 1];
    if (last && last.text === clean) return;

    job.logs.push({
      id: ++this.logCounter,
      timestamp: new Date().toLocaleTimeString("vi-VN"),
      type,
      text: clean,
    });

    if (job.logs.length > MAX_LOGS_PER_JOB) {
      job.logs.splice(0, job.logs.length - MAX_LOGS_PER_JOB);
    }
  }

  public startQueue(): void {
    this.queueRunning = true;
    this.pauseAfterCurrent = false;

    // If there is a currently paused job that still has a live OS process, resume it first
    if (this.activeJobId && this.activeChild) {
      const activeJob = this.jobs.find((j) => j.id === this.activeJobId);
      if (activeJob && activeJob.status === "paused") {
        this.resumeJob(activeJob.id);
        return;
      }
    }

    // Or if there is a paused job without an active process, resume it
    const pausedJob = this.jobs.find((j) => j.status === "paused");
    if (pausedJob && !this.activeJobId) {
      pausedJob.status = "queued";
      pausedJob.currentAction = "Chuẩn bị tiếp tục từ trạng thái tạm dừng...";
    }

    this.emitUpdate();
    this.processNextIfIdle();
  }

  public pauseQueue(afterCurrent = false): void {
    if (afterCurrent) {
      this.pauseAfterCurrent = !this.pauseAfterCurrent;
      this.emitUpdate();
      return;
    }

    this.queueRunning = false;
    this.pauseAfterCurrent = false;

    if (this.activeJobId) {
      this.pauseJob(this.activeJobId);
    } else {
      this.emitUpdate();
    }
  }

  public pauseJob(jobId: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "running") return false;

    if (this.activeJobId === jobId && this.activeChild && this.activeChild.pid) {
      try {
        // Send SIGSTOP to the entire detached process group (-pid)
        process.kill(-this.activeChild.pid, "SIGSTOP");
      } catch {
        try {
          this.activeChild.kill("SIGSTOP");
        } catch {
          // ignore
        }
      }
    }

    const now = Date.now();
    if (job.startedAt) {
      job.accumulatedRunMs += now - job.startedAt;
    }
    job.pausedAt = now;
    job.status = "paused";
    job.currentAction = "⏸ Đã tạm dừng (SIGSTOP) — bấm Resume để chạy tiếp";
    this.queueRunning = false;
    this.appendJobLog(
      job,
      "info",
      "⏸ Đã tạm dừng tiến trình tạo video. Bấm Resume để tiếp tục ngay tại bước hiện tại."
    );
    this.emitUpdate();
    return true;
  }

  public resumeJob(jobId: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "paused") return false;

    this.queueRunning = true;
    this.pauseAfterCurrent = false;

    // Case 1: The OS process is still alive in memory and suspended via SIGSTOP
    if (this.activeJobId === jobId && this.activeChild && this.activeChild.pid) {
      try {
        process.kill(-this.activeChild.pid, "SIGCONT");
      } catch {
        try {
          this.activeChild.kill("SIGCONT");
        } catch {
          // ignore
        }
      }
      job.startedAt = Date.now();
      job.pausedAt = undefined;
      job.status = "running";
      job.currentAction = "▶ Đã tiếp tục tiến trình (SIGCONT)...";
      this.appendJobLog(
        job,
        "info",
        "▶ Đã tiếp tục tiến trình tạo video (SIGCONT)."
      );
      this.emitUpdate();
      return true;
    }

    // Case 2: The process was not in memory (e.g., server restarted), re-queue at front and spawn continuation
    job.status = "queued";
    job.pausedAt = undefined;
    job.currentAction = "Chuẩn bị chạy tiếp các bước còn lại...";
    this.appendJobLog(
      job,
      "info",
      "▶ Khởi động lại phiên agent để hoàn tất các bước còn lại..."
    );
    this.emitUpdate();
    this.processNextIfIdle();
    return true;
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;

    if (this.activeJobId === jobId && this.activeChild && this.activeChild.pid) {
      const pid = this.activeChild.pid;
      job.status = "cancelled";
      job.currentAction = "✕ Đã hủy bởi người dùng";
      this.appendJobLog(job, "error", "✕ Đã hủy tiến trình tạo video.");

      try {
        // Wake up first in case it was SIGSTOP'd, then terminate group
        process.kill(-pid, "SIGCONT");
      } catch {
        // ignore
      }
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        try {
          this.activeChild.kill("SIGTERM");
        } catch {
          // ignore
        }
      }

      this.activeChild = null;
      this.activeJobId = null;
      this.emitUpdate();
      this.processNextIfIdle();
      return true;
    }

    if (job.status === "queued" || job.status === "paused") {
      job.status = "cancelled";
      job.currentAction = "✕ Đã hủy";
      this.appendJobLog(job, "error", "✕ Đã hủy bài toán khỏi hàng đợi.");
      this.emitUpdate();
      return true;
    }

    return false;
  }

  public retryJob(jobId: string): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job || job.status === "running") return false;

    job.status = "queued";
    job.error = undefined;
    job.completedAt = undefined;
    job.pausedAt = undefined;
    job.attemptCount = 0;
    job.currentAction = "Đang chờ chạy lại trong hàng đợi...";
    this.appendJobLog(
      job,
      "info",
      "🔄 Đã đưa bài toán vào lại hàng đợi để chạy/hoàn thiện."
    );

    const scan = scanProblemArtifacts(this.workspaceRoot, job.slug);
    updateJobProgressFromArtifacts(job, scan);

    this.queueRunning = true;
    this.emitUpdate();
    this.processNextIfIdle();
    return true;
  }

  public removeJob(jobId: string): { ok: boolean; deleted?: DeleteArtifactsResult } {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) {
      return { ok: false };
    }

    if (this.activeJobId === jobId) {
      this.cancelJob(jobId);
    }

    const targetSlug = job.slug;

    // Completely wipe all disk artifacts for this slug (src/problems/<slug>, public/audio/, out/, and Root.tsx)
    const deleteResult = deleteProblemArtifacts(this.workspaceRoot, targetSlug);

    // Remove this job and any other dangling jobs with the same slug
    this.jobs = this.jobs.filter((j) => j.id !== jobId && j.slug !== targetSlug);
    this.emitUpdate();

    return { ok: true, deleted: deleteResult };
  }

  public moveJob(jobId: string, direction: "up" | "down"): boolean {
    const idx = this.jobs.findIndex((j) => j.id === jobId);
    if (idx === -1) return false;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= this.jobs.length) return false;

    const temp = this.jobs[idx];
    this.jobs[idx] = this.jobs[targetIdx];
    this.jobs[targetIdx] = temp;
    this.emitUpdate();
    return true;
  }

  private processNextIfIdle(): void {
    if (!this.queueRunning || this.activeJobId) return;

    const nextJob = this.jobs.find((j) => j.status === "queued");
    if (!nextJob) {
      this.queueRunning = false;
      this.pauseAfterCurrent = false;
      this.emitUpdate();
      return;
    }

    this.runJob(nextJob);
  }

  private buildAgentCommand(
    job: BatchJob,
    prompt: string
  ): { command: string; args: string[] } {
    if (job.agent === "claude") {
      const args = [
        "-p",
        prompt,
        "--output-format",
        "stream-json",
        "--verbose",
        "--dangerously-skip-permissions",
      ];
      if (job.model && job.model !== "default") {
        args.push("--model", job.model);
      }
      return { command: "claude", args };
    }

    if (job.agent === "codex") {
      const args = [
        "exec",
        "--json",
        "--dangerously-bypass-approvals-and-sandbox",
      ];
      if (job.model && job.model !== "default") {
        args.push("-m", job.model);
      }
      args.push(prompt);
      return { command: "codex", args };
    }

    // Default: Antigravity CLI (`agy`)
    const args = [
      "-p",
      prompt,
      "--output-format",
      "stream-json",
      "--dangerously-skip-permissions",
    ];
    if (job.model && job.model !== "default") {
      args.push("--model", job.model);
    }
    if (job.conversationId && job.attemptCount > 1) {
      args.push("--conversation", job.conversationId);
    }
    return { command: "agy", args };
  }

  private runJob(job: BatchJob, isContinuation = false): void {
    this.activeJobId = job.id;
    job.status = "running";
    job.startedAt = Date.now();
    job.pausedAt = undefined;
    job.error = undefined;
    job.attemptCount = (job.attemptCount || 0) + 1;

    if (!isContinuation) {
      this.activeJobHints = {
        testsPassed: false,
        audioInProgress: false,
        renderProgressPct: 0,
      };
    }

    const existingScan = scanProblemArtifacts(this.workspaceRoot, job.slug);
    const hasPartialWork =
      existingScan.hasSolutionTs ||
      existingScan.hasSolutionPy ||
      existingScan.hasCaptionsJson ||
      existingScan.hasIntroScene;

    const missingBefore = getMissingQualityChecklist(
      this.workspaceRoot,
      job.slug
    );

    const prompt =
      (isContinuation || hasPartialWork) && missingBefore.length > 0
        ? buildContinuationPrompt(job, missingBefore)
        : buildVisualLeetPrompt(job);

    const { command, args } = this.buildAgentCommand(job, prompt);

    job.currentAction = isContinuation
      ? `Đang tự động kiểm tra & hoàn thiện (${missingBefore.length} mục còn thiếu)...`
      : `Đang khởi chạy ${command} cho bài "${job.title}"...`;

    this.appendJobLog(
      job,
      "info",
      isContinuation
        ? `🔍 Auto-Heal Pass #${job.attemptCount}: Hoàn thiện ${missingBefore.length} hạng mục còn thiếu...`
        : `🚀 Bắt đầu tạo video cho "${job.title}" (slug: ${job.slug}) bằng ${command}${
            job.model !== "default" ? ` [${job.model}]` : ""
          }`
    );

    updateJobProgressFromArtifacts(job, existingScan, this.activeJobHints);
    this.emitUpdate();

    const child = spawn(command, args, {
      cwd: this.workspaceRoot,
      detached: true,
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.activeChild = child;
    job.pid = child.pid;
    this.emitUpdate();

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuffer += chunk.toString("utf-8");
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) {
        this.handleAgentOutputLine(job, line, false);
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderrBuffer += chunk.toString("utf-8");
      const lines = stderrBuffer.split(/\r?\n/);
      stderrBuffer = lines.pop() || "";
      for (const line of lines) {
        this.handleAgentOutputLine(job, line, true);
      }
    });

    child.on("error", (err) => {
      this.appendJobLog(
        job,
        "error",
        `Lỗi khởi chạy lệnh '${command}': ${err.message}`
      );
    });

    child.on("close", (code, signal) => {
      if (stdoutBuffer.trim()) {
        this.handleAgentOutputLine(job, stdoutBuffer, false);
      }
      if (stderrBuffer.trim()) {
        this.handleAgentOutputLine(job, stderrBuffer, true);
      }

      // If already cancelled via cancelJob(), don't overwrite status
      if (job.status === "cancelled") {
        this.activeChild = null;
        this.activeJobId = null;
        this.emitUpdate();
        this.processNextIfIdle();
        return;
      }

      const now = Date.now();
      if (job.startedAt) {
        job.accumulatedRunMs += now - job.startedAt;
      }

      const finalScan = scanProblemArtifacts(this.workspaceRoot, job.slug);
      updateJobProgressFromArtifacts(job, finalScan, this.activeJobHints);
      const missingAfter = getMissingQualityChecklist(
        this.workspaceRoot,
        job.slug
      );

      this.activeChild = null;
      this.activeJobId = null;
      job.pid = undefined;

      // Quality Gate check: Did all 5 phases complete and produce out/<slug>.mp4?
      if (missingAfter.length === 0 && finalScan.hasOutputMp4) {
        job.status = "completed";
        job.overallProgress = 100;
        job.completedAt = now;
        job.currentAction = `Hoàn tất xuất sắc out/${job.slug}.mp4 🏆`;
        updateJobProgressFromArtifacts(job, finalScan, {
          testsPassed: true,
          renderProgressPct: 100,
        });
        this.appendJobLog(
          job,
          "success",
          `🏆 Hoàn tất 100% cả 5 Phase! Video đã lưu tại out/${job.slug}.mp4`
        );

        if (this.pauseAfterCurrent) {
          this.queueRunning = false;
          this.pauseAfterCurrent = false;
        }

        this.emitUpdate();
        this.processNextIfIdle();
        return;
      }

      // Auto-Heal Continuation: If some items are still missing and we haven't exceeded max attempts
      if (
        missingAfter.length > 0 &&
        job.attemptCount < MAX_AUTO_HEAL_ATTEMPTS &&
        this.queueRunning &&
        signal !== "SIGTERM" &&
        signal !== "SIGKILL"
      ) {
        this.appendJobLog(
          job,
          "info",
          `⚠️ Phát hiện ${missingAfter.length} hạng mục chưa hoàn tất sau lượt #${job.attemptCount}. Tự động chạy lượt bổ sung để đảm bảo chất lượng 100%...`
        );
        this.runJob(job, true);
        return;
      }

      // Otherwise mark failed with clear diagnostic checklist
      job.status = "failed";
      job.error =
        missingAfter.length > 0
          ? `Chưa hoàn tất (${missingAfter.length} mục thiếu): ${missingAfter[0]}`
          : `Tiến trình kết thúc với mã lỗi ${code ?? signal}`;
      job.currentAction = `⚠ Chưa hoàn tất — bấm Retry để chạy tiếp từ bước hiện tại`;
      this.appendJobLog(job, "error", `❌ ${job.error}`);

      if (this.pauseAfterCurrent) {
        this.queueRunning = false;
        this.pauseAfterCurrent = false;
      }

      this.emitUpdate();
      this.processNextIfIdle();
    });
  }

  private handleAgentOutputLine(
    job: BatchJob,
    rawLine: string,
    isStderr: boolean
  ): void {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    // Strip ANSI escape sequences
    const cleanLine = trimmed.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").trim();
    if (!cleanLine) return;

    // Inspect raw output for Remotion render percentages or frame progress
    this.detectLiveHintsFromText(job, cleanLine);

    // Try parsing NDJSON / stream-json event
    if (cleanLine.startsWith("{") && cleanLine.endsWith("}")) {
      try {
        const evt = JSON.parse(cleanLine);
        this.processJsonStreamEvent(job, evt);
        return;
      } catch {
        // Fall through to plain text handling
      }
    }

    // Ignore spinner lines from CLI
    if (/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]\s/.test(cleanLine)) {
      return;
    }

    this.appendJobLog(
      job,
      isStderr ? "info" : "stdout",
      cleanLine.slice(0, 260)
    );
    this.emitUpdate();
  }

  private processJsonStreamEvent(
    job: BatchJob,
    evt: Record<string, any>
  ): void {
    // Capture conversation/session ID if present
    const convId =
      evt.conversation_id || evt.conversationId || evt.session_id || evt.sessionId;
    if (typeof convId === "string" && convId) {
      job.conversationId = convId;
    }

    // Extract tool calls from various agent stream-json schemas (agy / claude / codex)
    const toolCalls =
      evt.tool_calls ||
      evt.toolCalls ||
      (evt.type === "tool_use" ? [evt] : undefined) ||
      (evt.message?.content && Array.isArray(evt.message.content)
        ? evt.message.content.filter((c: any) => c.type === "tool_use")
        : undefined);

    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      for (const tc of toolCalls) {
        const name = tc.name || tc.tool_name || tc.function?.name || "tool";
        const args = tc.args || tc.input || tc.arguments || {};
        this.describeAndApplyToolCall(job, String(name), args);
      }
    }

    // Check thinking / reasoning text
    const thinking =
      evt.thinking ||
      (evt.type === "thinking" ? evt.text || evt.content : undefined);
    if (typeof thinking === "string" && thinking.trim()) {
      const firstLine = thinking.trim().split(/\r?\n/)[0].slice(0, 180);
      job.currentAction = `💭 ${firstLine}`;
      this.appendJobLog(job, "thought", firstLine);
    }

    // Check assistant content / text
    const content =
      typeof evt.content === "string"
        ? evt.content
        : typeof evt.text === "string"
        ? evt.text
        : typeof evt.result === "string"
        ? evt.result
        : undefined;

    if (content && content.trim()) {
      this.detectLiveHintsFromText(job, content);
      const summary = content.trim().split(/\r?\n/)[0].slice(0, 200);
      if (summary) {
        this.appendJobLog(job, "info", summary);
      }
    }

    const scan = scanProblemArtifacts(this.workspaceRoot, job.slug);
    updateJobProgressFromArtifacts(job, scan, this.activeJobHints);
    this.emitUpdate();
  }

  private describeAndApplyToolCall(
    job: BatchJob,
    toolName: string,
    args: Record<string, any>
  ): void {
    const filePath = String(
      args.Path || args.path || args.file_path || args.filePath || ""
    );
    const cmdLine = String(
      args.CommandLine || args.command || args.cmd || ""
    );
    const summary = String(args.toolSummary || args.description || "");

    if (filePath) {
      const shortPath = path.relative(this.workspaceRoot, filePath);
      job.currentAction = `📝 Đang ghi file: ${shortPath}`;
      this.appendJobLog(job, "tool", `🛠️ ${toolName}: ${shortPath}`);
      if (shortPath.includes("captionsData.json") || shortPath.includes("audio")) {
        this.activeJobHints.audioInProgress = true;
      }
      return;
    }

    if (cmdLine) {
      const shortCmd = cmdLine.split("\n")[0].slice(0, 140);
      job.currentAction = summary
        ? `⚡ ${summary}: ${shortCmd}`
        : `⚡ Chạy lệnh: ${shortCmd}`;
      this.appendJobLog(job, "tool", `⚡ ${shortCmd}`);

      if (/vitest|npm test|unittest|pytest|test_solution\.py/i.test(cmdLine)) {
        job.currentAction = "🧪 Đang chạy bộ kiểm thử Python (unittest / Vitest)...";
      } else if (/edge-tts|whisper|generate.*audio/i.test(cmdLine)) {
        this.activeJobHints.audioInProgress = true;
        job.currentAction =
          "🎙️ Đang tạo giọng đọc vi-VN-NamMinhNeural & căn chỉnh Whisper...";
      } else if (/remotion render/i.test(cmdLine)) {
        this.activeJobHints.renderProgressPct = Math.max(
          this.activeJobHints.renderProgressPct,
          15
        );
        job.currentAction = `🎬 Đang kết xuất video MP4 (out/${job.slug}.mp4)...`;
      } else if (/remotion still/i.test(cmdLine)) {
        job.currentAction = "🖼️ Đang kiểm tra chất lượng khung hình thumbnail...";
      }
      return;
    }

    job.currentAction = `🛠️ Đang gọi công cụ: ${toolName}`;
    this.appendJobLog(job, "tool", `🛠️ ${toolName}`);
  }

  private detectLiveHintsFromText(job: BatchJob, text: string): void {
    // Detect Python unittest ("Ran X tests ... OK") or Vitest pass
    if (
      /Test Files\s+\d+\s+passed/i.test(text) ||
      /Tests\s+\d+\s+passed/i.test(text) ||
      /Ran\s+\d+\s+tests?\s+in\s+[\d.]+s/i.test(text)
    ) {
      this.activeJobHints.testsPassed = true;
      job.currentAction = "✅ Python unit tests & stress test đã PASS 100%!";
    }

    // Detect Whisper / edge-tts progress
    if (/edge-tts|vi-VN-NamMinhNeural|whisper|captionsData\.json/i.test(text)) {
      this.activeJobHints.audioInProgress = true;
    }

    // Detect Remotion frame progress: e.g. "Rendered 450/2156" or "Encoded 1200/2156"
    const frameMatch = text.match(/(?:Rendered|Encoded|Stitching)\s+(\d+)\s*\/\s*(\d+)/i);
    if (frameMatch) {
      const current = parseInt(frameMatch[1], 10);
      const total = parseInt(frameMatch[2], 10);
      if (total > 0) {
        const pct = Math.min(99, Math.round((current / total) * 100));
        this.activeJobHints.renderProgressPct = Math.max(
          this.activeJobHints.renderProgressPct,
          pct
        );
        job.currentAction = `🎬 Đang render video: ${current}/${total} frames (${pct}%)`;
      }
    }
  }
}
