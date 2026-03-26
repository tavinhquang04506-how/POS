## 1. 🔴 Critical — Inventory API

- [x] 1.1 Thêm `GET /api/inventory` endpoint trong `inventory.controller.ts` (trả về `LoHang` join `SanPham`).
- [x] 1.2 Hỗ trợ query `?expiring=N` lọc lô hàng sắp hết hạn trong N ngày.
- [x] 1.3 Hỗ trợ query `?lowstock=N` lọc sản phẩm có `SoLuongTon < N`.
- [x] 1.4 Đăng ký route trong `index.ts` với `authorizeRoles(['WAREHOUSE', 'MANAGER'])`.
- [x] 1.5 Cập nhật `InventoryTab.tsx` gọi `/api/inventory` thay vì `/api/products`.

## 2. 🔴 Critical — Return Validation

- [x] 2.1 Trong `returns.controller.ts`, trước khi tạo `PhieuTraHang`, query tổng `SoLuongTra` đã return trước đó cho từng `MaSP` trên cùng `MaHD`.
- [x] 2.2 So sánh `SoLuongTra_mới + SoLuongTra_cũ` với `SoLuong` gốc trong `ChiTietHoaDon`. Reject nếu vượt quá.
- [x] 2.3 Cập nhật `getInvoiceForReturn` trả về `SoLuongCoTheTra` chính xác (đã trừ các lần return trước).

## 3. 🔴 Critical — Dashboard Overview

- [x] 3.1 Tạo `OverviewTab.tsx` với 4 KPI cards: Doanh thu hôm nay, Số HĐ hôm nay, Tổng hoàn trả, Top 5 SP bán chạy.
- [x] 3.2 Thêm section cảnh báo tồn kho thấp (SP có `SoLuongTon < 10`).
- [x] 3.3 Thêm section cảnh báo lô hàng sắp hết hạn (HSD < 7 ngày).
- [x] 3.4 Đăng ký OverviewTab làm tab mặc định trong `ManagerDashboard.tsx`.

## 4. 🟡 Medium — Return History Tab

- [x] 4.1 Thêm `GET /api/returns` endpoint trong `returns.controller.ts`.
- [x] 4.2 Tạo `ReturnHistoryTab.tsx` hiển thị bảng danh sách phiếu trả hàng.
- [x] 4.3 Thêm tab "Lịch Sử Đổi Trả" vào sidebar `ManagerDashboard.tsx`.

## 5. 🟡 Medium — Search & Filter

- [x] 5.1 Thêm thanh tìm kiếm vào `ProductsTab.tsx` (lọc theo tên SP).
- [x] 5.2 Thêm thanh tìm kiếm vào `CustomersTab.tsx` (lọc theo tên/SĐT).
- [x] 5.3 Thêm thanh tìm kiếm vào `RevenueTab.tsx` (lọc theo mã HĐ/tên KH).
- [x] 5.4 Thêm thanh tìm kiếm vào `InventoryTab.tsx` (lọc theo tên SP).
- [x] 5.5 Thêm thanh tìm kiếm vào `ShiftsTab.tsx` (lọc theo tên NV).
- [x] 5.6 Thêm thanh tìm kiếm vào `StaffTab.tsx` (lọc theo tên NV).

## 6. 🟡 Medium — Pagination

- [x] 6.1 Tạo helper middleware `paginate` hỗ trợ `?page=&limit=` trên Backend.
- [x] 6.2 Áp dụng pagination cho `GET /api/reports/revenue`.
- [x] 6.3 Áp dụng pagination cho `GET /api/returns`.
- [x] 6.4 Tạo component `Pagination.tsx` dùng chung cho Frontend.
- [x] 6.5 Tích hợp Pagination component vào RevenueTab và ReturnHistoryTab.

## 7. 🟡 Medium — Stock & Expiry Alerts

- [x] 7.1 Tạo `GET /api/alerts` endpoint trả về `{ lowStock, expiring }`.
- [x] 7.2 Hiển thị badge cảnh báo trên sidebar ManagerDashboard (đỏ cho low stock, cam cho expiring).
- [x] 7.3 Tích hợp dữ liệu alert vào OverviewTab (task 3.2, 3.3).

## 8. 🟢 Nice-to-have — Excel Export Mở Rộng

- [x] 8.1 Thêm nút "Xuất Excel" vào `InventoryTab.tsx`.
- [x] 8.2 Thêm nút "Xuất Excel" vào `CustomersTab.tsx`.
- [x] 8.3 Thêm nút "Xuất Excel" vào `ShiftsTab.tsx`.
- [x] 8.4 Thêm nút "Xuất Excel" vào `ReturnHistoryTab.tsx`.

## 9. 🟢 Nice-to-have — Revenue Chart

- [x] 9.1 Cài đặt `recharts` vào Frontend.
- [x] 9.2 Thêm `GET /api/reports/revenue-daily?days=7` endpoint.
- [x] 9.3 Tạo biểu đồ cột trên `RevenueTab.tsx` hiển thị doanh thu 7 ngày gần nhất.

## 10. 🟢 Nice-to-have — Customer Portal

- [x] 10.1 Tạo `CustomerDashboard.tsx` hiển thị điểm tích lũy, hạng thành viên, lịch sử mua.
- [x] 10.2 Thêm route `/customer` vào `App.tsx` với `allowedRoles={['CUSTOMER']}`.
- [x] 10.3 Cập nhật `Login.tsx` để điều hướng CUSTOMER đến `/customer`.

## 11. 🟢 Nice-to-have — Change Password

- [x] 11.1 Thêm `PUT /api/auth/change-password` endpoint trong `auth.controller.ts`.
- [x] 11.2 Tạo modal đổi mật khẩu trên `ManagerDashboard.tsx` (mật khẩu cũ, mới, xác nhận).
