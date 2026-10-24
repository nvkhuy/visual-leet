# Visual LeetCode Workspace Rules

When the user provides a LeetCode link (e.g., `https://leetcode.com/problems/...`) or asks to solve and visualize an algorithm, follow `.agents/skills/visual-leet/SKILL.md`:

1. **Self-Contained Execution**:
   - Do not depend on existing problem folders in `src/problems/` (they are git-ignored and may be deleted at any time).
   - Always import shared motion and sketch primitives from `src/shared/` (`TypographyHeader`, `PopupCaption`, `PopupWord`, `whipIn`, `whipInX`, `SketchBackground`).
2. **Solve & Test Rigorously**:
   - Write optimal, well-documented solutions in `src/problems/<slug>/solution.ts` and `src/problems/<slug>/solution.py`.
   - Write comprehensive unit and stress tests in `src/problems/<slug>/solution.test.ts` and verify they pass via `npm test`.
3. **Vietnamese Neural Voiceover & Semantic Single-Word Captions**:
   - Synthesize voiceover using `vi-VN-NamMinhNeural` (`edge-tts` with retry loop), accelerated via `ffmpeg` (`atempo=1.30,volume=1.3`) into `public/audio/`.
   - **Keep full punctuation (`.`, `,`, `:`) in the TTS input text** so the narrator pauses naturally between clauses and simulation steps; strip punctuation only when tokenizing words for 1-to-1 Whisper alignment (`word_timestamps=True, language="vi"`).
   - Smooth micro-gaps `<= 7 frames`, but preserve natural sentence pauses `> 7 frames`.
   - Color words semantically (`#FFE600` core concepts, `#EF4444` brute-force/bottlenecks, `#4ADE80` optimal/completion, `#38BDF8` data structures/steps, `#C084FC` numbers/complexity, `#FFFFFF` connectors).
4. **4:5 Vertical Video (`1080 × 1350`, Dynamic Duration)**:
   - Dynamically size each `<Sequence>` and total `durationInFrames` from actual `ffprobe` audio durations (`round(duration * 30) + 15`).
   - **First-Frame Thumbnail (`frame === 0`)**: In `IntroScene`, set `effectiveFrame = frame === 0 ? 200 : frame` and hide `PopupCaption` at `frame === 0`. Keep the channel badge (`"▲ Leetcode Mô Phỏng · Problem #<ID>"`) and official English LeetCode Problem ID and Title.
   - **Layout Budget**: Anchor the `990px` main content container below `TypographyHeader` (`marginTop: "20px..24px"`, never `margin: "auto 0"` with small floating cards) and use `whiteSpace: "nowrap"` on badges/status pills so text never wraps awkwardly.
   - **5-Scene Architecture**: `IntroScene` ➔ `IntuitionScene` ➔ `RulesScene` ➔ `SimulationScene` (with stepper bar, data-structure sketch, visual legend, 2-phase steps, action banner, and SFX) ➔ `SummaryScene`.
5. **Render & Verify**:
   - Render to `out/<slug>.mp4`, verify streams with `ffprobe`, and report the solution, test results, and video path.
