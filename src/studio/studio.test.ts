import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  ArtifactScanResult,
  deleteProblemArtifacts,
  findProblemAudioFiles,
  getMissingQualityChecklist,
  removeCompositionFromRoot,
  updateJobProgressFromArtifacts,
} from "./artifactInspector";
import {
  createInitialPhases,
  parseBatchInput,
  parseProblemInput,
  slugToTitle,
} from "./problemParser";
import {
  buildContinuationPrompt,
  buildVisualLeetPrompt,
} from "./promptBuilder";
import { BatchQueueManager } from "./queueManager";
import { BatchJob } from "./types";

describe("Visual-Leet Batch Studio", () => {
  it("parses single LeetCode URLs, numbered titles, and plain slugs accurately", () => {
    const p1 = parseProblemInput(
      "https://leetcode.com/problems/word-search-ii/description/?envType=study-plan"
    );
    expect(p1).toEqual({
      rawInput:
        "https://leetcode.com/problems/word-search-ii/description/?envType=study-plan",
      slug: "word-search-ii",
      title: "Word Search II",
      leetcodeUrl: "https://leetcode.com/problems/word-search-ii/description/",
    });

    const p2 = parseProblemInput("#146. LRU Cache");
    expect(p2).toEqual({
      rawInput: "#146. LRU Cache",
      slug: "lru-cache",
      title: "LRU Cache",
      problemNumber: "146",
      leetcodeUrl: "https://leetcode.com/problems/lru-cache/description/",
    });

    const p3 = parseProblemInput("Trapping Rain Water");
    expect(p3?.slug).toBe("trapping-rain-water");
    expect(p3?.title).toBe("Trapping Rain Water");
    expect(slugToTitle("course-schedule-ii")).toBe("Course Schedule II");
  });

  it("parses a batch of 5 problems and deduplicates duplicate slugs", () => {
    const batchText = `
      - https://leetcode.com/problems/trapping-rain-water/description/
      - 146. LRU Cache
      - https://leetcode.com/problems/coin-change/
      - number-of-islands
      - 207 - Course Schedule
      - https://leetcode.com/problems/lru-cache/
    `;
    const list = parseBatchInput(batchText);
    expect(list.map((i) => i.slug)).toEqual([
      "trapping-rain-water",
      "lru-cache",
      "coin-change",
      "number-of-islands",
      "course-schedule",
    ]);
  });

  it("computes weighted 5-phase progress from disk artifacts and live render hints", () => {
    const job: BatchJob = {
      id: "job-test",
      rawInput: "lru-cache",
      slug: "lru-cache",
      title: "LRU Cache",
      leetcodeUrl: "https://leetcode.com/problems/lru-cache/description/",
      agent: "agy",
      model: "default",
      status: "running",
      overallProgress: 0,
      currentPhase: "phase1_solution",
      currentAction: "Running",
      phases: createInitialPhases(),
      createdAt: Date.now(),
      accumulatedRunMs: 0,
      attemptCount: 1,
      logs: [],
    };

    const partialScan: ArtifactScanResult = {
      hasSolutionTs: true,
      hasSolutionPy: true,
      hasSolutionTestTs: true,
      hasCaptionsJson: true,
      captionsSceneCount: 5,
      hasIntroScene: true,
      hasIntuitionScene: true,
      hasRulesScene: true,
      hasSimulationScene: true,
      hasSummaryScene: true,
      hasSketchComponent: true,
      hasMainVideoComponent: true,
      registeredInRoot: true,
      hasOutputMp4: false,
      outputMp4SizeBytes: 0,
    };

    updateJobProgressFromArtifacts(job, partialScan, {
      testsPassed: true,
      renderProgressPct: 50,
    });

    // Phase 1 (15) + Phase 2 (15) + Phase 3 (25) + Phase 4 (25) + 50% of Phase 5 (10) = 90%
    expect(job.phases.phase1_solution.status).toBe("done");
    expect(job.phases.phase2_tests.status).toBe("done");
    expect(job.phases.phase3_audio.status).toBe("done");
    expect(job.phases.phase4_scenes.status).toBe("done");
    expect(job.phases.phase5_render.status).toBe("active");
    expect(job.overallProgress).toBe(90);
    expect(job.currentPhase).toBe("phase5_render");
  });

  it("builds self-contained prompts and continuation checklists for consistent quality", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vl-studio-"));
    const checklist = getMissingQualityChecklist(tmpDir, "coin-change");
    expect(checklist.length).toBeGreaterThan(5);

    const job: BatchJob = {
      id: "job-cc",
      rawInput: "322. Coin Change",
      slug: "coin-change",
      title: "Coin Change",
      problemNumber: "322",
      leetcodeUrl: "https://leetcode.com/problems/coin-change/description/",
      agent: "agy",
      model: "default",
      status: "queued",
      overallProgress: 0,
      currentPhase: "phase1_solution",
      currentAction: "",
      phases: createInitialPhases(),
      createdAt: Date.now(),
      accumulatedRunMs: 0,
      attemptCount: 0,
      logs: [],
    };

    const fullPrompt = buildVisualLeetPrompt(job);
    expect(fullPrompt).toContain(".agents/skills/visual-leet/SKILL.md");
    expect(fullPrompt).toContain("src/problems/coin-change/");
    expect(fullPrompt).toContain("out/coin-change.mp4");

    const contPrompt = buildContinuationPrompt(job, checklist.slice(0, 2));
    expect(contPrompt).toContain("Missing optimal Python solution");

    const qm = new BatchQueueManager(tmpDir);
    const added = qm.addBatchProblems(
      "trapping-rain-water\nlru-cache\ncoin-change\nnumber-of-islands",
      { autoStart: false }
    );
    expect(added).toHaveLength(4);
    expect(qm.getSnapshot().jobs.map((j) => j.slug)).toEqual([
      "trapping-rain-water",
      "lru-cache",
      "coin-change",
      "number-of-islands",
    ]);

    qm.moveJob(added[1].id, "up");
    expect(qm.getSnapshot().jobs[0].slug).toBe("lru-cache");

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("completely deletes all related problem files and Root.tsx registration on trash/remove", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vl-trash-test-"));
    const slug = "test-problem";

    // Setup mock workspace structure
    const problemDir = path.join(tmpDir, "src", "problems", slug);
    const videoDir = path.join(problemDir, "video");
    const audioDir = path.join(tmpDir, "public", "audio");
    const outDir = path.join(tmpDir, "out");
    const rootPath = path.join(tmpDir, "src", "Root.tsx");

    fs.mkdirSync(videoDir, { recursive: true });
    fs.mkdirSync(audioDir, { recursive: true });
    fs.mkdirSync(outDir, { recursive: true });

    // 1. Problem files
    fs.writeFileSync(path.join(problemDir, "solution.py"), "class Solution: pass");
    fs.writeFileSync(path.join(problemDir, "test_solution.py"), "import unittest");
    fs.writeFileSync(
      path.join(videoDir, "TestProblemVideo.tsx"),
      'export const TestProblemVideo = () => <Audio src={staticFile("audio/tp_scene1.mp3")} />;'
    );

    // 2. Audio files (specific and shared)
    fs.writeFileSync(path.join(audioDir, "tp_scene1_raw.mp3"), "dummy");
    fs.writeFileSync(path.join(audioDir, "tp_scene1.mp3"), "dummy");
    fs.writeFileSync(path.join(audioDir, "tp_scene2.mp3"), "dummy");
    fs.writeFileSync(path.join(audioDir, "other_scene1.mp3"), "dummy");
    fs.writeFileSync(path.join(audioDir, "sfx_ding.mp3"), "shared-ding");
    fs.writeFileSync(path.join(audioDir, "sfx_pop.mp3"), "shared-pop");

    // 3. Rendered video output
    fs.writeFileSync(path.join(outDir, `${slug}.mp4`), "dummy mp4 content");
    fs.writeFileSync(path.join(outDir, `${slug}-thumb.png`), "dummy thumb");
    fs.writeFileSync(path.join(outDir, "other.mp4"), "other mp4");

    // 4. Root.tsx with multiple compositions
    const rootInitialContent = `import React from "react";
import { Composition } from "remotion";
import { KeepMeVideo } from "./problems/keep-me/video/KeepMeVideo";
import {
  TestProblemVideo,
  TOTAL_FRAMES as TP_TOTAL_FRAMES,
} from "./problems/test-problem/video/TestProblemVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KeepMe"
        component={KeepMeVideo}
        durationInFrames={100}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="TestProblem"
        component={TestProblemVideo}
        durationInFrames={TP_TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
`;
    fs.writeFileSync(rootPath, rootInitialContent);

    // Test findProblemAudioFiles
    const detectedAudio = findProblemAudioFiles(tmpDir, slug);
    const baseNames = detectedAudio.map((f) => path.basename(f));
    expect(baseNames).toContain("tp_scene1.mp3");
    expect(baseNames).toContain("tp_scene1_raw.mp3");
    expect(baseNames).toContain("tp_scene2.mp3");
    expect(baseNames).not.toContain("other_scene1.mp3");
    expect(baseNames).not.toContain("sfx_ding.mp3");
    expect(baseNames).not.toContain("sfx_pop.mp3");

    // Test removeCompositionFromRoot
    const rootUpdated = removeCompositionFromRoot(tmpDir, slug);
    expect(rootUpdated).toBe(true);
    const updatedRoot = fs.readFileSync(rootPath, "utf-8");
    expect(updatedRoot).not.toContain("test-problem");
    expect(updatedRoot).not.toContain("TestProblemVideo");
    expect(updatedRoot).not.toContain("TP_TOTAL_FRAMES");
    expect(updatedRoot).toContain("KeepMeVideo");
    expect(updatedRoot).toContain('id="KeepMe"');

    // Test deleteProblemArtifacts
    const deleteResult = deleteProblemArtifacts(tmpDir, slug);
    expect(deleteResult.problemDirDeleted).toBe(true);
    expect(deleteResult.audioFilesDeleted).toContain("tp_scene1.mp3");
    expect(deleteResult.outputFilesDeleted).toContain(`${slug}.mp4`);
    expect(deleteResult.outputFilesDeleted).toContain(`${slug}-thumb.png`);

    // Verify disk state
    expect(fs.existsSync(problemDir)).toBe(false);
    expect(fs.existsSync(path.join(audioDir, "tp_scene1.mp3"))).toBe(false);
    expect(fs.existsSync(path.join(audioDir, "tp_scene1_raw.mp3"))).toBe(false);
    expect(fs.existsSync(path.join(audioDir, "other_scene1.mp3"))).toBe(true);
    expect(fs.existsSync(path.join(audioDir, "sfx_ding.mp3"))).toBe(true);
    expect(fs.existsSync(path.join(audioDir, "sfx_pop.mp3"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, `${slug}.mp4`))).toBe(false);
    expect(fs.existsSync(path.join(outDir, `${slug}-thumb.png`))).toBe(false);
    expect(fs.existsSync(path.join(outDir, "other.mp4"))).toBe(true);

    // Test queueManager removeJob integration
    const qm = new BatchQueueManager(tmpDir);
    const added = qm.addBatchProblems(slug, { autoStart: false });
    expect(added).toHaveLength(1);
    const jobId = added[0].id;

    // Create a mock file in problemDir to verify removeJob deletes it
    fs.mkdirSync(problemDir, { recursive: true });
    fs.writeFileSync(path.join(problemDir, "solution.py"), "code");

    const removeRes = qm.removeJob(jobId);
    expect(removeRes.ok).toBe(true);
    expect(removeRes.deleted?.problemDirDeleted).toBe(true);
    expect(qm.getSnapshot().jobs.find((j) => j.id === jobId)).toBeUndefined();
    expect(fs.existsSync(problemDir)).toBe(false);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
