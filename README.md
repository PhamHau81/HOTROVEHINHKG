# HỖ TRỢ VẼ HÌNH - PHẠM HẬU

Hệ thống Trí tuệ Nhân tạo & Dựng hình Không gian 3D chuyên sâu cho Hình học Không gian THPT (SGK Kết nối tri thức với cuộc sống).

## Tính năng chính
1. **Tự động dựng hình 3D chính xác theo đề bài**: Phân tích đề bài ngôn ngữ tự nhiên Tiếng Việt và dựng mô hình khối đa diện (hình chóp, tứ diện, lăng trụ, hình hộp, hình lập phương).
2. **Tính toán điểm cắt chính xác**: Xác định chân đường vuông góc (hình chiếu vuông góc), giao điểm đường thẳng với mặt phẳng, trung điểm, trọng tâm và thiết diện với độ chính xác toán học 100%.
3. **Phân biệt nét vẽ theo chuẩn THPT**: Cạnh bị che khuất hiển thị nét đứt (dashed), cạnh nhìn thấy hiển thị nét liền (solid).
4. **Cắt lớp thiết diện**: Tương tác trượt mặt phẳng cắt qua hình khối và xác định đa giác thiết diện.
5. **Tọa độ hóa Oxyz**: Gắn hệ trục tọa độ Oxyz chuẩn mực và tính toán vectơ góc/khoảng cách (Toán 12).
6. **Lộ trình gợi mở sư phạm 3 cấp độ**: Cấp 1 (Định lý SGK), Cấp 2 (Đường kẻ phụ & Điểm cắt), Cấp 3 (Lời giải chi tiết từng bước).

## Cấu hình API Key Gemini
1. Truy cập [Google AI Studio](https://aistudio.google.com/api-keys) để lấy API key miễn phí.
2. Trên thanh tiêu đề ứng dụng, bấm vào nút **"Lấy API key để sử dụng app"** (Settings).
3. Dán API key và chọn Model AI (mặc định: `gemini-3-flash-preview`). Key sẽ được lưu trên trình duyệt của bạn (`localStorage`).
4. Ngay cả khi chưa nhập key, hệ thống vẫn tích hợp bộ giải thuật toán hình học chính xác tự động dựng hình ngay lập tức.

## Triển khai (Deployment lên Vercel)
Ứng dụng đã được tích hợp sẵn file `vercel.json` để chạy mượt mà Single Page Application (SPA).
Chỉ cần đẩy mã nguồn lên GitHub và kết nối với Vercel.
