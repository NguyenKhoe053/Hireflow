# Hireflow (Tuyển Thực Tập)

> Nền tảng quản lý quy trình tuyển dụng (ATS) tối giản, hiện đại và bảo mật dành riêng cho các chương trình thực tập.

🌐 **[Trải nghiệm Live Demo](https://hireflow-omega-khaki.vercel.app/)** 

---

## 📌 Giới thiệu dự án

Hireflow ra đời nhằm giải quyết bài toán rườm rà trong quy trình tuyển dụng thực tập sinh. Hệ thống cung cấp hai không gian làm việc tách biệt: một bảng điều khiển trực quan dành cho ứng viên để rải CV, và một hệ thống bảng Kanban chuyên nghiệp giúp Bộ phận Nhân sự (HR) theo dõi tiến độ của từng hồ sơ mà không sợ thất lạc.

### Điểm nhấn kỹ thuật
- **Bảo mật đa lớp:** Tích hợp hệ thống nhận diện `Cloudflare Turnstile` chống bot tự động, kết hợp với `Vercel Proxy` để ẩn giấu và bảo vệ API nội bộ khỏi các cuộc tấn công mạng.
- **Thiết kế UI/UX độc bản:** Tự xây dựng hệ thống CSS Design System riêng biệt mang hơi hướng hiện đại mà không phụ thuộc vào bất kỳ thư viện làm sẵn nào (như Bootstrap hay Tailwind).
- **Kiến trúc Serverless:** Triển khai hoàn toàn trên hạ tầng đám mây phân tán, tách biệt hoàn toàn Frontend và Backend để tối ưu hóa tốc độ tải trang.

---

## 🏗 Cấu trúc hệ thống (Architecture)

Dự án được phát triển dựa trên bộ công nghệ tiêu chuẩn của các hệ thống web hiện đại:
- **Giao diện (Frontend):** HTML5, CSS3, JavaScript (Vanilla).
- **Máy chủ (Backend):** Node.js kết hợp Express.js framework.
- **Cơ sở dữ liệu:** PostgreSQL (lưu trữ trên hạ tầng Supabase).
- **Máy chủ triển khai:** Vercel (Frontend) và Render (RESTful API).

---

## 🎯 Chức năng cốt lõi

1. **Giao diện đa vai trò:** Tự động thay đổi luồng thao tác dựa trên quyền hạn của người đăng nhập (Ứng viên hoặc Quản lý nhân sự).
2. **Luồng ATS Kanban:** HR có thể kéo thả hồ sơ qua các vòng ứng tuyển (Tiếp nhận ➔ Phỏng vấn ➔ Chấp nhận ➔ Từ chối) mượt mà như dùng Trello.
3. **Tìm kiếm thời gian thực:** Cơ chế tìm kiếm bỏ dấu tiếng Việt với tốc độ phản hồi tức thì ngay khi gõ.
4. **AI đánh giá CV:** Thuật toán thông minh giúp gợi ý tự động mức độ phù hợp của hồ sơ với yêu cầu công việc.

---

## 🚀 Hướng dẫn khởi chạy (Local Setup)

Nếu bạn muốn tham khảo mã nguồn và chạy thử hệ thống trên máy cá nhân:

1. Tải toàn bộ mã nguồn (`git clone`) về máy tính.
2. Thiết lập cấu hình Backend:
   ```bash
   cd backend
   npm install
   # Yêu cầu cung cấp URL kết nối Supabase vào file .env
   npm start
   ```
3. Khởi chạy Giao diện:
   Chỉ cần mở file `index.html` thông qua **Live Server** trên Visual Studio Code. Đoạn mã nhận diện môi trường sẽ tự động điều hướng các API calls về `localhost:3000` thay vì máy chủ Cloud.

---

## 🔑 Dùng thử nhanh (Quick Try)

Hệ thống đã được lập trình sẵn các nút **"Đăng nhập nhanh thử nghiệm"** ngay ngoài trang chủ. Bạn chỉ cần 1 click để trải nghiệm toàn bộ tính năng nội bộ với tư cách là `HR Manager` hoặc `Ứng viên` mà không cần phải thực hiện bước xác thực email rườm rà.
