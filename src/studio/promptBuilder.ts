import { BatchJob } from "./types";

/**
 * Builds the primary self-contained prompt for an isolated agent session
 * executing the 5-phase visual-leet workflow for a single LeetCode problem.
 */
export function buildVisualLeetPrompt(job: BatchJob): string {
  const numberHint = job.problemNumber ? ` (Problem #${job.problemNumber})` : "";
  return `Dùng skill \`visual-leet\` (\`.agents/skills/visual-leet/SKILL.md\` và \`AGENTS.md\`) để giải và tạo video giải thích 4:5 (1080x1350) hoàn chỉnh cho bài toán LeetCode sau:

- **Bài toán**: ${job.title}${numberHint}
- **Link LeetCode**: ${job.leetcodeUrl}
- **Slug thư mục bắt buộc**: \`${job.slug}\` (\`src/problems/${job.slug}/\`)
- **File video đầu ra bắt buộc**: \`out/${job.slug}.mp4\`
- **Nguyên tắc Clean Slate**: Thực hiện hoàn toàn mới từ đầu, đảm bảo không phụ thuộc vào bất kỳ context hay file rác cũ nào.

Yêu cầu chất lượng bắt buộc (thực hiện đầy đủ từ Phase 1 đến Phase 5, tuyệt đối không rút gọn bất kỳ bước nào):
1. **Đọc kỹ \`.agents/skills/visual-leet/SKILL.md\`** trước khi bắt đầu và import các shared primitives từ \`src/shared/\` (\`SketchBackground\`, \`TypographyHeader\`, \`PopupCaption\`, \`PopupWord\`, \`whipIn\`, \`whipInX\`).
2. **Phase 1 (Optimal Python Solution — 100% Python Consistency)**:
   - Viết lời giải tối ưu bằng **Python 3** kèm docstring phân tích độ phức tạp tại \`src/problems/${job.slug}/solution.py\` (**không** tạo \`solution.ts\`).
   - **Bắt buộc nhất quán 100% bằng Python**: Mọi đoạn code, công thức truy hồi, tên biến (\`snake_case\`), khung code trace ở \`RulesScene\`, \`SimulationScene\` và thẻ code ở \`SummaryScene\` (tiêu đề \`solution.py\`) đều phải dùng cú pháp **Python** thuần túy (\`def\`, \`min()\`, \`max()\`, \`len()\`, comment \`#\`; tuyệt đối không trộn lẫn cú pháp JS/TS như \`Math.min\`, \`//\`, \`===\`).
3. **Phase 2 (Python Unit & Stress Tests)**: Viết bộ kiểm thử Python toàn diện tại \`src/problems/${job.slug}/test_solution.py\` (kèm bridge \`src/problems/${job.slug}/solution.test.ts\` gọi \`python3 -m unittest\`, bao gồm official examples, edge cases và stress test < 200ms) và chạy kiểm thử đảm bảo PASS 100%.
4. **Phase 3 (Vietnamese Neural Voiceover & The 2-Second Curiosity Hook)**:
   - **Hook 2 giây đầu bắt buộc ở Scene 1**: 2s đầu tiên (frames 0..60) tuyệt đối **không** mở đầu buồn ngủ kiểu đọc sách (❌ *"Hôm nay chúng ta giải bài toán..."*, ❌ *"Bài toán [Tên bài] cho một..."*). Bắt buộc mở đầu bằng một **cú hook gây tò mò cực độ**: nghịch lý độ phức tạp (*"Đừng vội dùng Hash Map nếu không muốn trượt phỏng vấn!"* hoặc *"Tại sao đệ quy ngây thơ bài này lại làm sập call stack?"*), bẫy bộ nhớ O(1), hoặc câu hỏi xoáy kích thích khát khao hiểu biết thuật toán.
   - Tạo script thuyết minh tiếng Việt tự nhiên cho 5 cảnh (giữ nguyên dấu chấm, phẩy, hai chấm trong chuỗi truyền vào \`edge-tts\` với giọng \`vi-VN-NamMinhNeural\`, có vòng lặp retry 5 lần, tăng tốc qua \`ffmpeg -filter:a "atempo=1.30,volume=1.3"\`).
   - Đo thời lượng thực tế bằng \`ffprobe\` (\`frames = round(duration * 30) + 15\`), chạy OpenAI Whisper (\`word_timestamps=True, language="vi"\`), làm mượt khoảng nghỉ \`<= 7 frames\`, tô màu ngữ nghĩa (\`#FFE600\`, \`#EF4444\`, \`#4ADE80\`, \`#38BDF8\`, \`#C084FC\`, \`#FFFFFF\`) và lưu vào \`src/problems/${job.slug}/video/captionsData.json\`.
5. **Phase 4 (5-Scene 1080×1350 Remotion Architecture, 2s Visual Hook & Động Hóa Liên Tục)**:
   - **Hook thị giác 2 giây đầu & Động hóa theo lời thoại (Tuyệt đối không để card tĩnh nhàm chán)**:
     - Trong 2s đầu (frames 0..60) của \`IntroScene\`: Phải có visual hook sinh động (huy hiệu bẫy phỏng vấn chớp nháy \`🔥 BẪY PHỎNG VẤN O(1) BỘ NHỚ! ⚡\`, radar quét, hoặc con trỏ va chạm kích thích thị giác).
     - **Voice tới đâu, animation tới đó (Triệt tiêu dead screen, không xổ hết animation trong 1s đầu)**: Trong các cảnh dài 20–30s (đặc biệt \`IntuitionScene\`, \`SummaryScene\`), tuyệt đối không đặt delay ngắn làm mọi card hiện ra hết ngay giây đầu tiên rồi đóng băng màn hình suốt 20s tiếp theo. Phải đối chiếu \`captionsData.json\` để chia milestone: card/nhánh/bước nào được voice nhắc tới thì mới kích hoạt \`whipIn\` tại đúng frame đó kèm SFX, đồng thời rọi đèn spotlight vào card đang nói và làm mờ nhẹ các card đã qua.
     - **Animation phải đi theo lời voice nói liên tục**: Từng ô phần tử xuất hiện lần lượt theo frame giọng nói xướng tên; ô target/đích đến bùng sáng khi được nhắc đến; cặp số / ô kết quả tối ưu phát sáng viền xanh lá kèm hiệu ứng kết nối; thẻ ràng buộc rung lắc khi nhắc tới điều kiện cấm; chèn các âm thanh SFX (\`sfx_push.mp3\`, \`sfx_ding.mp3\`, \`sfx_pop.mp3\`) đúng nhịp visual.
   - Xây dựng đầy đủ 5 cảnh trong \`src/problems/${job.slug}/video/\`: \`IntroScene\`, \`IntuitionScene\`, \`RulesScene\`, \`SimulationScene\` (kèm component minh họa chuyên biệt trong \`src/problems/${job.slug}/video/sketch/\`, thanh Stepper 5 bước, bảng chú giải \`🧭 Giải Thích Ký Hiệu\`, hiệu ứng 2 pha \`Inspect ➔ Result\` với \`sfx_push.mp3\`, \`sfx_ding.mp3\`, \`sfx_pop.mp3\`, \`sfx_success.mp3\`, và khung code trace), cùng \`SummaryScene\`.
   - Đảm bảo thumbnail tại \`frame === 0\` của \`IntroScene\` (\`effectiveFrame = frame === 0 ? 200 : frame\`, ẩn \`PopupCaption\` ở \`frame === 0\`, hiển thị đúng \`Problem #<ID>\` và tên tiếng Anh chuẩn).
   - **Thiết kế Mobile-First 4:5 (1080×1350) — Triệt tiêu khoảng trống thừa bên dưới & Chữ to rõ**:
     - **Triệt tiêu khoảng trống chết (Anti-Void Law)**: Toàn bộ khối nội dung chính 990px phải chiếm chiều cao từ **840px đến 940px** (kết thúc ở y ≈ 1080px..1130px, cách PopupCaption ở \`bottom="78px"\` khoảng 40px–60px). Tuyệt đối **cấm** làm các thẻ bé 400px–500px để lại nửa dưới màn hình trống hoác!
     - **Tỷ lệ chữ & component chuẩn điện thoại**: Tiêu đề thẻ \`24px–28px\`, chữ giải thích/nội dung \`18px–22px\` (không dùng dưới 18px), ô phần tử mảng/lưới bự \`78px–94px\` với số \`34px–42px\` đậm nét, công thức/giá trị mục tiêu \`30px–40px\`, padding thẻ \`24px–32px\`, gap các hàng \`20px–26px\`.
     - Mọi CSS Grid 2 cột hoặc 5 cột bắt buộc dùng \`repeat(2, minmax(0, 1fr))\` hoặc \`repeat(5, minmax(0, 1fr))\` (không dùng \`1fr\` thuần), kèm \`minWidth: 0, overflow: "hidden", textOverflow: "ellipsis"\` cho các dòng tiêu đề đơn.
     - Giới hạn ký tự thích ứng với cỡ chữ lớn: Tiêu đề thẻ nửa chiều rộng \`<= 18 ký tự\` + badge \`<= 12 ký tự\`; ô Stepper 5 cột có tiêu đề \`<= 12 ký tự\` + mô tả phụ \`<= 15 ký tự\`; hộp code trace ở \`SimulationScene\` \`<= 65 ký tự\`; khối code Python \`<pre>\` ở \`SummaryScene\` mỗi dòng \`<= 65 ký tự\` và tối đa \`<= 14 dòng\`.
6. **Phase 5 (Render & Verification)**:
   - Đăng ký \`<Composition>\` vào \`src/Root.tsx\` (giữ nguyên các \`<Composition>\` của các bài toán khác đã có trong \`src/Root.tsx\` nếu file tồn tại, chỉ thêm/cập nhật composition của bài \`${job.slug}\`).
   - Chạy \`npx tsc --noEmit\`, kiểm tra ảnh tĩnh thumbnail, sau đó render video hoàn chỉnh ra đúng đường dẫn \`out/${job.slug}.mp4\` và kiểm tra lại bằng \`ffprobe\`.`;
}

/**
 * Builds a targeted continuation / auto-heal prompt when resuming an interrupted job
 * or completing missing deliverables detected by the quality gate.
 */
export function buildContinuationPrompt(
  job: BatchJob,
  missingItems: string[]
): string {
  const checklist = missingItems.map((item) => `- [ ] ${item}`).join("\n");
  return `Tiếp tục hoàn thiện bài toán **${job.title}** (slug: \`${job.slug}\`, link: ${job.leetcodeUrl}) theo đúng chuẩn \`.agents/skills/visual-leet/SKILL.md\`.

Kiểm tra các file đã có sẵn trong \`src/problems/${job.slug}/\` để không làm lại từ đầu những phần đã hoàn tất, và hoàn thành ngay các hạng mục còn thiếu sau đây:
${checklist}

Đảm bảo chạy \`npx tsc --noEmit\`, \`npx vitest run src/problems/${job.slug}/solution.test.ts\`, đăng ký composition trong \`src/Root.tsx\` (giữ nguyên các bài khác), và render thành công file \`out/${job.slug}.mp4\`.`;
}
