---
name: visual-leet
description: End-to-end workflow that solves any LeetCode problem in TypeScript and Python, verifies it with unit tests, and renders a 4:5 (1080x1350) vertical explainer video with Vietnamese neural voiceover, Whisper word-level captions, and interactive step-by-step algorithm simulations.
---

# Visual LeetCode Skill (`visual-leet`)

When the user provides a LeetCode problem URL, title, or description, execute this 5-phase pipeline from start to finish.

> **Self-Contained Execution Rule:** Never rely on existing folders inside `src/problems/`—they are git-ignored and may not exist. Always import shared primitives directly from `src/shared/` and follow the specifications below so the video renders cleanly on the first pass.

---

## Shared Primitives Reference (`src/shared/`)

Always import these existing components from `../../../shared/...` inside `src/problems/<slug>/video/`:

1. **`SketchBackground`** (`src/shared/sketch/SketchBackground.tsx`)
   - Renders the dot-grid canvas (`#ffffff` with `#cbd5e1` radial dots) and the subtle bottom-right watermark (`▲ Leetcode mô phỏng`, `opacity: 0.28`).
2. **`TypographyHeader`** (`src/shared/motion/TypographyHeader.tsx`)
   - Props:
     - `badgeText?: string` — e.g. `"Problem #127"` on Scene 1, or Vietnamese section label on Scenes 2–5 (`"Tư Duy Đột Phá"`, `"Luật Biến Đổi"`, `"Mô Phỏng Từng Bước"`, `"Tổng Kết & Tối Ưu"`).
     - `badgeColor?: string` — default `"#0284c7"`.
     - `category?: string` — uppercase Vietnamese topic pill, e.g. `"ĐỒ THỊ & BFS NGẮN NHẤT"`.
     - `mainTitle?: string` — uppercase bold English title, e.g. `"WORD"`, `"INTUITION"`, `"CORE RULES"`, `"SIMULATION"`, `"SUMMARY"`.
     - `subTitle?: string` — italic serif English subtitle, e.g. `"Ladder"`, `"Level-by-Level BFS Trace"`.
3. **`PopupCaption` & `PopupWord`** (`src/shared/motion/PopupCaption.tsx`)
   - Displays **strictly 1 word at a time** with spring pop (`0.65 -> 1.14 -> 1.0`), thick `4.5px` black stroke, 3D shadow, and alternating tilt.
   - Props: `<PopupCaption segments={captionSegments} bottom="78px" />`
   - `PopupWord` shape: `{ from: number; to: number; text: string; color?: string; tilt?: number }`.
4. **Motion Helpers** (`src/shared/motion/motionUtils.ts`)
   - `whipIn(frame, fps, delay = 0, yOffset = 50)` — vertical spring entrance (`{ opacity, transform }`).
   - `whipInX(frame, fps, delay = 0, xOffset = 60)` — horizontal spring entrance for side-by-side cards (`{ opacity, transform }`).

---

## Phase 1: Optimal Solution (`solution.ts` & `solution.py`)

1. Identify the time- and space-optimal algorithm for the problem.
2. Implement clean, well-documented solutions in:
   - `src/problems/<slug>/solution.ts`
   - `src/problems/<slug>/solution.py`
3. Include clear docstrings/comments stating the core invariants, time complexity, and space complexity.

---

## Phase 2: Exhaustive Unit Tests (`solution.test.ts`)

1. Write a comprehensive Vitest test suite in `src/problems/<slug>/solution.test.ts` covering:
   - Official LeetCode examples
   - Boundary & minimal inputs (empty/single element, unreachable target, duplicates)
   - Tricky edge cases (cycles, multiple candidate paths/substructures, negative values)
   - A deterministic stress test verifying optimal time complexity under `200ms`
2. Run `npm test` (`npx vitest run`) and verify all tests pass before moving to Phase 3.

---

## Phase 3: Vietnamese Neural Voiceover, Whisper Word Alignment & SFX

### 1. Voiceover Rules (`vi-VN-NamMinhNeural`)
- **Voice**: Microsoft Azure `vi-VN-NamMinhNeural` via `edge-tts`, accelerated with `ffmpeg -y -i raw.mp3 -filter:a "atempo=1.30,volume=1.3" final.mp3`.
- **Natural Vietnamese Phrasing**: Write scripts in natural spoken Vietnamese (e.g., *"từ bắt đầu"*, *"từ đích"*, *"hàng đợi"*, *"con trỏ trái"*, *"quy hoạch động"*). Avoid raw code variable names (`prev`, `curr`, `dp[i][j]`) in the spoken text so TTS pronunciation is 100% natural.
- **Mandatory Punctuation for Natural Pauses**:
  - **Always include full commas (`,`), periods (`.`), and colons (`:`) in the text passed to `edge-tts`** so the narrator pauses naturally (~`0.4s–0.7s`) between clauses and between simulation steps (*"Bước một, ... . Bước hai, ... ."*).
  - Strip punctuation **only** when splitting words for Whisper token alignment (`re.sub(r"[^\w\s]", "", text).split()`).
- **Retry Wrapper**: Always wrap `edge-tts` CLI calls in a 5-attempt retry loop (`time.sleep(1.5)`) to handle transient WebSocket disconnects.
- **Dynamic Scene Durations**: Never hardcode scene lengths upfront. Measure each generated `public/audio/<prefix>_scene<1..5>.mp3` using `ffprobe` and compute:
  ```python
  frames = int(round(duration_sec * 30)) + 15  # +0.5s breathing room at the end of each scene
  ```

### 2. Whisper Word-Level Captions (`captionsData.json`)
- Run OpenAI Whisper (`whisper.load_model("base")`, `language="vi"`, `word_timestamps=True`) on each accelerated scene audio file.
- Map each word in `script_words = re.sub(r"[^\w\s]", "", text).split()` 1-to-1 to Whisper's extracted word timestamps.
- **Gap Smoothing Rule**:
  - If the gap between consecutive words is small (`0 <= gap <= 7` frames), set `popup_words[i]["to"] = popup_words[i + 1]["from"]` to prevent flicker within a spoken clause.
  - **Do NOT bridge gaps `> 7` frames**—those are natural punctuation pauses between sentences where the caption should disappear cleanly.
- **Semantic Color Coding (`SPECIAL_COLORS`)**:
  - **Electric Yellow (`#FFE600`)**: Core problem concepts & key takeaways (e.g., `ĐỘT, PHÁ, CỐT, LÕI, QUY, TẮC, MÔ, PHỎNG, NGẮN, LỚN, NHẤT, ĐÍCH, MẸO`).
  - **Coral Red (`#EF4444`)**: Brute force, bottlenecks, invalid states, cycle blocking, or zero (`VÉT, CẠN, ĐỪNG, TỐN, CHẬM, CHẶN, LOẠI, KHÔNG, LẶP`).
  - **Emerald Green (`#4ADE80`)**: Optimal insights, valid expansions, and completion (`TỐI, ƯU, NHANH, RỘNG, ĐỘNG, CHẠM, HOÀN, TẤT, TUYẾN, TÍNH, TĂNG, TỐC`).
  - **Cyan (`#38BDF8`)**: Data structures, pointers, directions, and step markers (`BƯỚC, TẦNG, HÀNG, ĐỢI, ĐỈNH, ĐỒ, THỊ, MẢNG, LƯỚI, TRÊN, TRÁI, PHẢI, CHÉO, NHÁNH`).
  - **Purple (`#C084FC`)**: Numbers and complexity terms (`MỘT, HAI, BA, BỐN, NĂM, BẬC, BÌNH, PHƯƠNG`).
  - **White (`#FFFFFF`)**: Normal connectors.
- Alternate word tilt across `TILTS = [-2.5, 2.5, -2.0, 2.0, -3.0, 3.0]`.
- Save the output to `src/problems/<slug>/video/captionsData.json` with keys `"1"`, `"2"`, `"3"`, `"4"`, `"5"`, and print the word frame intervals `[from..to]` to the console so you can bind every `whipIn` delay and simulation `atFrame` transition to the exact spoken frame.

### 3. Reusable Step Sound Effects (`public/audio/`)
- `sfx_push.mp3`: Inspecting a new element/cell/node or advancing pointers (`volume={1.2}`).
- `sfx_ding.mp3`: Discovering a valid match, expanding a state, or upgrading the best result (`volume={1.3}`).
- `sfx_pop.mp3`: Hitting a bottleneck, pruning an invalid branch, or blocking a visited cycle (`volume={1.3}`).
- `sfx_success.mp3`: Completing the final simulation step and highlighting the answer (`volume={1.4}`).

---

## Phase 4: 4:5 Vertical Motion Graphics Architecture (`1080 × 1350`)

### 1. Canvas Layout Budget & Anti-Overflow Rules (Critical for First-Pass Quality)
- **Canvas Size**: `width: 1080`, `height: 1350`, `fps: 30`.
- **Top Progress Bar**: `7px` tall Royal Blue bar (`#2563eb`) at `top: 0, left: 0` across the entire video.
- **Scene Outer Container**:
  ```tsx
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    padding: "22px 24px 105px",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
  }}
  ```
- **Content Anchor (`marginTop: "20px..24px"`, NEVER `margin: "auto 0"`)**:
  - Place the main `990px`-wide content container right below `TypographyHeader` using `marginTop: "20px"` or `"24px"`.
  - **Do not use `margin: "auto 0"` with compact cards**, which creates an awkward blank gap between the title and the diagrams. Size cards generously (`padding: "22px..26px"`, readable `16px–22px` text) so the content naturally fills the ~`820px–880px` vertical zone between the header and the bottom popup caption (`bottom="78px"`).
- **No-Wrap Rule for Badges & Status Bars**:
  - Always apply `whiteSpace: "nowrap"` to pill badges, formula tags, and single-line card headers (`fontSize: "18px..20px"`) so labels never wrap awkwardly onto two lines.
- **Neo-Brutal Sketch Card Styling**:
  - Cards use `backgroundColor: "#ffffff"`, `border: "2.5px..3px solid <color>"`, asymmetric sketch corners (`borderRadius: "24px 8px 24px 8px"` or `"8px 24px 8px 24px"`), and solid offset shadows (`boxShadow: "5px 5px 0px <color>"`).
- **Font Hierarchy**:
  - Main titles & numbers: `"Montserrat", -apple-system, sans-serif` (Bold 900) + italic `"Playfair Display", Georgia, serif`.
  - Card titles & explanations: `"Chalkboard SE", "Comic Sans MS", sans-serif`.
  - Code, complexity, coordinates & formulas: `"JetBrains Mono", Menlo, monospace`.

### 2. First-Frame Video Thumbnail (`frame === 0`)
- At `frame === 0` of `IntroScene` (the first frame of the entire video):
  - Set `const effectiveFrame = frame === 0 ? 200 : frame;` and pass `effectiveFrame` into all `whipIn` / `whipInX` calls.
  - Set `const captionSegments = frame === 0 ? [] : (captionsData["1"] as PopupWord[]);` so no single-word caption covers the thumbnail.
  - In `IntroScene`, `<TypographyHeader />` **must** use the official English LeetCode Problem number and title:
    - `badgeText="Problem #<ID>"` (renders `"▲ Leetcode Mô Phỏng · Problem #<ID>"`)
    - `mainTitle="<ENGLISH_MAIN_TITLE>"` (e.g., `"WORD"`, `"MAXIMAL"`)
    - `subTitle="<EnglishSubTitle>"` (e.g., `"Ladder"`, `"Square"`)

### 3. The 5-Scene Narrative Structure (Adaptable to Any Algorithm)

1. **Scene 1 (`IntroScene`) — Problem Input vs. Target Output**:
   - **Top**: `<TypographyHeader badgeText="Problem #<ID>" category="<VIETNAMESE_TOPIC>" mainTitle="<ENGLISH>" subTitle="<English>" />`.
   - **Middle (`gridTemplateColumns: "1fr 1fr"`, `gap: "22px"`)**:
     - *Left Card*: Raw input structure (e.g., array/grid/word list/graph) + key problem constraints.
     - *Right Card*: Target output or optimal transformation highlighted on that example, with a green result badge (`KẾT QUẢ = ... 🏆`).
   - **Bottom**: Blue callout banner (`🎯 Mục tiêu bài toán`) summarizing the goal and target time complexity.

2. **Scene 2 (`IntuitionScene`) — Naive vs. Optimal + Core Insight Diagram**:
   - **Top Row (`gridTemplateColumns: "1fr 1fr"`, `gap: "22px"`)**:
     - *Left Card (`✕ VÉT CẠN`, Red `#fef2f2` / `#ef4444`)*: Explains why the naive/brute-force approach does redundant work (`Time Limit Exceeded!`).
     - *Right Card (`✓ TỐI ƯU`, Green `#f0fdf4` / `#16a34a`)*: Explains the optimal algorithmic paradigm and speedup.
   - **Bottom Card**: Visual diagram of the core invariant or data-structure trick (e.g., 2×2 DP bottleneck cells, wildcard pattern buckets + BFS wavefront, monotonic stack/deque invariant, or two-pointer pruning).

3. **Scene 3 (`RulesScene`) — 3 Actionable Core Rules**:
   - 3 stacked horizontal cards that `whipIn` at the exact frames where *"Một..."*, *"Hai..."*, and *"Ba..."* are spoken.
   - Each card has a `68×68px` numbered/icon badge on the left, rule title (`Chalkboard SE`), code/formula pill on the top right (`JetBrains Mono`, `whiteSpace: "nowrap"`), and a clear 1–2 line explanation below.

4. **Scene 4 (`SimulationScene` + Dedicated `Sketch<Problem>.tsx`) — Interactive Step-by-Step Trace**:
   - **Top Stepper Bar**: 4 or 5 columns (`gridTemplateColumns: "repeat(5, 1fr)"`) showing `✓` for completed steps, `⚡` for the active step, step title, and short formula/state summary.
   - **Main Canvas Card**:
     - **Top Status & Formula Bar**: Shows the active transition formula on the left and current best/level state pill on the right (`whiteSpace: "nowrap"`).
     - **Center Visualization + Right-Side Legend (`🧭 Giải Thích Ký Hiệu`, `width: 265px`)**:
       - Adapt the left visualization naturally to the problem's data structure:
         - *2D Grid / DP*: Coordinate-labeled `r, c` cells showing original input + computed state.
         - *Graph / BFS / Tree*: Layered nodes (`L=1..K`) or tree levels + live Queue/Stack strip below.
         - *1D Array / Sliding Window / Two Pointers*: Indexed array cells + pointer badges (`L`, `R`, `MID`) + window/accumulator strip.
       - The right-side Legend card explains the 4 key visual states (`CURR ⚡`, `NEIGHBOR / DEPENDENCY`, `BLOCKED / BOTTLENECK ✕`, `TARGET / MAX 🏆`).
     - **2-Phase Micro-Steps (`Inspect` ➔ `Result`)**: Break key steps into an inspection sub-step (`sfx_push.mp3`) followed by the state update (`sfx_ding.mp3` or `sfx_pop.mp3`), ending with the completed state (`sfx_success.mp3`).
     - **Bottom Step Action Banner**: Displays `[BƯỚC X / 5]`, step title, concise explanation, and a dark code trace box (`#0f172a` background, `#38bdf8` monospace text).

5. **Scene 5 (`SummaryScene`) — Code, Complexity & Interview Tip**:
   - **macOS Code Card**: Light `#f8fafc` card with traffic-light dots, file title, `100% TESTED ✓` badge, and syntax-highlighted optimal code (`15px–16px` `JetBrains Mono`).
   - **Side-by-Side Complexity Cards**: `THỜI GIAN (TIME)` (Blue `#eff6ff` / `#2563eb`) and `BỘ NHỚ (SPACE)` (Green `#f0fdf4` / `#16a34a`).
   - **Interview Tip Banner (`💡 Mẹo phỏng vấn`)**: Connects the technique to space/bidirectional optimizations or related LeetCode follow-up problems.

---

## Phase 5: Render & Verification

1. Register the composition in `src/Root.tsx` with the exact total `durationInFrames` (sum of all 5 scenes), `fps={30}`, `width={1080}`, `height={1350}`.
2. Run TypeScript check and render a preview still of `frame=0` (thumbnail) and a mid-simulation frame to visually inspect layout balance and ensure no text wraps awkwardly:
   ```bash
   npx tsc --noEmit
   npx remotion still src/index.ts <CompositionId> out/thumb-check.png --frame=0
   ```
3. Render the final MP4:
   ```bash
   npx remotion render src/index.ts <CompositionId> out/<slug>.mp4
   ```
4. Verify the output video and audio streams with `ffprobe`, remove temporary `.png` check files in `out/`, and report the solution, test results, and video path to the user.
