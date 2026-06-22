# Tuyển Thực Tập (Hireflow) - Nền tảng ATS thông minh 💼

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://hireflow-omega-khaki.vercel.app/)
![Node.js](https://img.shields.io/badge/Node.js-Backend-success)
![Supabase](https://img.shields.io/badge/Supabase-Database-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

Hệ thống Theo dõi Ứng viên (Applicant Tracking System - ATS) toàn diện được xây dựng bởi sinh viên, dành cho sinh viên. Dự án được triển khai thực tế trên nền tảng Cloud 24/7 với khả năng chống spam tự động bằng công nghệ bảo mật của Cloudflare.

## 🚀 Tính Năng Nổi Bật (Key Features)
- **Kiểm soát truy cập (Role-based Access Control):** Phân quyền chi tiết, tách biệt giao diện cho `Nhà tuyển dụng (HR)` và `Ứng viên (Candidate)`.
- **Bảng ATS Kanban:** Quản lý tiến trình ứng viên bằng thao tác kéo thả trực quan (Hồ sơ mới, Đang phỏng vấn, Đã nhận việc,...).
- **Tìm kiếm thông minh:** Tính năng lọc ứng viên và công việc theo thời gian thực siêu tốc độ.
- **Bảo mật & Chống Spam:** Tích hợp `Cloudflare Turnstile` chống bot tự động và cấu hình Vercel Proxy để bảo mật tuyệt đối API nội bộ.
- **AI Sàng lọc CV:** Tự động chấm điểm độ phù hợp của CV với Yêu cầu công việc (JD) dựa trên thuật toán phân tích thông minh.

## 🛠 Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Cloudflare Turnstile
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Cloud Hosted via Supabase)
- **Deployment:** Vercel (Frontend) & Render.com (Backend Serverless)

## 💡 Tài Khoản Trải Nghiệm (Demo Accounts)
Truy cập hệ thống và sử dụng tính năng **Đăng nhập nhanh thử nghiệm** ngay trên trang chủ để trải nghiệm các quyền hạn khác nhau mà không cần tạo tài khoản:
- **Tài khoản HR Manager** (Đăng tuyển & Quản lý bảng Kanban): `hr@tuyenthuctap.vn`
- **Tài khoản Ứng viên** (Tìm việc, rải CV & Quản lý profile): `ungvien@tuyenthuctap.vn`
- Hoặc bạn có thể tự Đăng ký một tài khoản hoàn toàn mới để trực tiếp trải nghiệm màn hình bảo mật Cloudflare.

## 💻 Cài Đặt Tại Local (Local Setup)
Muốn chạy dự án này trên máy tính cá nhân:
1. Clone repository này về máy.
2. Mở thư mục `backend`, chạy lệnh `npm install` để cài đặt thư viện.
3. Điền thông tin Database Supabase vào file `.env` theo mẫu.
4. Chạy lệnh `npm start` để khởi động Server Backend tại `http://localhost:3000`.
5. Mở file `index.html` bằng extension **Live Server** (trên VS Code) để khởi động Frontend. Trình duyệt sẽ tự động điều hướng kết nối API về Backend cục bộ nhờ hệ thống Proxy thông minh.

---
*Dự án được phát triển với mục tiêu mang lại sự minh bạch, chuyên nghiệp và tối ưu hóa quy trình kết nối giữa sinh viên và nhà tuyển dụng.*
