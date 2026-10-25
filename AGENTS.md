# Visual LeetCode Workspace Rules

When the user provides a LeetCode link (e.g., `https://leetcode.com/problems/...`) or asks to solve and visualize an algorithm, follow `.agents/skills/visual-leet/SKILL.md`:

1. **Self-Contained Execution & Clean-Slate Lifecycle**:
   - Do not depend on existing problem folders in `src/problems/` (they are git-ignored and may be deleted or regenerated at any time).
   - Each problem is strictly isolated to 4 artifact locations:
     1. Source & tests: `src/problems/<slug>/`
     2. Voiceover audio: `public/audio/<prefix>_scene*.mp3` or `public/audio/<slug>/` (shared `public/audio/sfx_*.mp3` are strictly preserved)
     3. Video output: `out/<slug>.mp4` (and temporary check stills)
     4. Remotion registration: `src/Root.tsx`
   - When a video is trashed or removed via the Batch Studio UI (or CLI), all 4 artifact locations must be completely purged from disk so subsequent generations start 100% fresh with zero stale context.
   - Always import shared motion and sketch primitives from `src/shared/` (`TypographyHeader`, `PopupCaption`, `PopupWord`, `whipIn`, `whipInX`, `SketchBackground`).
2. **Solve & Test Rigorously (100% Python Consistency)**:
   - Write optimal, well-documented **Python 3** solutions exclusively in `src/problems/<slug>/solution.py` (do **not** create `solution.ts`).
   - All code snippets, formula pills, variable names (`snake_case`), and code traces displayed across all 5 video scenes (`RulesScene`, `SimulationScene`, `SummaryScene`) must strictly use **Python** syntax (`def`, `min()`, `max()`, `len()`, `#` comments—never mix JS/TS syntax).
   - Write comprehensive Python unit and stress tests in `src/problems/<slug>/test_solution.py` (plus a Vitest runner bridge in `src/problems/<slug>/solution.test.ts`) and verify they pass via `python3 -m unittest` and `npm test`.
3. **Vietnamese Neural Voiceover & The 2-Second Curiosity Hook**:
   - Synthesize voiceover using `vi-VN-NamMinhNeural` (`edge-tts` with retry loop), accelerated via `ffmpeg` (`atempo=1.30,volume=1.3`) into `public/audio/`.
   - **The 2-Second Curiosity Hook (Strictly Mandatory for Scene 1)**: First 2 seconds (`0..60` frames) must NEVER start with dry/generic textbook greetings (e.g. ❌ *"Hôm nay chúng ta giải bài toán..."*, ❌ *"Bài toán [Tên bài] cho một mảng..."*). Must open with a problem-tailored high-stakes provocative hook: a complexity paradox (*"Đừng vội dùng Hash Map nếu không muốn trượt phỏng vấn!"* or *"Tại sao đệ quy ngây thơ bài này lại làm sập call stack?"*), an algorithmic teaser (*"Làm sao tìm đúng trạng thái tối ưu trong hàng triệu đường đi mà không duyệt thừa một bước nào?"*), or an interview trap to stimulate curiosity immediately.
   - **Keep full punctuation (`.`, `,`, `:`) in the TTS input text** so the narrator pauses naturally between clauses and simulation steps; strip punctuation only when tokenizing words for 1-to-1 Whisper alignment (`word_timestamps=True, language="vi"`).
   - Smooth micro-gaps `<= 7 frames`, but preserve natural sentence pauses `> 7 frames`.
   - Color words semantically (`#FFE600` core concepts, `#EF4444` brute-force/bottlenecks, `#4ADE80` optimal/completion, `#38BDF8` data structures/steps, `#C084FC` numbers/complexity, `#FFFFFF` connectors).
4. **4:5 Vertical Video (`1080 × 1350`, 2-Second Visual Hook & Audio-Visual Dynamic Sync)**:
   - Dynamically size each `<Sequence>` and total `durationInFrames` from actual `ffprobe` audio durations (`round(duration * 30) + 15`).
   - **First-Frame Thumbnail (`frame === 0`)**: In `IntroScene`, set `effectiveFrame = frame === 0 ? 200 : frame` and hide `PopupCaption` at `frame === 0`. Keep the channel badge (`"▲ Leetcode Mô Phỏng · Problem #<ID>"`) and official English LeetCode Problem ID and Title.
   - **The 2-Second Visual Hook & Continuous Voice-Driven Animation (Zero Dead Screen)**:
     - In frames 0..60 of `IntroScene`, deliver an animated problem-tailored visual hook: an eye-catching curiosity badge (`🔥 BẪY PHỎNG VẤN: O(1) BỘ NHỚ! ⚡`), radar clash, or pulsing dilemma spotlight.
     - **Voice-Paced Progressive Reveal (No Early Animation Dumps / Zero Dead Screen)**: Across all 5 scenes (especially `IntroScene`, `IntuitionScene`, and `SummaryScene`), never pop all cards within the first 1 second (`delay: 10, 16, 22`), leaving 15–25s of dead, frozen screen while the voice speaks! Every card, branch, formula, and complexity metric must unlock progressively at the exact frame interval when the narrator introduces it in `captionsData.json`. Illuminate the active card with a dynamic spotlight and dim past cards to guide viewer attention.
     - **Animations must continuously track the voiceover across the entire timeline**: progressive cell/node/pointer reveal as values are spoken, target/goal box pulse + amber glow on mention, matching answer pair or optimal subproblem illumination with connecting bridge, constraint shake on alert, living micro-motions (`sin` wave floats), and synchronized SFX (`sfx_push`, `sfx_ding`, `sfx_pop`). Never leave elements sitting motionless like a PDF slide.
   - **Layout Budget & Anti-Void Rules (Triệt tiêu khoảng trống thừa & Chữ to rõ chuẩn Mobile)**:
     - Anchor the `990px` main content container below `TypographyHeader` (`marginTop: "18px..22px"`). Total content height **MUST fill between `840px` and `940px`** (ending at `y ≈ 1080px..1130px`, leaving a balanced `40px–60px` buffer above `PopupCaption` at `bottom="78px"`). Strictly forbid compact 400px–500px cards that leave the lower half of the screen as an empty wasteland!
     - **Mobile-First Typographic Scale**: Card titles `24px–28px`, body text/explanations `18px–22px` (never < 18px), data structure values `34px–44px` Bold, math formulas / targets `30px–40px`, and card padding `24px–32px`.
     - Always use `gridTemplateColumns: "repeat(2, minmax(0, 1fr))"` or `"repeat(5, minmax(0, 1fr))"` (never raw `"1fr"`), and set `minWidth: 0, overflow: "hidden", boxSizing: "border-box"` on all cards, flex rows, and grid cells.
     - Enforce character budgets for large typography: half-width card titles `<= 18 chars` + badges `<= 12 chars`; 5-column stepper titles `<= 12 chars` + sub-labels `<= 15 chars`; `SimulationScene` trace box `<= 65 chars`; `SummaryScene` Python `<pre>` code lines `<= 65 chars` and `<= 14 lines` total.
   - **5-Scene Architecture**: `IntroScene` ➔ `IntuitionScene` ➔ `RulesScene` ➔ `SimulationScene` (with stepper bar, data-structure sketch, visual legend, 2-phase steps, action banner, and SFX) ➔ `SummaryScene`.
5. **Render & Verify**:
   - Render to `out/<slug>.mp4`, verify streams with `ffprobe`, and report the solution, test results, and video path.
