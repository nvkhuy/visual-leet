export type AgentProvider = "agy" | "claude" | "codex";

export type JobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type PhaseId =
  | "phase1_solution"
  | "phase2_tests"
  | "phase3_audio"
  | "phase4_scenes"
  | "phase5_render";

export type PhaseStatus = "pending" | "active" | "done" | "error";

export interface PhaseProgress {
  id: PhaseId;
  index: number;
  label: string;
  shortLabel: string;
  status: PhaseStatus;
  progress: number; // 0..100 within this phase
  detail: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  type: "info" | "tool" | "thought" | "stdout" | "error" | "success";
  text: string;
}

export interface ParsedProblemInput {
  rawInput: string;
  slug: string;
  title: string;
  problemNumber?: string;
  leetcodeUrl: string;
}

export interface BatchJob {
  id: string;
  rawInput: string;
  slug: string;
  title: string;
  problemNumber?: string;
  leetcodeUrl: string;
  agent: AgentProvider;
  model: string;
  status: JobStatus;
  overallProgress: number; // 0..100 across all 5 phases
  currentPhase: PhaseId;
  currentAction: string;
  phases: Record<PhaseId, PhaseProgress>;
  conversationId?: string;
  pid?: number;
  createdAt: number;
  startedAt?: number;
  pausedAt?: number;
  accumulatedRunMs: number;
  completedAt?: number;
  error?: string;
  videoFile?: string;
  videoDurationSec?: number;
  videoSizeBytes?: number;
  attemptCount: number;
  logs: LogEntry[];
}

export interface QueueStateSnapshot {
  queueRunning: boolean;
  pauseAfterCurrent: boolean;
  activeJobId: string | null;
  defaultAgent: AgentProvider;
  defaultModel: string;
  jobs: BatchJob[];
  serverTime: number;
}
