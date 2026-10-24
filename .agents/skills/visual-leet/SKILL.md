---
name: visual-leet
description: Solves LeetCode problems with clean, tested, optimal code and renders a high-energy 4:5 vertical video with dynamically scaled duration featuring fast Vietnamese voiceover, synchronized dynamic captions, ByteByteGo sketch design, and Antigravity 2.0 motion graphics principles.
---

# Visual LeetCode Skill (`visual-leet`)

When the user provides a LeetCode problem link (or problem name/description), follow this 5-phase procedure:

## Phase 1: Problem Decomposition & Optimal Solution
1. Identify the optimal algorithmic approach (e.g. Monotonic Deque, Two Pointers, Sliding Window, DP, Stack).
2. Write clean, idiomatic, well-commented code in `src/problems/<slug>/solution.ts` (and `solution.py`).
3. Ensure optimal time and space complexity with clear variable naming and inline invariant explanations.

## Phase 2: Comprehensive Test Suite
1. Write exhaustive unit tests in `src/problems/<slug>/solution.test.ts` using `vitest`.
2. Cover:
   - Official LeetCode examples
   - Single-element / minimum boundary cases
   - Monotonic edge cases (strictly increasing, strictly decreasing, duplicates, negatives)
   - Large-scale / stress test verifying time complexity
3. Run `npm test` (`npx vitest run`) to verify all test cases pass.

## Phase 3: Popular Vietnamese Male Voiceover, Semantic Whisper Captions & SFX
1. **Popular Vietnamese Male Tech Voice (Microsoft Azure Nam Minh Neural)**:
   - Voice: `vi-VN-NamMinhNeural` (giọng nam miền Bắc trầm ấm, dõng dạc, phổ biến nhất trên TikTok, YouTube Shorts và tech tutorials tại Việt Nam).
   - **Script Phrasing**: Dùng từ ngữ tiếng Việt tự nhiên (ví dụ: *"con trỏ trước"*, *"con trỏ hiện tại"*, *"lưu nút kế tiếp"*, *"bẻ ngược mũi tên"*, *"Ô Mờ nhân En"*), tránh viết tắt tiếng Anh (như `prev`, `curr`) trong văn bản đọc TTS để phát âm chuẩn xác 100%.
   - **Pedagogical Simulation Example**: Trong kịch bản `scene4`, chọn ví dụ mô phỏng có tính sư phạm cao nhất (ví dụ: với bài Maximal Square, dùng lưới `4×4` có cả trường hợp bị chặn bởi nút thắt `0`, mở rộng lên `2×2`, và vươn tới `3×3 = 9` để người xem thấy trọn vẹn sự tiến hóa của trạng thái DP).
   - Script: Generate and accelerate audio using ffmpeg (`atempo=1.25..1.38`, volume boosted 1.3x for punchy, fast, crisp tutorial pacing). **Do NOT hardcode scene or total video durations** — measure each generated audio track via `ffprobe` (`frames = round(duration * 30)`) and dynamically size each `<Sequence>` and total `Composition` `durationInFrames` to match the real content:
     - `scene1.mp3`: Problem statement & core challenge.
     - `scene2.mp3`: Naive approach vs. optimal intuition & bottleneck principle.
     - `scene3.mp3`: Core algorithmic rules & invariants.
     - `scene4.mp3`: Live step-by-step trace walkthrough (scales with the number of steps & sub-steps).
     - `scene5.mp3`: Complexity analysis, 1D space optimization & related LeetCode interview tip.
2. **Viral Kinetic Pop-Up Captions (`cc.mp4` Style - Strictly MAX 1 Word on Screen)**:
   - **Word-by-Word Popping**: Strictly MAX 1 word on screen at any given frame (`PopupCaption`).
   - **Micro-frame Whisper Alignment**: Trích xuất timestamp từng từ bằng OpenAI Whisper (`whisper.load_model('base')`, `word_timestamps=True, language="vi"`), ánh xạ 1-1 với danh sách từ gốc của kịch bản và làm mượt khoảng cách (`gaps <= 7 frames`) để từ kế tiếp xuất hiện liền mạch không nhấp nháy màn hình.
   - **Semantic Color Coding (`SPECIAL_COLORS`)**: Tuyệt đối KHÔNG gán màu ngẫu nhiên/xoay vòng vô nghĩa. Phải tô màu theo ngữ nghĩa của từ:
     - **Electric Yellow (`#FFE600`)**: Từ khóa chủ đề & khái niệm cốt lõi (ví dụ: `HÌNH, VUÔNG, LỚN, NHẤT, DIỆN, TÍCH, ĐỘT, PHÁ, CỐT, LÕI, MÔ, PHỎNG, CẠNH, KINH, ĐIỂN`).
     - **Coral Red (`#EF4444`)**: Thuật toán vét cạn, sự chậm chạp, nút thắt cổ chai, hoặc giá trị `0` / loại bỏ (`VÉT, CẠN, TỐN, CHẬM, GIỚI, HẠN, NHỎ, KHÔNG, LOẠI`).
     - **Emerald Green (`#4ADE80`)**: Tư duy tối ưu, quy hoạch động, mở rộng thành công, hoàn tất (`QUY, HOẠCH, ĐỘNG, TOÀN, VƯƠN, HOÀN, TẤT, TỐI, ƯU`).
     - **Cyan (`#38BDF8`)**: Cấu trúc dữ liệu, hướng con trỏ/ô lân cận, bước thực hiện (`MA, TRẬN, LƯỚI, TRÊN, TRÁI, CHÉO, GÓC, DƯỚI, PHẢI, BƯỚC, BÌNH, PHƯƠNG`).
     - **Purple (`#C084FC`)**: Con số và ký hiệu độ phức tạp (`Ô, MỜ, EN, BỘ, NHỚ, MỘT, HAI, BA, BỐN, NĂM`).
     - **Pure White (`#FFFFFF`)**: Các từ nối thông thường.
   - **Typography & 3D Neo-Brutal Stroke**: Font `"Montserrat", "Impact", "Arial Black", sans-serif` (`@import` từ Google Fonts), `fontWeight: 900`, `68px - 84px`, viền đen dày `-webkit-text-stroke: 4.5px #000000`, `paint-order: stroke fill`, đổ bóng 3D đặc và độ nghiêng xoay vòng `TILTS = [-2.5, 2.5, -2.0, 2.0, -3.0, 3.0]`.
3. **Step Sound Effects (SFX)**:
   - `sfx_push.mp3`: Khi bắt đầu xét một ô mới / dịch chuyển con trỏ (Pha Inspect).
   - `sfx_pop.mp3`: Khi gặp nút thắt cổ chai (`0`) hoặc loại bỏ nhánh không hợp lệ.
   - `sfx_ding.mp3`: Khi mở rộng thành công trạng thái mới (ví dụ ghép thành hình vuông `2×2`, `3×3` hoặc tìm thấy kết quả).
   - `sfx_success.mp3`: Khi hoàn tất toàn bộ mô phỏng ở bước cuối.

## Phase 4: Antigravity 2.0 Motion Graphics & ByteByteGo Sketch Architecture
Follow these exact visual and structural specifications:
1. **Top Royal Blue Progress Bar & Global Styling**:
   - Trên cùng của video luôn có thanh tiến trình màu xanh Royal Blue (`height: "7px"`, `backgroundColor: "#2563eb"`, `boxShadow: "0 2px 8px rgba(37, 99, 235, 0.5)"`).
   - Kết hợp 3 tầng font chữ đặc trưng:
     - **Tiêu đề lớn & Số liệu**: `"Montserrat", -apple-system, sans-serif` (Bold 900) kết hợp chữ nghiêng `"Playfair Display", Georgia, serif` trên `TypographyHeader`.
     - **Tiêu đề thẻ & Giải thích ByteByteGo Sketch**: `"Chalkboard SE", "Comic Sans MS", sans-serif` mang phong cách viết tay trực quan, thân thiện.
     - **Công thức, Tọa độ & Code**: `"JetBrains Mono", Menlo, monospace`.
2. **Frame Đầu Tiên (`frame === 0`) Luôn Là Thumbnail Của Video & Thương Hiệu Bản Quyền**:
   - **First-Frame Video Thumbnail (`frame === 0`)**: Tại `frame === 0` của `IntroScene` (tức frame đầu tiên của toàn bộ video), bắt buộc đặt `effectiveFrame = frame === 0 ? 200 : frame` (hoặc dùng `<ThumbnailFrame />`) và ẩn `PopupCaption` ở `frame === 0` để toàn bộ bố cục `IntroScene` + `TypographyHeader` hiển thị **trạng thái hoàn chỉnh 100% (`opacity: 1, scale: 1`)** làm Thumbnail của video:
     - Có tên của channel: `"▲ Leetcode Mô Phỏng · Problem #<ID>"`.
     - **Tên và mã của bài toán trên LeetCode bắt buộc dùng tiếng Anh** trên thumbnail (ví dụ: `"Problem #221"`, `mainTitle="MAXIMAL"`, `subTitle="Square"`).
   - **Corner Watermark**: Luôn gắn watermark mờ `"▲ Leetcode mô phỏng"` (`opacity: 0.28`) ở góc dưới bên phải xuyên suốt toàn bộ video (`SketchBackground`).
3. **Bố Cục Chi Tiết Của 5 Phân Cảnh (5-Scene Visual Architecture)**:
   - **Scene 1 (`IntroScene`) — So Sánh Input & Output Song Song (`1fr 1fr`)**:
     - Header: `badgeText="Problem #<ID>"`, `mainTitle` & `subTitle` bằng **tiếng Anh**.
     - Hàng giữa chia 2 cột (`gridTemplateColumns: "1fr 1fr"`):
       - *Thẻ Trái*: Dữ liệu đầu vào gốc (ví dụ `1. Ma Trận Nhị Phân (4 × 5)` với badge `INPUT GRID`).
       - *Thẻ Phải*: Minh họa kết quả mong muốn trên dữ liệu đó (ví dụ `2. Hình Vuông Toàn '1' Lớn Nhất` với vùng kết quả tô xanh lá `#dcfce7` viền `#16a34a`, badge `2 × 2 ➔ DIỆN TÍCH = 4`).
     - Hàng dưới: Banner `🎯 Mục tiêu bài toán` tóm tắt yêu cầu và độ phức tạp mục tiêu.
   - **Scene 2 (`IntuitionScene`) — Đối Lập Vét Cạn vs Tối Ưu + Sơ Đồ Nguyên Lý Cốt Lõi**:
     - Hàng trên chia 2 cột (`gridTemplateColumns: "1fr 1fr"`):
       - *Thẻ Trái (Đỏ `#fef2f2` / `#ef4444`)*: `✕ VÉT CẠN` — giải thích vì sao cách ngây thơ bị trùng lặp tính toán và `Time Limit Exceeded!`.
       - *Thẻ Phải (Xanh lá `#f0fdf4` / `#16a34a`)*: `✓ TỐI ƯU` — giải thích trực giác đột phá đạt `O(M × N)` / `O(N)`.
     - Hàng dưới: Thẻ minh họa trực quan nguyên lý cốt lõi (ví dụ: sơ đồ 2×2 các ô `CHÉO ↖`, `TRÊN ↑`, `TRÁI ←`, `HIỆN TẠI` bên trái + giải thích `💡 Nguyên Lý "Thùng Gỗ (Bottleneck)"` bên phải).
   - **Scene 3 (`RulesScene`) — 3 Quy Tắc Cốt Lõi (`whipIn` theo từng câu đọc)**:
     - 3 thẻ ngang có icon/số thứ tự lớn bên trái (`56×56px`), tiêu đề quy tắc (`Chalkboard SE`), badge code công thức góc phải (`JetBrains Mono`), và giải thích ngắn gọn bên dưới.
   - **Scene 4 (`SimulationScene` + Dedicated `Sketch<Problem>.tsx`) — Mô Phỏng Từng Bước Chuyên Sâu (2-Phase Micro-Steps + Legend)**:
     - **Thanh 5-Step Progress Stepper Bar**: Chia 5 cột (`gridTemplateColumns: "repeat(5, 1fr)"`), mỗi tab hiển thị trạng thái (`✓` đã qua, `⚡` đang chạy), tên bước và dòng công thức rút gọn bên dưới.
     - **Dedicated Sketch Component (ví dụ `SketchDpGrid.tsx`, `SketchRotatedArray.tsx`, `SketchLinkedList.tsx`)**:
       - Phía trên có thanh **Top Status & Formula Bar** (`📐 Công thức: ...` bên trái và trạng thái `maxSide = ... ➔ Area = ...` bên phải).
       - Ở giữa đặt **Cấu trúc dữ liệu có đánh tọa độ (`r=0..3, c=0..3` hoặc `idx=0..n`)** song song với bảng **`🧭 Giải Thích Ký Hiệu Ô` (Visual Legend)** ở bên phải (`width: 290px`) giải thích rõ từng màu sắc/nhãn (`CURR`, `TOP/LEFT/DIAG`, `MIN ⚡`, `MAX 🏆`).
       - Mỗi ô hiển thị cả giá trị gốc góc trên trái (`m=1`) và giá trị trạng thái lớn ở chính giữa (`dp`), kèm floating badge ở góc trên phải (`CURR (i,j)`, `TOP ↑`, `LEFT ←`, `DIAG ↖`, `MIN = 0 ⚡`, `2×2 ✓`, `MAX 3×3 🏆`).
     - **2-Phase Sub-steps cho mỗi bước tính toán**:
       - *Pha A (Inspect)*: Chiếu sáng ô đang xét (`CURR`) và các ô phụ thuộc (`TOP`, `LEFT`, `DIAG` / `bottleneck`) kèm `sfx_push.mp3` để người xem quan sát trước khi ra kết quả.
       - *Pha B (Result)*: Cập nhật giá trị vào ô, hiển thị khung highlight (`highlightSquare`) và phát `sfx_ding.mp3` (khi mở rộng thành công) hoặc `sfx_pop.mp3` (khi bị chặn bởi nút thắt).
     - **Step Action Banner ở đáy thẻ**: Đổi màu theo bước (`badgeBg`, `badgeBorder`), hiển thị `[BƯỚC X / 5]`, tiêu đề + mô tả chi tiết, và hộp code đen chữ xanh cyan (`#38bdf8`) ở góc phải.
   - **Scene 5 (`SummaryScene`) — Cửa Sổ Code macOS, Thẻ Độ Phức Tạp & Mẹo Liên Hệ Bài Toán**:
     - **macOS Code Card**: Nền sáng `#f8fafc`, thanh tiêu đề có 3 chấm tròn (`#ef4444`, `#eab308`, `#22c55e`), tên file `solution.py / solution.ts (Space Optimized)`, badge `100% TESTED ✓`, và code có syntax highlighting rõ ràng.
     - **2 Thẻ Độ Phức Tạp Song Song**: `THỜI GIAN (TIME)` (xanh dương `#eff6ff` / `#2563eb`) và `BỘ NHỚ (SPACE)` (xanh lá `#f0fdf4` / `#16a34a`).
     - **Banner `💡 Mẹo phỏng vấn`**: Liên hệ trực tiếp công thức vừa học sang các bài LeetCode biến thể cùng dạng (ví dụ: từ *LeetCode 221 Maximal Square* liên hệ sang *LeetCode 1277 Count Square Submatrices with All Ones*).

## Phase 5: Rendering & Verification
1. Render MP4:
   ```bash
   npx remotion render src/index.ts <CompositionId> out/<slug>.mp4
   ```
2. Verify `frame === 0` thumbnail (`npx remotion still src/index.ts <CompositionId> out/thumb-check.png --frame=0`), resolution (`1080x1350`), dynamic duration matching the sum of scenes, and audio streams (`ffprobe`).
3. Deliver the solution, test verification, step-by-step intuition, and video path to the user.
