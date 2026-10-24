# visual-leet

Turn any LeetCode problem into a tested optimal solution and a short-form explainer video with a single prompt.

`visual-leet` combines an AI agent workflow with **Remotion**, **Edge TTS**, and **OpenAI Whisper** to automate the entire production pipeline—from writing the algorithm to rendering a 4:5 (`1080×1350`) vertical MP4 ready for TikTok, Reels, or Shorts.

---

## How It Works

When you pass a LeetCode link to your coding agent, it runs a 4-step pipeline:

1. **Solve & Test** — Writes the optimal solution in TypeScript (`solution.ts`) and Python (`solution.py`), then verifies it against edge cases and stress tests using **Vitest**.
2. **Voiceover & Word Alignment** — Generates a Vietnamese narration script, synthesizes audio via `edge-tts`, speeds it up with `ffmpeg`, and extracts exact word-level timestamps using **Whisper**.
3. **Visual Simulation** — Builds a 5-scene Remotion composition (`Intro` → `Intuition` → `Rules` → `Step-by-Step Trace` → `Complexity Summary`) timed dynamically to the audio track.
4. **Render** — Exports the final video to `out/<problem-slug>.mp4`.

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **FFmpeg** (`brew install ffmpeg` on macOS)
- Python audio/transcription packages:
  ```bash
  pip install edge-tts openai-whisper
  ```

---

## Getting Started

```bash
git clone https://github.com/nvkhuy/visual-leet.git
cd visual-leet
npm install
```

### Generate a Video

In your AI coding assistant (Antigravity, Cursor, or Claude Code), pass any LeetCode problem URL:

```text
/visual-leet https://leetcode.com/problems/maximal-square/description/
```

### Local Development Commands

```bash
# Run unit tests for generated solutions
npm test

# Open Remotion Studio at http://localhost:3000 to preview scenes
npm start

# Render a specific composition to MP4 manually
npx remotion render src/index.ts <CompositionId> out/<slug>.mp4
```

---

## Project Structure

```text
visual-leet/
├── .agents/skills/visual-leet/   # Agent workflow instructions (SKILL.md)
├── AGENTS.md                     # Workspace rules & video design specs
├── public/audio/                 # Reusable UI sound effects (sfx_*.mp3)
├── src/
│   ├── index.ts                  # Remotion entrypoint
│   ├── Root.tsx                  # Composition registry
│   ├── shared/                   # Reusable layout, caption & sketch components
│   └── problems/                 # Generated per-problem code & scenes (git-ignored)
└── out/                          # Rendered .mp4 outputs (git-ignored)
```

> **Note:** Generated problem folders (`src/problems/`), voiceover tracks, and rendered videos (`out/`) are ignored by Git so the repository stays clean as a reusable template.

---

## License

[MIT](./LICENSE)
