---
name: visual-leet
description: End-to-end workflow that solves any LeetCode problem in Python, verifies it with unit tests, and renders a 4:5 (1080x1350) vertical explainer video with Vietnamese neural voiceover, Whisper word-level captions, and interactive step-by-step algorithm simulations.
---

# Visual LeetCode Skill (`visual-leet`)

When the user provides a LeetCode problem URL, title, or description, execute this 5-phase pipeline from start to finish.

> **Self-Contained Execution & Clean-Slate Rule:**
> 1. Never rely on existing folders inside `src/problems/`—they are git-ignored and may be deleted or reset at any time. Always import shared primitives directly from `src/shared/`.
> 2. Each problem is strictly bounded to 4 artifact locations:
>    - Source code & tests: `src/problems/<slug>/`
>    - Audio voiceovers: `public/audio/<prefix>_scene*.mp3` or `public/audio/<slug>/` (shared `public/audio/sfx_*.mp3` are strictly preserved)
>    - Video output: `out/<slug>.mp4` (and temporary check stills)
>    - Composition registration: `src/Root.tsx`
> 3. When a video is trashed via the Studio UI (or reset via CLI), all 4 locations are completely purged so that future generations run in a 100% clean context without stale code or cached artifacts.

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

## Phase 1: Optimal Python Solution (`solution.py`)

1. Identify the time- and space-optimal algorithm for the problem.
2. **Mandatory Python-Only Solution**: Implement a clean, well-documented Python 3 solution exclusively in:
   - `src/problems/<slug>/solution.py` (do **not** create `solution.ts`—all algorithm solutions must be 100% unified in Python).
3. Use standard LeetCode Python 3 conventions (`class Solution:` with type hints `List`, `Optional`, `deque`, `defaultdict`, `heapq`, etc., and `snake_case` identifiers).
4. Include clear docstrings/comments stating the core invariants, time complexity, and space complexity.
5. **100% Python Consistency Across the Video**:
   - Every code snippet, transition formula pill, variable name, and step trace shown anywhere in the 5 video scenes (`IntroScene`, `IntuitionScene`, `RulesScene`, `SimulationScene`, and `SummaryScene`) **must** use pure **Python** syntax (`def`, `min()`, `max()`, `len()`, `range()`, `#` comments, `snake_case` variable names matching `solution.py`).
   - Never mix JavaScript/TypeScript syntax (`Math.min`, `Math.max`, `//` comments, `.push()`, `===`, `camelCase` variables) in any scene card or code trace.

---

## Phase 2: Exhaustive Python Unit Tests (`test_solution.py` & `solution.test.ts`)

1. Write a comprehensive Python unit test suite in `src/problems/<slug>/test_solution.py` (using `unittest`) testing `src/problems/<slug>/solution.py` and covering:
   - Official LeetCode examples
   - Boundary & minimal inputs (empty/single element, unreachable target, duplicates)
   - Tricky edge cases (cycles, multiple candidate paths/substructures, negative values)
   - A deterministic stress test verifying optimal time complexity under `200ms`
2. Also add a lightweight Vitest bridge in `src/problems/<slug>/solution.test.ts` that invokes `python3 -m unittest discover -s src/problems/<slug> -p "test_*.py"` so both `python3 -m unittest` and `npm test` (`npx vitest run`) verify `solution.py` and pass 100% before moving to Phase 3.

---

## Phase 3: Vietnamese Neural Voiceover, Whisper Word Alignment & SFX

### 1. Voiceover Rules (`vi-VN-NamMinhNeural`) & The 2-Second Curiosity Hook
- **Voice**: Microsoft Azure `vi-VN-NamMinhNeural` via `edge-tts`, accelerated with `ffmpeg -y -i raw.mp3 -filter:a "atempo=1.30,volume=1.3" final.mp3`.
- **The 2-Second Voice Hook (Strictly Mandatory for Scene 1)**:
  - The first 2 seconds (`0..60` frames) dictate whether the viewer watches or swipes away.
  - **Strictly FORBID dry, academic, or textbook introductions**:
    - ❌ *"Hôm nay chúng ta cùng giải bài toán LeetCode..."*
    - ❌ *"Bài toán [Tên bài] cho một mảng số nguyên..."*
    - ❌ *"Chào các bạn, video này sẽ giải thích..."*
  - **MANDATORY: Start with a sharp, provocative hook that sparks curiosity and exploits the viewer's innate desire to learn clever insights**:
    - *Archetype A — Complexity Paradox / Bottleneck Riddle*: *"Đừng vội dùng Hash Map tốn O(N) bộ nhớ nếu bạn không muốn rớt phỏng vấn bài này!"* or *"Làm sao tìm đúng cặp số trong mảng triệu phần tử mà không tốn dù chỉ một byte bộ nhớ phụ?"*
    - *Archetype B — Algorithmic "Aha!" Teaser*: *"Chỉ với hai con trỏ kẹp từ hai đầu mảng, điều kỳ diệu gì xảy ra để ta không bao giờ bỏ sót đáp án?"* or *"Tại sao mảng đã sắp xếp lại biến phép tìm kiếm thành một màn khiêu vũ O(N) thần tốc?"*
    - *Archetype C — The Strict Interview Trap*: *"90% ứng viên mất điểm ở bài này vì một ràng buộc ngầm: O(1) không gian nhớ!"*
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

### 1. The Mobile-First 4:5 Design Guideline & Vertical Anti-Void System (`1080 × 1350`)

> [!IMPORTANT]
> **The Mobile Screen Reality & Anti-Void Law ("Triệt tiêu hoàn toàn khoảng trống thừa bên dưới")**:
> 4:5 (`1080 × 1350`) is a **mobile portrait format** viewed on 6-inch phone screens. 
> 
> Two fatal design flaws must be strictly eliminated:
> 1. **The Desktop Widget Trap (Micro-Text)**: Using desktop web font sizes (`12px–15px`) and tiny element boxes (`40px–50px`) makes content unreadable on phones without zooming in.
> 2. **The Barren Void Defect (Empty Wasteland)**: When cards are made too compact (`total height: 400px–550px`), the bottom **40%–50% of the screen (500px–600px!) becomes an awkward, empty wasteland** of blank dot grid.
> 
> **MANDATORY VERTICAL FILL TARGET**: The main `990px` content container across ALL scenes **must occupy between `840px` and `940px` in total vertical height**, ending cleanly at `y ≈ 1080px – 1130px` to leave a balanced `40px – 60px` breathing buffer above `PopupCaption` (`bottom="78px"`). Any scene whose content height is `< 800px` is **strictly defective**.

#### 1. Universal Mobile Typographic Hierarchy (1080 × 1350)
Every scene component must adhere to this bold mobile-first scale:

| Component Role | Font Size (Mobile Scale) | Weight & Font Family | Notes |
| :--- | :--- | :--- | :--- |
| **Section Header Main Title** | **`50px – 60px`** | Montserrat Bold 900 / Playfair Italic | Prominent top branding |
| **Section Header Category / Badge** | **`15px – 17px`** | JetBrains Mono / Montserrat Bold 800 | Generous pill padding `6px 14px` |
| **Tier 1: Curiosity Hook / Dilemma Badge** | **`21px – 24px`** | Montserrat ExtraBold 900 | High contrast, bold warning icon |
| **Main Card Titles** | **`24px – 28px`** | Chalkboard SE / Montserrat Bold 900 | Crisp, readable from distance |
| **Card Header Sub-tags & Badges** | **`14px – 16px`** | JetBrains Mono Bold 800 | Padding `5px 12px` |
| **Data Structure Elements (Array/Grid/Node)** | **`34px – 44px`** | Montserrat / JetBrains Mono Bold 900 | Big punchy numbers |
| **Data Structure Indices (`i=0`, `r, c`)** | **`15px – 17px`** | JetBrains Mono Bold 700 | Crisp secondary coordinates |
| **Math Formulas / Target / Return Values** | **`30px – 40px`** | JetBrains Mono ExtraBold | High visual focal point |
| **Card Body Explanations & Bullets** | **`18px – 22px`** | Chalkboard SE / System UI (`lineHeight: 1.45`) | **Never use < 18px for body text!** |
| **Alert / Constraint Callouts** | **`16px – 18.5px`** | Chalkboard SE / JetBrains Mono | Bordered caution box with icon |
| **Bottom Goal / Action Banner Title** | **`22px – 26px`** | Montserrat Bold 900 | Actionable takeaway header |
| **Bottom Goal / Action Banner Subtitle** | **`17px – 20px`** | Chalkboard SE / JetBrains Mono | Auxiliary metrics & complexity |
| **Simulation Stepper Bar Tabs (5 cols)** | **`15px – 17px`** (Title) / **`13px – 14.5px`** (Sub) | Montserrat Bold / JetBrains Mono | Active tab illuminated |
| **Simulation Code Trace Box (`> ...`)** | **`18px – 20px`** | JetBrains Mono Bold | High contrast dark terminal bar |
| **Summary Code Block (`<pre>`)** | **`17px – 19px`** | JetBrains Mono Regular/Bold (`lineHeight: 1.45`) | Full-width syntax highlighting |
| **Summary Big Complexity Metrics** | **`38px – 48px`** | Montserrat Bold 900 | E.g. $O(N)$ and $O(1)$ hero metrics |

#### 2. Component Dimensions & Spacing Matrix:
- **Card Padding**: Use **`24px – 32px`** (never `12px–16px`). Gives generous visual weight.
- **Card Borders & Shadows**: `border: "3px solid <color>"`, `boxShadow: "6px 6px 0px <color>"` (or `8px 8px 0px`).
- **Row & Item Gaps**: Use **`20px – 26px`** (never `10px–14px`).
- **Data Structure Sizing**:
  - **1D Array Cells**: `width: 78px – 94px`, `height: 88px – 104px` with values `34px – 42px` Bold and indices `15px – 17px`.
  - **2D DP Grid Cells**: `width: 72px – 88px`, `height: 72px – 88px` with values `28px – 36px` JetBrains Mono Bold.
  - **Graph / Tree Nodes**: Diameter `72px – 88px` circular bubbles with values `24px – 30px`.
  - **Formula & Target Callout Boxes**: Height `80px – 100px`, padding `14px 22px`.
  - **Hook & Goal Banners**: Height `76px – 92px`, padding `16px 26px`.

#### 3. Scene-by-Scene Vertical Stage Budgeting (Target: `840px – 940px`):
1. **Scene 1 (`IntroScene`)**:
   - Tier 1 Hook Badge: `~78px`
   - Gap: `~22px`
   - Tier 2 Side-by-Side Cards (Input Array vs Output/Pair): **`minHeight: 560px – 600px`**
   - Gap: `~22px`
   - Tier 3 Algorithm Goal Banner: `~90px`
   - **Total Content Height = `78 + 22 + 580 + 22 + 90 = 792px – 892px`** (perfect balance, stage ends at `y ≈ 1060px – 1090px`).
2. **Scene 2 (`IntuitionScene`)**:
   - Tier 1 Top Row Cards (`✕ VÉT CẠN` vs `✓ TỐI ƯU`): **`height: 330px – 370px`**
   - Gap: `~22px`
   - Tier 2 Bottom Insight Card (Branches / Visual Invariant): **`height: 400px – 460px`**
   - **Total Content Height = `350 + 22 + 430 = 802px – 880px`**.
3. **Scene 3 (`RulesScene`)**:
   - 3 Stacked Horizontal Rule Cards: **`height: 200px – 230px` each**, with `78×78px` badges, titles `25px–28px`, formula pills `20px–23px`, explanations `19px–21px`.
   - Gaps: `2 × 24px = 48px`.
   - **Total Content Height = `3 × 215 + 48 = 693px – 740px`** (with top/bottom margins settling comfortably between `y = 170` and `y = 1080`).
4. **Scene 4 (`SimulationScene`)**:
   - Tier 1 Stepper Bar (5 columns): **`height: 78px – 88px`**
   - Gap: `~20px`
   - Tier 2 Main Simulation Card (Visualization + Legend + Action Banner): **`height: 680px – 740px`**
   - **Total Content Height = `82 + 20 + 710 = 812px – 848px`**.
5. **Scene 5 (`SummaryScene`)**:
   - Tier 1 macOS Code Card (`solution.py`): **`height: 480px – 530px`** (code `17.5px–19px`)
   - Gap: `~20px`
   - Tier 2 Side-by-side Complexity Cards: **`height: 165px – 190px`** (big metrics `40px–46px`)
   - Gap: `~20px`
   - Tier 3 Interview Tip Banner: **`height: 100px – 120px`**
   - **Total Content Height = `500 + 20 + 175 + 20 + 110 = 825px – 870px`**.

#### 4. Anti-Overflow & Text-Fitting Rules with Large Typography:
1. **Always Use `minmax(0, 1fr)` in CSS Grids**:
   - `gridTemplateColumns: "repeat(2, minmax(0, 1fr))"` or `"repeat(5, minmax(0, 1fr))"`.
   - Set `minWidth: 0, overflow: "hidden", boxSizing: "border-box"` on all cards and cells.
2. **Character Budgets Tailored to Larger Mobile Typography**:
   - 2-Column Half-Width Card Titles (`fontSize: 24px–26px`): `<= 18 characters` (`minWidth: 0, textOverflow: "ellipsis"`).
   - Card Header Badges (`fontSize: 14px–15px`): `<= 12 characters`.
   - Stepper Tabs (5 columns): Step title `<= 12 characters`, sub-label `<= 15 characters`.
   - Code Blocks (`SummaryScene` `<pre>`): Line length `<= 65 characters` per line, `<= 14 lines` total.
   - Trace Box (`SimulationScene`): `<= 65 characters` monospace.
   - Action Banner Title (`SimulationScene`): `<= 40 characters`.

### 2. First-Frame Video Thumbnail (`frame === 0`)
- At `frame === 0` of `IntroScene` (the first frame of the entire video):
  - Set `const effectiveFrame = frame === 0 ? 200 : frame;` and pass `effectiveFrame` into all `whipIn` / `whipInX` calls.
  - Set `const captionSegments = frame === 0 ? [] : (captionsData["1"] as PopupWord[]);` so no single-word caption covers the thumbnail.
  - In `IntroScene`, `<TypographyHeader />` **must** use the official English LeetCode Problem number and title:
    - `badgeText="Problem #<ID>"` (renders `"▲ Leetcode Mô Phỏng · Problem #<ID>"`)
    - `mainTitle="<ENGLISH_MAIN_TITLE>"` (e.g., `"WORD"`, `"MAXIMAL"`)
    - `subTitle="<EnglishSubTitle>"` (e.g., `"Ladder"`, `"Square"`)

### 3. Universal Voice-Paced Progressive Reveal Doctrine (Zero Dead Screen Across All Scenes & Any Algorithm)

> [!IMPORTANT]
> **The Golden Anti-Freeze Law ("Voice tới đâu, animation tới đó")**:
> In a vertical explainer video, viewers swipe away the instant screen motion freezes. When a scene lasts 15–30 seconds, **never pop all cards within the first 1–2 seconds (`delay: 10, 16, 22`)**, leaving 15–25 seconds of frozen, dead screen while the voiceover continues speaking!
> 
> **Every single visual component, card, cell, pointer, formula pill, or stepper transition across ALL 5 SCENES must dynamically bind its entrance frame to the spoken word timestamps in `captionsData.json`**.

#### The Universal 4-Step Progressive Pacing Method for ANY Problem:
1. **Timestamp Extraction**:
   - Check `src/problems/<slug>/video/captionsData.json` for the scene's word list.
   - Identify the exact `from` frame for each key transition phrase (e.g., when the voice mentions the naive approach, bottleneck, optimal paradigm, case A, case B, or conclusion).
2. **Progressive Milestone Schedule**:
   - Define boolean flags or frame thresholds in the component:
     ```tsx
     const isLeftActive = frame >= milestoneLeft;
     const isBottleneckActive = frame >= milestoneBottleneck;
     const isRightActive = frame >= milestoneRight;
     const isBranchAActive = frame >= milestoneBranchA;
     const isBranchBActive = frame >= milestoneBranchB;
     const isInvariantActive = frame >= milestoneInvariant;
     ```
3. **Active Spotlight & Focus Beacon (Directing Viewer Attention)**:
   - Whichever element, card, cell, or pointer is currently being spoken about receives an **Active Spotlight**:
     - Slight scale enlargement: `transform: scale(1 + Math.sin(frame / 6) * 0.015)`.
     - Vibrant border highlight and glowing neon shadow.
     - Accompanying audio cue: `sfx_push.mp3` on entrance, `sfx_ding.mp3` on match/insight, `sfx_pop.mp3` on rejection/bottleneck.
   - Elements already explained stay visible for context but gently settle (`opacity: 0.75..0.85` or neutral border) so the viewer's eyes follow the narrator seamlessly.
4. **Living Micro-Motions (Continuous Dynamism)**:
   - Idle elements must never look like static raster images. Keep subtle mathematical breathing:
     - Badges / icons floating: `translateY(Math.sin(frame / 10) * 3px)`.
     - Active pointers / cursors: `translateY(Math.sin(frame / 7) * 4px)`.
     - Target / result boxes: subtle amber/emerald aura shimmer.

---

### 4. The 5-Scene Narrative Structure & Universal Algorithmic Archetypes

1. **Scene 1 (`IntroScene`) — Problem Input vs. Target Output & The 2-Second Hook**:
   - **The 2-Second Visual Hook (Frames 0..60)**:
     - At `frame === 0`: Keep settled thumbnail layout (`effectiveFrame = 200`) without captions covering the graphics.
     - In the first 2 seconds (`frames 1..60`): **Strictly forbid dropping static cards that sit motionless!** Deliver an immediate, high-energy visual hook matching the provocative voice hook:
       - **Curiosity Hook Badge / Banner**: An eye-catching animated badge positioned prominently under the header or across the top of the cards (e.g. `🔥 BẪY PHỎNG VẤN: O(1) BỘ NHỚ! ⚡`, `🎯 THÁCH THỨC: TÌM CẶP SỐ KHÔNG DÙNG HASH MAP`) that `whipIn` at frame 5–10 with `sfx_push.mp3`, accompanied by a subtle breathing pulse (`scale: 1 + Math.sin(frame / 8) * 0.04`) and glowing neon shadow.
       - **Problem-Tailored Visual Dilemma / Clash (Universal Archetypes)**:
         - *Two Pointers / Array / Sliding Window*: Left & Right pointers flash and clash towards each other from both ends.
         - *DP / Matrix / Grid*: A highlighted bottleneck cell pulsing with a question mark `?` and glowing dependencies.
         - *Graph / BFS / Tree*: A glowing source node pulsing search waves towards a locked target node.
         - *Monotonic Stack / Queue*: A new incoming element about to push down taller elements with a shake effect.
         - *Intervals / Greedy*: Overlapping conflicting intervals clashing with red warning borders.
   - **Continuous Voice-Driven Synchronization (Strict Anti-Dead-Screen Animation)**:
     - **Every visual element must animate in real-time sync with what the voiceover is saying at that exact frame** (referencing `captionsData.json["1"]`):
       - *Progressive Element Entrance*: Rather than whipping in the entire array/graph/matrix at once, reveal elements sequentially as the narrator utters them (e.g., as numbers or vertices are spoken, individual element boxes spring in with staggered frame offsets).
       - *Dynamic Word-Driven Highlighting (Focus Beacon)*:
         - When target is mentioned (*"giá trị mục tiêu là..."*): Target pill scales up (`scale: 1.15 -> 1.0`), flashes with golden amber halo (`boxShadow: "0 0 18px rgba(245, 158, 11, 0.6)"`), and triggers `sfx_ding.mp3`.
         - When answer element/pair is revealed: Target cells simultaneously light up in emerald green (`#22c55e`), with an animated connector bridging them.
         - When constraint is emphasized (*"O(1) bộ nhớ phụ"* / *"không được đi qua ô đã thăm"*): Constraint warning box shakes gently (`transform: translateX(sin(...) * 3px)`), bordered in alert orange (`#f97316`), triggering `sfx_pop.mp3`.
       - *Living Micro-Motions*: Maintain continuous subtle motion throughout the scene so the screen never looks like a frozen PDF slide:
         - Floating sine-wave hover on result trophy: `translateY(Math.sin(frame / 12) * 3px)`.
         - Bouncing pointer badges: `translateY(Math.sin(frame / 8) * 4px)`.
   - **Layout Hierarchy (`gridTemplateColumns: "repeat(2, minmax(0, 1fr))"`, `gap: "22px"`)**:
     - *Top*: `<TypographyHeader badgeText="Problem #<ID>" category="<VIETNAMESE_TOPIC>" mainTitle="<ENGLISH>" subTitle="<English>" />`.
     - *Left Card*: Raw input structure with progressive cell entrance + live target callout.
     - *Right Card*: Target output formula + illuminated matching pair/substructure + result badge (`KẾT QUẢ = ... 🏆`) + constraint alert box.
     - *Bottom Banner*: Blue callout (`🎯 Mục tiêu bài toán: O(...) Time, O(...) Space`) with subtle shimmer shine.

2. **Scene 2 (`IntuitionScene`) — Naive vs. Optimal + Voice-Paced Progressive Reveal**:
   - **Universal Voice-Paced Progressive Schedule**:
     - Extract word timestamps from `captionsData.json["2"]` and trigger each visual element at the exact frame the narrator introduces it:
       - *Milestone 1*: Left card (`✕ VÉT CẠN / PHƯƠNG PHÁP CƠ SỞ`) whips in when voice starts discussing the naive or baseline attempt (`sfx_pop.mp3`).
       - *Milestone 2*: Drawback/bottleneck pill inside Left card flashes red on mention of time/memory penalty ($O(N^2)$, TLE, recursion stack overflow, $O(N)$ auxiliary space).
       - *Milestone 3*: Right card (`✓ TỐI ƯU / TƯ TƯỞNG ĐỘT PHÁ`) whips in with active green spotlight and `sfx_push.mp3` when voice introduces the breakthrough concept.
       - *Milestone 4*: Bottom insight container whips in, illuminating the primary condition or subproblem transition (`sfx_ding.mp3`) as the narrator explains the first branch/rule.
       - *Milestone 5*: Complementary branch or transition illuminates with pulse and `sfx_ding.mp3` when voice explains the opposite transition.
       - *Milestone 6*: Invariant Lock / Guarantee strip reveals with gold/emerald shimmer and `sfx_success.mp3` as voice concludes why this paradigm never misses the optimal answer.
   - **Universal Algorithmic Archetypes for Scene 2**:
     - *Two Pointers / Sliding Window*: Left = Nested loops / Hash Map; Right = Two Pointers monotonic contraction; Bottom = Case A (`sum < target` ➔ `L += 1`) vs Case B (`sum > target` ➔ `R -= 1`).
     - *Dynamic Programming / Grid*: Left = Exponential recursion tree with overlapping calls; Right = Memoization / Tabulation table; Bottom = Recurrence cell dependencies ($dp[i-1][j]$, $dp[i][j-1]$) showing state combination.
     - *Graphs / Shortest Path / BFS*: Left = Exhaustive DFS trapped in cycles / exponential paths; Right = Level-order BFS wavefront with visited set; Bottom = Queue wavefront expanding ring-by-ring towards target.
     - *Monotonic Stack / Deque*: Left = Repeated linear scans backwards; Right = Monotonically increasing/decreasing stack; Bottom = Element comparison triggering continuous pops until invariant restored.
     - *Greedy / Intervals*: Left = Checking all subset permutations; Right = Sort by start/end time + local greedy choice; Bottom = Non-overlapping interval extension vs skip condition.
   - **Top Row (`gridTemplateColumns: "repeat(2, minmax(0, 1fr))"`, `gap: "22px"`)**:
     - *Left Card (`✕ VÉT CẠN`, Red `#fef2f2` / `#ef4444`)*: Explains why the naive/brute-force approach does redundant work (`Time Limit Exceeded!`). Keep header title `<= 22 chars` and badge `<= 14 chars`.
     - *Right Card (`✓ TỐI ƯU`, Green `#f0fdf4` / `#16a34a`)*: Explains the optimal algorithmic paradigm and speedup. Keep header title `<= 22 chars` and badge `<= 14 chars`.
   - **Bottom Card**: Visual diagram of the core invariant or data-structure trick with animated branch paths and invariant badge.

3. **Scene 3 (`RulesScene`) — 3 Actionable Core Rules**:
   - **Voice-Paced Staggered Entrance**: The 3 stacked horizontal cards **must not** appear at once. Each card whips in at the exact frame where *"Một..."*, *"Hai..."*, and *"Ba..."* are spoken (`captionsData.json["3"]`), paired with `sfx_push.mp3` or `sfx_ding.mp3`.
   - Each card has a `68×68px` numbered/icon badge on the left, rule title (`Chalkboard SE`, `minWidth: 0`, `overflow: "hidden"`, `textOverflow: "ellipsis"`), **Python** code/formula pill on the top right (`JetBrains Mono`, `whiteSpace: "nowrap"`, `<= 28 chars`, e.g. `1 + min(top, left, diag)`—never `Math.min`), and a clear 1–2 line explanation below using `snake_case` Python variable names.
   - The currently active rule being spoken glows with an active border highlight while prior rules settle.

4. **Scene 4 (`SimulationScene` + Dedicated `Sketch<Problem>.tsx`) — Interactive Step-by-Step Trace**:
   - **Voice-Paced Stepper Bar**: 4 or 5 columns (`gridTemplateColumns: "repeat(5, minmax(0, 1fr))"`) where the active tab dynamically advances at the exact frame the narrator announces each step (*"Bước một..."*, *"Bước hai..."*).
   - **Main Canvas Card**:
     - **Top Status & Formula Bar**: Shows the active Python transition formula on the left (`overflow: "hidden"`, `textOverflow: "ellipsis"`) and current best/level state pill on the right (`whiteSpace: "nowrap"`, `flexShrink: 0`).
     - **Center Visualization + Right-Side Legend (`🧭 Giải Thích Ký Hiệu`, `width: 265px`, `flexShrink: 0`)**:
       - Adapt the left visualization (`flex: 1`, `minWidth: 0`, `overflow: "hidden"`) naturally to the problem's data structure:
         - *2D Grid / DP*: Coordinate-labeled `r, c` cells showing original input + computed state.
         - *Graph / BFS / Tree*: Layered nodes (`L=1..K`) or tree levels + live Queue/Stack strip below.
         - *1D Array / Sliding Window / Two Pointers*: Indexed array cells + pointer badges (`L`, `R`, `MID`) + window/accumulator strip.
         - *Monotonic Stack / Deque*: Vertical stack slot or horizontal deque tube showing pushes and pops.
       - The right-side Legend card explains the 4 key visual states (`CURR ⚡`, `NEIGHBOR / DEPENDENCY`, `BLOCKED / BOTTLENECK ✕`, `TARGET / MAX 🏆`) with concise labels (`<= 18 chars`).
     - **2-Phase Micro-Steps (`Inspect` ➔ `Result`) Synced to Voice**:
       - Phase 1 (*Inspect*): When the voice names the candidate element, highlight it with `sfx_push.mp3`.
       - Phase 2 (*Result / Action*): When the voice states the comparison or update, execute the state transition with `sfx_ding.mp3` or `sfx_pop.mp3`.
       - Concluding step highlights the answer with `sfx_success.mp3`.
     - **Bottom Step Action Banner**: Displays `[BƯỚC X / 5]`, step title (`<= 48 chars`, `overflow: "hidden"`, `textOverflow: "ellipsis"`), concise explanation, and a dark **Python** code trace box (`#0f172a` background, `#38bdf8` monospace text `<= 74 chars` using `#` for comments and exact `solution.py` syntax).

5. **Scene 5 (`SummaryScene`) — Python Code, Complexity & Interview Tip**:
   - **Progressive Reveal Sync Across Narration**:
     - *Phase 1 (Code Overview)*: macOS Code Card enters first as the narrator introduces the clean Python 3 implementation.
     - *Phase 2 (Complexity Breakdown)*: Side-by-side Time & Space complexity cards whip in with `sfx_ding.mp3` at the exact frame the voiceover details time and memory bounds.
     - *Phase 3 (Pro-Tip / Follow-up)*: Interview Tip Banner whips in with `sfx_success.mp3` when the narrator shares the parting interview pro-tip.
   - **macOS Code Card (`solution.py`)**: Light `#f8fafc` card with traffic-light dots, file header strictly labeled `solution.py (<Algorithm Name>)` (never `solution.ts`), `100% TESTED ✓` badge, and syntax-highlighted optimal **Python 3** code (`def ...`, `14.5px–15.5px` `JetBrains Mono`, strictly **`<= 80 chars/line`** and **`<= 15 lines`**).
   - **Side-by-Side Complexity Cards**: `THỜI GIAN (TIME)` (Blue `#eff6ff` / `#2563eb`) and `BỘ NHỚ (SPACE)` (Green `#f0fdf4` / `#16a34a`), using `gridTemplateColumns: "repeat(2, minmax(0, 1fr))"`.
   - **Interview Tip Banner (`💡 Mẹo phỏng vấn`)**: Connects the technique to space/bidirectional optimizations or related LeetCode follow-up problems.

---

## Phase 5: Render & Anti-Overflow Verification

1. Register the composition in `src/Root.tsx` with the exact total `durationInFrames` (sum of all 5 scenes), `fps={30}`, `width={1080}`, `height={1350}`.
2. Run TypeScript check and render preview stills of `frame=0` (thumbnail), `SimulationScene`, and `SummaryScene` to visually inspect layout balance and verify that **zero text or code overflows horizontally or collides with `PopupCaption` vertically**:
   ```bash
   npx tsc --noEmit
   npx remotion still src/index.ts <CompositionId> out/thumb-check.png --frame=0
   ```
3. Render the final MP4:
   ```bash
   npx remotion render src/index.ts <CompositionId> out/<slug>.mp4
   ```
4. Verify the output video and audio streams with `ffprobe`, remove temporary `.png` check files in `out/`, and report the solution, test results, and video path to the user.
