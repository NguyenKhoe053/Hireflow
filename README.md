# Tuyển Thực Tập (Hireflow) - Nền tảng Quản lý Tuyển dụng (ATS)

Hireflow (Tuyển Thực Tập) là một nền tảng Hệ thống Theo dõi Ứng viên (Applicant Tracking System - ATS) được phát triển nhằm tối ưu hóa quy trình tuyển dụng. Dự án cung cấp giải pháp toàn diện cho cả Nhà tuyển dụng (HR) và Ứng viên, tích hợp trí tuệ nhân tạo (AI) để sàng lọc và đánh giá hồ sơ.

## 🚀 Tính năng nổi bật

### 🏢 Dành cho Nhà tuyển dụng (HR)
- **Bảng ATS Kanban**: Quản lý trạng thái ứng viên trực quan bằng thao tác kéo thả (Hồ sơ mới, Đang phỏng vấn, Đã nhận việc,...).
- **AI Sàng lọc CV**: Tự động chấm điểm độ phù hợp của CV với Yêu cầu công việc (JD) dựa trên thuật toán phân tích AI.
- **Quản lý Tuyển dụng**: Khởi tạo, chỉnh sửa và đăng tải các vị trí công việc.
- **Lịch Phỏng vấn**: Đặt lịch và theo dõi tiến trình phỏng vấn của từng ứng viên.

### 👤 Dành cho Ứng viên
- **Hồ sơ cá nhân**: Quản lý hồ sơ năng lực chuyên nghiệp và đính kèm CV.
- **Ứng tuyển 1-chạm**: Xem danh sách việc làm và ứng tuyển nhanh chóng.
- **Theo dõi tiến độ**: Xem trạng thái hồ sơ của mình trong quy trình xét duyệt của công ty theo thời gian thực.

## 🛠 Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, Vanilla JavaScript. Giao diện được thiết kế theo nguyên tắc UI/UX hiện đại (Dark mode, Pill buttons, Smooth animations).
- **Backend API**: Node.js, Express.js.
- **Database**: PostgreSQL (Supabase) với cấu trúc SQL chuẩn hóa (Relational Data).
- **Deployment**: Vercel (Frontend Cloud) & Render (Backend Cloud).

## 🌐 Trải nghiệm trực tiếp (Live Demo)

- **Website**: [https://hireflow-omega-khaki.vercel.app/](https://hireflow-omega-khaki.vercel.app/)

> 💡 **Mẹo**: Sử dụng tính năng **Đăng nhập nhanh thử nghiệm** trên trang chủ để trải nghiệm ngay hệ thống dưới góc nhìn của HR hoặc Ứng viên mà không cần tạo tài khoản.

## ⚙️ Hướng dẫn cài đặt (Local Development)

Dự án bao gồm mã nguồn Frontend tĩnh ở thư mục gốc và thư mục `backend/` chứa RESTful API.

**1. Khởi chạy Máy chủ API (Backend)**
```bash
cd backend
npm install
npm start
```
*API sẽ chạy tại cổng `http://localhost:3000` (cần cung cấp file `.env` chứa chuỗi kết nối Supabase).*

**2. Khởi chạy Giao diện (Frontend)**
Sử dụng extension **Live Server** trên VS Code hoặc bất kỳ Web Server tĩnh nào để mở file `index.html`.

---
*Dự án được xây dựng với mục tiêu mang lại sự minh bạch, hiện đại và hiệu quả cho thị trường tuyển dụng.*
