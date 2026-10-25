import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { createInitialPhases, slugToTitle } from "./problemParser";
import { BatchJob, PhaseId, PhaseProgress } from "./types";

export interface ArtifactScanResult {
  hasSolutionTs: boolean;
  hasSolutionPy: boolean;
  hasSolutionTestTs: boolean;
  hasCaptionsJson: boolean;
  captionsSceneCount: number;
  hasIntroScene: boolean;
  hasIntuitionScene: boolean;
  hasRulesScene: boolean;
  hasSimulationScene: boolean;
  hasSummaryScene: boolean;
  hasSketchComponent: boolean;
  hasMainVideoComponent: boolean;
  registeredInRoot: boolean;
  hasOutputMp4: boolean;
  outputMp4SizeBytes: number;
  outputMp4DurationSec?: number;
}

const durationCache = new Map<string, { mtimeMs: number; durationSec: number }>();

export function probeVideoDurationSec(mp4Path: string): number | undefined {
  try {
    if (!fs.existsSync(mp4Path)) return undefined;
    const stat = fs.statSync(mp4Path);
    if (stat.size < 50_000) return undefined;

    const cached = durationCache.get(mp4Path);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.durationSec;
    }

    const out = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        mp4Path,
      ],
      { encoding: "utf-8", timeout: 4000 }
    ).trim();

    const durationSec = parseFloat(out);
    if (!Number.isNaN(durationSec) && durationSec > 0) {
      durationCache.set(mp4Path, { mtimeMs: stat.mtimeMs, durationSec });
      return durationSec;
    }
  } catch {
    // Ignore ffprobe errors while file is still being written
  }
  return undefined;
}

export function scanProblemArtifacts(
  workspaceRoot: string,
  slug: string
): ArtifactScanResult {
  const problemDir = path.join(workspaceRoot, "src", "problems", slug);
  const videoDir = path.join(problemDir, "video");
  const sketchDir = path.join(videoDir, "sketch");
  const mp4Path = path.join(workspaceRoot, "out", `${slug}.mp4`);
  const rootTsxPath = path.join(workspaceRoot, "src", "Root.tsx");

  const hasSolutionTs = fs.existsSync(path.join(problemDir, "solution.ts"));
  const hasSolutionPy = fs.existsSync(path.join(problemDir, "solution.py"));
  const hasSolutionTestTs =
    fs.existsSync(path.join(problemDir, "test_solution.py")) ||
    fs.existsSync(path.join(problemDir, "solution.test.ts"));

  let hasCaptionsJson = false;
  let captionsSceneCount = 0;
  const captionsPath = path.join(videoDir, "captionsData.json");
  if (fs.existsSync(captionsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(captionsPath, "utf-8"));
      const keys = ["1", "2", "3", "4", "5"].filter(
        (k) => Array.isArray(data[k]) && data[k].length > 0
      );
      captionsSceneCount = keys.length;
      hasCaptionsJson = captionsSceneCount === 5;
    } catch {
      hasCaptionsJson = false;
    }
  }

  let videoFiles: string[] = [];
  if (fs.existsSync(videoDir)) {
    try {
      videoFiles = fs.readdirSync(videoDir);
    } catch {
      videoFiles = [];
    }
  }

  const hasIntroScene = videoFiles.some((f) => /IntroScene\.tsx$/i.test(f));
  const hasIntuitionScene = videoFiles.some((f) =>
    /IntuitionScene\.tsx$/i.test(f)
  );
  const hasRulesScene = videoFiles.some((f) => /RulesScene\.tsx$/i.test(f));
  const hasSimulationScene = videoFiles.some((f) =>
    /SimulationScene\.tsx$/i.test(f)
  );
  const hasSummaryScene = videoFiles.some((f) => /SummaryScene\.tsx$/i.test(f));
  const hasMainVideoComponent = videoFiles.some((f) => /Video\.tsx$/i.test(f));

  let hasSketchComponent = false;
  if (fs.existsSync(sketchDir)) {
    try {
      const sketchFiles = fs.readdirSync(sketchDir);
      hasSketchComponent = sketchFiles.some((f) => f.endsWith(".tsx"));
    } catch {
      hasSketchComponent = false;
    }
  }

  let registeredInRoot = false;
  if (fs.existsSync(rootTsxPath)) {
    try {
      const rootContent = fs.readFileSync(rootTsxPath, "utf-8");
      registeredInRoot = rootContent.includes(`problems/${slug}/`);
    } catch {
      registeredInRoot = false;
    }
  }

  let hasOutputMp4 = false;
  let outputMp4SizeBytes = 0;
  let outputMp4DurationSec: number | undefined;

  if (fs.existsSync(mp4Path)) {
    try {
      const stat = fs.statSync(mp4Path);
      outputMp4SizeBytes = stat.size;
      if (stat.size > 100_000) {
        outputMp4DurationSec = probeVideoDurationSec(mp4Path);
        hasOutputMp4 = outputMp4DurationSec !== undefined && outputMp4DurationSec > 5;
      }
    } catch {
      hasOutputMp4 = false;
    }
  }

  return {
    hasSolutionTs,
    hasSolutionPy,
    hasSolutionTestTs,
    hasCaptionsJson,
    captionsSceneCount,
    hasIntroScene,
    hasIntuitionScene,
    hasRulesScene,
    hasSimulationScene,
    hasSummaryScene,
    hasSketchComponent,
    hasMainVideoComponent,
    registeredInRoot,
    hasOutputMp4,
    outputMp4SizeBytes,
    outputMp4DurationSec,
  };
}

/**
 * Updates a job's 5 phases and overallProgress based on its disk artifacts and live render progress.
 */
export function updateJobProgressFromArtifacts(
  job: BatchJob,
  scan: ArtifactScanResult,
  liveHints?: {
    testsPassed?: boolean;
    audioInProgress?: boolean;
    renderProgressPct?: number;
  }
): void {
  const phases: Record<PhaseId, PhaseProgress> = {
    phase1_solution: { ...job.phases.phase1_solution },
    phase2_tests: { ...job.phases.phase2_tests },
    phase3_audio: { ...job.phases.phase3_audio },
    phase4_scenes: { ...job.phases.phase4_scenes },
    phase5_render: { ...job.phases.phase5_render },
  };

  const isRunning = job.status === "running" || job.status === "paused";

  // Phase 1: Solution (Python only — 100% consistent)
  if (scan.hasSolutionPy) {
    phases.phase1_solution.status = "done";
    phases.phase1_solution.progress = 100;
    phases.phase1_solution.detail = "solution.py hoàn tất ✓";
  } else if (isRunning) {
    phases.phase1_solution.status = "active";
    phases.phase1_solution.progress = Math.max(
      phases.phase1_solution.progress,
      20
    );
    phases.phase1_solution.detail = "Đang thiết kế thuật toán tối ưu (solution.py)...";
  }

  // Phase 2: Unit Tests
  const phase3OrLaterStarted =
    scan.captionsSceneCount > 0 ||
    scan.hasIntroScene ||
    scan.hasMainVideoComponent ||
    scan.hasOutputMp4 ||
    Boolean(liveHints?.audioInProgress);

  if (
    scan.hasSolutionTestTs &&
    (liveHints?.testsPassed || phase3OrLaterStarted || job.status === "completed")
  ) {
    phases.phase2_tests.status = "done";
    phases.phase2_tests.progress = 100;
    phases.phase2_tests.detail = "Vitest unit & stress tests PASS ✓";
  } else if (scan.hasSolutionTestTs) {
    phases.phase2_tests.status = isRunning ? "active" : "pending";
    phases.phase2_tests.progress = 65;
    phases.phase2_tests.detail = "Đã tạo solution.test.ts, đang chạy Vitest...";
  } else if (phases.phase1_solution.status === "done" && isRunning) {
    phases.phase2_tests.status = "active";
    phases.phase2_tests.progress = 20;
    phases.phase2_tests.detail = "Đang viết bộ test cases & stress test...";
  }

  // Phase 3: Voiceover & Whisper Captions
  if (scan.hasCaptionsJson) {
    phases.phase3_audio.status = "done";
    phases.phase3_audio.progress = 100;
    phases.phase3_audio.detail = "5/5 giọng đọc & Whisper word-level captions ✓";
  } else if (scan.captionsSceneCount > 0 || liveHints?.audioInProgress) {
    phases.phase3_audio.status = isRunning ? "active" : "pending";
    const pct =
      scan.captionsSceneCount > 0
        ? Math.round((scan.captionsSceneCount / 5) * 90)
        : Math.max(phases.phase3_audio.progress, 35);
    phases.phase3_audio.progress = pct;
    phases.phase3_audio.detail =
      scan.captionsSceneCount > 0
        ? `Đã căn chỉnh ${scan.captionsSceneCount}/5 cảnh Whisper...`
        : "Đang tổng hợp giọng đọc vi-VN-NamMinhNeural & chạy Whisper...";
  } else if (phases.phase2_tests.status === "done" && isRunning) {
    phases.phase3_audio.status = "active";
    phases.phase3_audio.progress = 15;
    phases.phase3_audio.detail = "Đang soạn kịch bản 5 cảnh & tạo voiceover...";
  }

  // Phase 4: 5-Scene Remotion UI & Sketch
  const sceneItems = [
    scan.hasIntroScene,
    scan.hasIntuitionScene,
    scan.hasRulesScene,
    scan.hasSimulationScene,
    scan.hasSummaryScene,
    scan.hasSketchComponent,
    scan.hasMainVideoComponent,
  ];
  const completedSceneItems = sceneItems.filter(Boolean).length;
  const totalSceneItems = sceneItems.length; // 7

  if (completedSceneItems === totalSceneItems && scan.registeredInRoot) {
    phases.phase4_scenes.status = "done";
    phases.phase4_scenes.progress = 100;
    phases.phase4_scenes.detail = "Đủ 5 Scenes + Sketch + đăng ký Root.tsx ✓";
  } else if (completedSceneItems > 0) {
    phases.phase4_scenes.status = isRunning ? "active" : "pending";
    phases.phase4_scenes.progress = Math.round(
      (completedSceneItems / (totalSceneItems + 1)) * 100
    );
    const builtScenes = [
      scan.hasIntroScene && "Intro",
      scan.hasIntuitionScene && "Intuition",
      scan.hasRulesScene && "Rules",
      scan.hasSimulationScene && "Simulation",
      scan.hasSummaryScene && "Summary",
      scan.hasSketchComponent && "Sketch",
    ].filter(Boolean);
    phases.phase4_scenes.detail = `Đã dựng ${builtScenes.length}/6 components (${builtScenes.join(", ")})`;
  } else if (phases.phase3_audio.status === "done" && isRunning) {
    phases.phase4_scenes.status = "active";
    phases.phase4_scenes.progress = 15;
    phases.phase4_scenes.detail = "Đang thiết kế 5 cảnh 1080×1350 & Sketch...";
  }

  // Phase 5: Render MP4 & Verification
  if (scan.hasOutputMp4) {
    phases.phase5_render.status = "done";
    phases.phase5_render.progress = 100;
    const durText = scan.outputMp4DurationSec
      ? `${scan.outputMp4DurationSec.toFixed(1)}s`
      : "";
    const mbText = `${(scan.outputMp4SizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    phases.phase5_render.detail = `out/${job.slug}.mp4 (${[durText, mbText]
      .filter(Boolean)
      .join(" · ")}) ✓`;
    job.videoFile = `out/${job.slug}.mp4`;
    job.videoSizeBytes = scan.outputMp4SizeBytes;
    job.videoDurationSec = scan.outputMp4DurationSec;
  } else if (
    liveHints?.renderProgressPct !== undefined &&
    liveHints.renderProgressPct > 0
  ) {
    phases.phase5_render.status = isRunning ? "active" : "pending";
    phases.phase5_render.progress = Math.min(
      99,
      Math.max(phases.phase5_render.progress, liveHints.renderProgressPct)
    );
    phases.phase5_render.detail = `Đang render MP4: ${phases.phase5_render.progress}%`;
  } else if (phases.phase4_scenes.status === "done" && isRunning) {
    phases.phase5_render.status = "active";
    phases.phase5_render.progress = Math.max(phases.phase5_render.progress, 10);
    phases.phase5_render.detail = "Đang kiểm tra thumbnail & render MP4...";
  }

  // Compute weighted overall progress across all 5 phases:
  // Phase 1: 15%, Phase 2: 15%, Phase 3: 25%, Phase 4: 25%, Phase 5: 20%
  const weights: Record<PhaseId, number> = {
    phase1_solution: 0.15,
    phase2_tests: 0.15,
    phase3_audio: 0.25,
    phase4_scenes: 0.25,
    phase5_render: 0.2,
  };

  let weightedSum = 0;
  let activePhase: PhaseId = "phase1_solution";

  const order: PhaseId[] = [
    "phase1_solution",
    "phase2_tests",
    "phase3_audio",
    "phase4_scenes",
    "phase5_render",
  ];

  for (const pid of order) {
    weightedSum += phases[pid].progress * weights[pid];
    if (phases[pid].status === "active") {
      activePhase = pid;
    } else if (phases[pid].status === "done" && pid !== "phase5_render") {
      const nextIdx = order.indexOf(pid) + 1;
      activePhase = order[nextIdx];
    } else if (pid === "phase5_render" && phases[pid].status === "done") {
      activePhase = "phase5_render";
    }
  }

  job.phases = phases;
  job.currentPhase = activePhase;
  if (scan.hasOutputMp4 && job.status === "completed") {
    job.overallProgress = 100;
  } else {
    job.overallProgress = Math.min(99, Math.round(weightedSum));
  }
}

/**
 * Returns a list of missing deliverables if any of the 5 phases are incomplete.
 * Empty array means the problem has passed all quality gates.
 */
export function getMissingQualityChecklist(
  workspaceRoot: string,
  slug: string
): string[] {
  const scan = scanProblemArtifacts(workspaceRoot, slug);
  const missing: string[] = [];

  if (!scan.hasSolutionPy) {
    missing.push(`Missing optimal Python solution: src/problems/${slug}/solution.py`);
  }
  if (!scan.hasSolutionTestTs) {
    missing.push(
      `Missing unit test suite: src/problems/${slug}/test_solution.py (or solution.test.ts)`
    );
  }
  if (!scan.hasCaptionsJson) {
    missing.push(
      `Missing or incomplete 5-scene Whisper captions: src/problems/${slug}/video/captionsData.json (found ${scan.captionsSceneCount}/5 scenes)`
    );
  }
  if (!scan.hasIntroScene) {
    missing.push(`Missing Scene 1 (*IntroScene.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.hasIntuitionScene) {
    missing.push(`Missing Scene 2 (*IntuitionScene.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.hasRulesScene) {
    missing.push(`Missing Scene 3 (*RulesScene.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.hasSimulationScene) {
    missing.push(`Missing Scene 4 (*SimulationScene.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.hasSummaryScene) {
    missing.push(`Missing Scene 5 (*SummaryScene.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.hasSketchComponent) {
    missing.push(`Missing interactive sketch component in src/problems/${slug}/video/sketch/`);
  }
  if (!scan.hasMainVideoComponent) {
    missing.push(`Missing main video composition (*Video.tsx) in src/problems/${slug}/video/`);
  }
  if (!scan.registeredInRoot) {
    missing.push(`Composition for ${slug} is not registered in src/Root.tsx`);
  }
  if (!scan.hasOutputMp4) {
    missing.push(`Missing rendered MP4 video at out/${slug}.mp4`);
  }

  return missing;
}

/**
 * Discovers already-generated problems in `src/problems/` and `out/*.mp4`
 * so the user sees their existing library on first launch.
 */
export function discoverExistingProblems(workspaceRoot: string): BatchJob[] {
  const problemsDir = path.join(workspaceRoot, "src", "problems");
  const outDir = path.join(workspaceRoot, "out");
  const slugs = new Set<string>();

  if (fs.existsSync(problemsDir)) {
    for (const entry of fs.readdirSync(problemsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        slugs.add(entry.name);
      }
    }
  }

  if (fs.existsSync(outDir)) {
    for (const file of fs.readdirSync(outDir)) {
      if (file.endsWith(".mp4") && !file.startsWith(".")) {
        slugs.add(file.replace(/\.mp4$/, ""));
      }
    }
  }

  const discovered: BatchJob[] = [];
  for (const slug of slugs) {
    const scan = scanProblemArtifacts(workspaceRoot, slug);
    const mp4Path = path.join(outDir, `${slug}.mp4`);
    let mtimeMs = Date.now();
    if (fs.existsSync(mp4Path)) {
      try {
        mtimeMs = fs.statSync(mp4Path).mtimeMs;
      } catch {
        // ignore
      }
    }

    const isComplete = scan.hasOutputMp4;
    const job: BatchJob = {
      id: `job-${slug}`,
      rawInput: `https://leetcode.com/problems/${slug}/description/`,
      slug,
      title: slugToTitle(slug),
      leetcodeUrl: `https://leetcode.com/problems/${slug}/description/`,
      agent: "agy",
      model: "default",
      status: isComplete ? "completed" : "queued",
      overallProgress: isComplete ? 100 : 0,
      currentPhase: isComplete ? "phase5_render" : "phase1_solution",
      currentAction: isComplete
        ? `Hoàn tất kết xuất out/${slug}.mp4 🏆`
        : "Đã phát hiện thư mục bài toán trong workspace",
      phases: createInitialPhases(),
      createdAt: mtimeMs,
      completedAt: isComplete ? mtimeMs : undefined,
      accumulatedRunMs: 0,
      videoFile: scan.hasOutputMp4 ? `out/${slug}.mp4` : undefined,
      videoDurationSec: scan.outputMp4DurationSec,
      videoSizeBytes: scan.outputMp4SizeBytes || undefined,
      attemptCount: 1,
      logs: [
        {
          id: 1,
          timestamp: new Date(mtimeMs).toLocaleTimeString("vi-VN"),
          type: isComplete ? "success" : "info",
          text: isComplete
            ? `Đã đồng bộ video có sẵn: out/${slug}.mp4`
            : `Đã phát hiện thư mục bài toán src/problems/${slug}`,
        },
      ],
    };

    updateJobProgressFromArtifacts(job, scan, { testsPassed: isComplete });
    if (isComplete) {
      job.overallProgress = 100;
    }
    discovered.push(job);
  }

  return discovered.sort((a, b) => b.createdAt - a.createdAt);
}

export interface DeleteArtifactsResult {
  slug: string;
  problemDirDeleted: boolean;
  audioFilesDeleted: string[];
  outputFilesDeleted: string[];
  rootUpdated: boolean;
}

export const PRESERVED_AUDIO_FILES = new Set([
  "sfx_ding.mp3",
  "sfx_pop.mp3",
  "sfx_push.mp3",
  "sfx_success.mp3",
  ".gitkeep",
]);

/**
 * Finds all audio files in public/audio generated specifically for this problem.
 * Preserves shared SFX files (sfx_*.mp3).
 */
export function findProblemAudioFiles(
  workspaceRoot: string,
  slug: string
): string[] {
  const publicAudioDir = path.join(workspaceRoot, "public", "audio");
  if (!fs.existsSync(publicAudioDir)) return [];

  const targetFiles = new Set<string>();

  // 1. Direct subfolder public/audio/<slug>
  const slugSubDir = path.join(publicAudioDir, slug);
  if (fs.existsSync(slugSubDir)) {
    targetFiles.add(slugSubDir);
  }

  // 2. Scan problem directory files to extract exact audio filenames and prefixes
  const problemDir = path.join(workspaceRoot, "src", "problems", slug);
  const prefixes = new Set<string>();

  prefixes.add(slug);
  prefixes.add(slug.replace(/-/g, "_"));
  const acronym = slug
    .split("-")
    .map((p) => p[0])
    .join("");
  if (acronym.length >= 2) {
    prefixes.add(acronym);
  }

  if (fs.existsSync(problemDir)) {
    const scanDir = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (
            entry.isDirectory() &&
            entry.name !== "__pycache__" &&
            entry.name !== "node_modules"
          ) {
            scanDir(fullPath);
          } else if (
            entry.isFile() &&
            /\.(tsx?|jsx?|json|py)$/i.test(entry.name)
          ) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              const matches = content.matchAll(
                /(?:audio\/|staticFile\([^)]*audio\/)([a-zA-Z0-9_\-\.]+\.mp3)/g
              );
              for (const m of matches) {
                const fname = m[1];
                if (
                  !PRESERVED_AUDIO_FILES.has(fname) &&
                  !fname.startsWith("sfx_")
                ) {
                  targetFiles.add(path.join(publicAudioDir, fname));
                  const prefixMatch = fname.match(/^([a-zA-Z0-9_\-]+)_scene/i);
                  if (prefixMatch) {
                    prefixes.add(prefixMatch[1]);
                  }
                }
              }
            } catch {
              // ignore read errors
            }
          }
        }
      } catch {
        // ignore dir errors
      }
    };
    scanDir(problemDir);
  }

  // 3. Scan public/audio directory for files matching any of the prefixes
  try {
    const audioEntries = fs.readdirSync(publicAudioDir, {
      withFileTypes: true,
    });
    for (const entry of audioEntries) {
      if (entry.isDirectory()) {
        if (entry.name === slug || prefixes.has(entry.name)) {
          targetFiles.add(path.join(publicAudioDir, entry.name));
        }
        continue;
      }
      const fname = entry.name;
      if (PRESERVED_AUDIO_FILES.has(fname) || fname.startsWith("sfx_")) {
        continue;
      }

      for (const prefix of prefixes) {
        if (!prefix || prefix.length < 2) continue;
        const lowerFname = fname.toLowerCase();
        const lowerPrefix = prefix.toLowerCase();
        if (
          lowerFname.startsWith(`${lowerPrefix}_`) ||
          lowerFname.startsWith(`${lowerPrefix}-`) ||
          lowerFname.startsWith(`${lowerPrefix}.`) ||
          lowerFname === `${lowerPrefix}.mp3`
        ) {
          targetFiles.add(path.join(publicAudioDir, fname));
          break;
        }
      }
    }
  } catch {
    // ignore
  }

  return Array.from(targetFiles);
}

/**
 * Cleanly removes composition imports and <Composition ...> blocks for a slug from src/Root.tsx.
 */
export function removeCompositionFromRoot(
  workspaceRoot: string,
  slug: string
): boolean {
  const rootTsxPath = path.join(workspaceRoot, "src", "Root.tsx");
  if (!fs.existsSync(rootTsxPath)) return false;

  try {
    const code = fs.readFileSync(rootTsxPath, "utf-8");
    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const slugRegex = new RegExp(
      `import(?:(?!import)[\\s\\S])*?from\\s+["'][^"'\\n]*problems/${escapedSlug}[^"'\\n]*["'];?\\r?\\n?`,
      "g"
    );

    const importedIdentifiers = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = slugRegex.exec(code)) !== null) {
      const importStmt = match[0];
      const braceMatch = importStmt.match(/import\s*\{([\s\S]*?)\}\s*from/);
      if (braceMatch) {
        braceMatch[1].split(",").forEach((item) => {
          const parts = item.trim().split(/\s+as\s+/);
          const localId = (parts.length > 1 ? parts[1] : parts[0]).trim();
          if (localId) importedIdentifiers.add(localId);
        });
      } else {
        const defaultMatch = importStmt.match(
          /import\s+([a-zA-Z0-9_$]+)\s+from/
        );
        if (defaultMatch) importedIdentifiers.add(defaultMatch[1].trim());
      }
    }

    let newCode = code.replace(slugRegex, "");

    const pascalSlug = slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
    const compRegex =
      /^[ \t]*<Composition\b[\s\S]*?(?:\/>|<\/Composition>)\r?\n?/gm;

    newCode = newCode.replace(compRegex, (compBlock) => {
      let shouldRemove = false;
      for (const id of importedIdentifiers) {
        if (new RegExp(`\\b${id}\\b`).test(compBlock)) {
          shouldRemove = true;
          break;
        }
      }
      if (
        new RegExp(`id=["']${pascalSlug}["']`).test(compBlock) ||
        new RegExp(`id=["']${escapedSlug}["']`).test(compBlock) ||
        compBlock.includes(`problems/${slug}`)
      ) {
        shouldRemove = true;
      }
      return shouldRemove ? "" : compBlock;
    });

    newCode = newCode.replace(/\n{3,}/g, "\n\n");

    if (newCode !== code) {
      fs.writeFileSync(rootTsxPath, newCode, "utf-8");
      return true;
    }
  } catch (err) {
    console.error(`Error updating src/Root.tsx for slug ${slug}:`, err);
  }

  return false;
}

/**
 * Completely purges all files and registrations related to a video problem:
 * 1. Problem source code & tests (`src/problems/<slug>/`)
 * 2. Generated voiceovers (`public/audio/<prefix>_scene*.mp3`, `public/audio/<slug>/`)
 * 3. Rendered MP4 output & temporary checks (`out/<slug>.mp4`, `out/<slug>*.png`)
 * 4. Remotion composition registration (`src/Root.tsx`)
 */
export function deleteProblemArtifacts(
  workspaceRoot: string,
  slug: string
): DeleteArtifactsResult {
  const result: DeleteArtifactsResult = {
    slug,
    problemDirDeleted: false,
    audioFilesDeleted: [],
    outputFilesDeleted: [],
    rootUpdated: false,
  };

  // 1. Delete audio files
  const audioFiles = findProblemAudioFiles(workspaceRoot, slug);
  for (const audioPath of audioFiles) {
    try {
      if (fs.existsSync(audioPath)) {
        const stat = fs.statSync(audioPath);
        if (stat.isDirectory()) {
          fs.rmSync(audioPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(audioPath);
        }
        result.audioFilesDeleted.push(path.basename(audioPath));
      }
    } catch (err) {
      console.error(`Failed to delete audio file ${audioPath}:`, err);
    }
  }

  // 2. Delete problem directory in src/problems/<slug>
  const problemDir = path.join(workspaceRoot, "src", "problems", slug);
  if (fs.existsSync(problemDir)) {
    try {
      fs.rmSync(problemDir, { recursive: true, force: true });
      result.problemDirDeleted = true;
    } catch (err) {
      console.error(`Failed to delete problem dir ${problemDir}:`, err);
    }
  }

  // 3. Delete rendered video & stills in out/
  const outDir = path.join(workspaceRoot, "out");
  if (fs.existsSync(outDir)) {
    try {
      const outEntries = fs.readdirSync(outDir);
      for (const entry of outEntries) {
        if (
          entry === `${slug}.mp4` ||
          entry.startsWith(`${slug}.`) ||
          entry.startsWith(`${slug}_`) ||
          entry.startsWith(`${slug}-`)
        ) {
          const filePath = path.join(outDir, entry);
          try {
            fs.unlinkSync(filePath);
            durationCache.delete(filePath);
            result.outputFilesDeleted.push(entry);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. Remove composition from src/Root.tsx
  result.rootUpdated = removeCompositionFromRoot(workspaceRoot, slug);

  return result;
}
