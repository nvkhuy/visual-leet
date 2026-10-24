# Visual LeetCode Workspace Rules

When the user provides a LeetCode link (e.g., `https://leetcode.com/problems/...`) or asks to solve and visualize an algorithm:

1. **Solve Cleanly**: Write the optimal, clean, well-documented solution in `src/problems/<slug>/solution.ts` (and `solution.py`).
2. **Test Rigorously**: Write unit tests in `src/problems/<slug>/solution.test.ts` and run `npm test` to verify all test cases pass.
3. **Generate Popular Vietnamese Male Voice & Semantic Viral Pop-up Captions (`cc.mp4` Style)**:
   - Voice: Standard Vietnamese male tutorial narrator (**Nam Minh Neural** `vi-VN-NamMinhNeural` from Microsoft Azure), accelerated with ffmpeg `atempo=1.25..1.38,volume=1.3` in `public/audio/`.
   - **Viral Pop-up Captions (`cc.mp4` style - Strictly MAX 1 Word on Screen at a Time)**:
     - Word-by-word popping extracted via OpenAI Whisper (`word_timestamps=True, language="vi"`) aligned 1-to-1 with the script words and gap-smoothed (`<= 7 frames`).
     - **Semantic Color Coding (`SPECIAL_COLORS`)**: Color words by algorithmic meaning — Yellow (`#FFE600`) for core concepts, Red (`#EF4444`) for brute-force/bottlenecks/zeros, Green (`#4ADE80`) for DP/optimal breakthroughs, Cyan (`#38BDF8`) for grid/pointers/directions, Purple (`#C084FC`) for numbers/complexity, White (`#FFFFFF`) for connectors.
     - Ultra-bold Montserrat/Impact font (68-84px), thick 4.5px black outline, 3D drop shadow, explosive scale bounce (`0.65 -> 1.14 -> 1.0`), and alternating kinetic tilt (`±2.0°..3.0°`).
   - Step SFX (`sfx_push.mp3`, `sfx_pop.mp3`, `sfx_ding.mp3`, `sfx_success.mp3`).
4. **Antigravity 2.0 & ByteByteGo Motion Graphics in 4:5 (Width: 1080, Height: 1350, Dynamic Duration)**:
   - **Thời lượng co giãn linh hoạt (Dynamic Duration)**: Thời lượng từng phân cảnh (`Sequence`) và tổng thời lượng video (`durationInFrames`) tự động co giãn theo độ dài thực tế của giọng đọc (`ffprobe`) và số bước mô phỏng của từng bài toán.
   - **Top Progress Bar & Typography**: Thanh tiến trình Royal Blue (`7px`, `#2563eb`) trên đỉnh video; kết hợp font `Montserrat` (Bold 900), `Playfair Display` (Italic Serif), `"Chalkboard SE", "Comic Sans MS"` (ByteByteGo sketch headings/explanations) và `JetBrains Mono` (code/formulas).
   - **Frame Đầu Tiên (`frame === 0`) Luôn Là Thumbnail & Thương Hiệu Bản Quyền**:
     - **First-Frame Video Thumbnail (`frame === 0`)**: Tại `frame === 0` của `IntroScene`, đặt `effectiveFrame = frame === 0 ? 200 : frame` (và ẩn `PopupCaption` ở `frame === 0`) để toàn bộ bố cục `IntroScene` + `TypographyHeader` hiển thị rõ nét 100% ở trạng thái hoàn chỉnh làm Thumbnail của video:
       - Có tên của channel: `"▲ Leetcode Mô Phỏng · Problem #<ID>"`.
       - **Tên và mã của bài toán trên LeetCode bắt buộc dùng tiếng Anh** trên thumbnail (ví dụ: `"Problem #221"`, `mainTitle="MAXIMAL"`, `subTitle="Square"` — tuyệt đối không dịch tên bài toán sang tiếng Việt).
     - Luôn có watermark mờ `"▲ Leetcode mô phỏng"` (`opacity: 0.28`) ở góc dưới phải xuyên suốt mọi khung hình.
   - **5-Scene ByteByteGo Architecture**:
     - `IntroScene`: Đặt 2 thẻ song song (`1fr 1fr`) so sánh Input gốc vs Output mục tiêu + banner `🎯 Mục tiêu bài toán`.
     - `IntuitionScene`: Đặt 2 thẻ đối lập (`✕ VÉT CẠN` màu đỏ vs `✓ TỐI ƯU` màu xanh lá) + sơ đồ nguyên lý cốt lõi (ví dụ Nguyên lý "Thùng Gỗ / Bottleneck").
     - `RulesScene`: 3 thẻ quy tắc cốt lõi xuất hiện theo từng câu đọc.
     - `SimulationScene` + `Sketch<Problem>.tsx`: Có thanh **5-Step Progress Stepper Bar**, bảng dữ liệu kèm tọa độ (`r, c` / `idx`), cột **`🧭 Giải Thích Ký Hiệu Ô` (Visual Legend)** bên phải, mô phỏng tách thành **2 pha (Inspect ➔ Result)** cho từng bước cùng **Step Action Banner** và SFX đồng bộ.
     - `SummaryScene`: Cửa sổ code macOS (`100% TESTED ✓`), 2 thẻ độ phức tạp `TIME` & `SPACE` song song, và `💡 Mẹo phỏng vấn` liên hệ bài toán biến thể.
5. **Render MP4**: Render the video to `out/<slug>.mp4` using Remotion.
6. **Report**: Deliver the solution, test verification, step-by-step explanation, and the generated video path.
