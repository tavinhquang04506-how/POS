## 1. Database & Schema

- [x] 1.1 Thêm model `PhieuTraHang` và `ChiTietPhieuTra` vào `schema.prisma`.
- [x] 1.2 Thêm trường `MatKhau` (String, nullable) vào model `KhachHang` trong `schema.prisma`.
- [x] 1.3 Liên kết `PhieuTraHang` với `HoaDon`, `CaLamViec`, và `NhanVien`.
- [x] 1.4 Chạy migrate Prisma để cập nhật cấu trúc database.

## 2. Backend Authentication API

- [x] 2.1 Cập nhật `POST /api/auth/login` (Admin/Staff) để trả về payload JWT có chứa `id` và `role` chuẩn.
- [x] 2.2 Xây dựng endpoint mới `POST /api/auth/customer-login` cho phép khách hàng đăng nhập.
- [x] 2.3 Cập nhật API Đăng ký khách hàng để tự thiết lập mật khẩu mặc định.

## 3. Backend RBAC Middleware

- [x] 3.1 Cập nhật middleware `authenticate` để tương thích với Token mới, parse thông tin `role`.
- [x] 3.2 Xây dựng middleware `authorizeRoles(allowedRoles: string[])`.
- [x] 3.3 Ráp `authorizeRoles` vào toàn bộ endpoint trong `index.ts`.

## 4. Backend Returns & Reporting API

- [x] 4.1 Xây dựng Endpoint GET `/api/returns/invoice/:id` lấy thông tin hóa đơn.
- [x] 4.2 Xây dựng Endpoint POST `/api/returns` ghi nhận trả hàng (tạo PhieuTraHang).
- [x] 4.3 Trong POST `/api/returns`, viết logic Transaction: cập nhật cộng lại `SoLuongTon` cho từng SKU bị trả.
- [x] 4.4 Trong POST `/api/returns`, viết logic Transaction: trừ `DiemTichLuy` của `KhachHang` tương ứng với số tiền hoàn.
- [x] 4.5 Cập nhật `ReportController` để tính doanh thu thuần bằng (Tổng bán - Tổng trả).

## 5. Frontend UI - CashierPOS

- [x] 5.1 Thêm nút "Đổi/Trả Hàng" (phím tắt F4).
- [x] 5.2 Xây dựng Modal Đổi/Trả nhập mã Hóa đơn và hiển thị danh sách các món đồ đã mua.
- [x] 5.3 Cho phép chọn số lượng cần trả cho từng món (hỗ trợ nhập trả 1 phần hoặc toàn bộ).
- [x] 5.4 Tạo Component biên lai hoàn tiền (Refund K80 Receipt) và in sau khi trả hàng thành công.
- [x] 5.5 Ẩn route `/cashier` đối với role WAREHOUSE (chặn nhân viên kho truy cập link /cashier).

## 6. Frontend UI - ManagerDashboard

- [x] 6.1 Cập nhật màn hình Login để lưu chính xác thông tin Role từ API vào localStorage.
- [x] 6.2 Lắp logic chặn quyền trên `App.tsx` (Protected Routes).
- [x] 6.3 Sửa `SIDEBAR_MENU` trên `ManagerDashboard.tsx` theo vai trò (Ví dụ WAREHOUSE chỉ thấy Tồn kho và Nhập hàng).
- [x] 6.4 Thể hiện dữ liệu "Hàng bán bị trả lại" (Sales Returns) trên `RevenueTab`.
- [x] 6.5 Thêm biểu đồ/thống kê tỷ lệ phần trăm đổi trả so với tổng doanh thu.
