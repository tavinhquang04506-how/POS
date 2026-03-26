## Why

Hệ thống POS Supermarket hiện tại đã hoàn thiện các chức năng cốt lõi (bán hàng, RBAC, đổi trả, quản lý kho, nhân sự). Tuy nhiên, sau giai đoạn review toàn bộ mã nguồn, phát hiện **12 lỗ hổng nghiệp vụ và thiếu sót UX** trải dài từ mức nghiêm trọng (mất tiền do validate sai) đến mức cải thiện trải nghiệm (thiếu biểu đồ, phân trang). Cần khắc phục ngay để hệ thống đạt chuẩn vận hành thực tế.

## What Changes

### 🔴 Nghiêm trọng (Critical)
- **Inventory API mới**: Thêm `GET /api/inventory` trả về danh sách lô hàng kèm filter hết hạn/sắp hết hàng. Hiện `InventoryTab` đang ký sinh vào `/api/products`.
- **Return validation**: Chặn return trùng lặp — kiểm tra `SoLuongCoTheTra` trước khi chấp nhận phiếu trả mới trên cùng hóa đơn, tránh lỗ tiền.
- **Dashboard Overview**: Trang KPI tổng hợp khi Manager đăng nhập (tổng doanh thu, tổng đổi trả, số hóa đơn hôm nay, top 5 sản phẩm bán chạy, cảnh báo tồn kho thấp).

### 🟡 Trung bình (Medium)
- **Return History Tab**: Tab mới trên Manager Dashboard liệt kê toàn bộ `PhieuTraHang` với filter theo ngày, nhân viên, mã hóa đơn.
- **Search & Filter**: Thanh tìm kiếm trên tất cả bảng dữ liệu (Products, Customers, Invoices, Inventory, Shifts, Staff).
- **Pagination**: Backend API hỗ trợ `?page=&limit=` cho các endpoint danh sách lớn. Frontend hiển thị điều hướng trang.
- **Low Stock Alert**: Badge cảnh báo trên sidebar khi có sản phẩm `SoLuongTon < 10` và thông báo trên Dashboard Overview.
- **Expiry Alert**: Badge cảnh báo trên sidebar khi có lô hàng `HanSuDung < 7 ngày` và thông báo trên Dashboard Overview.

### 🟢 Nice-to-have
- **Excel Export mở rộng**: Thêm nút xuất Excel cho InventoryTab, CustomersTab, ShiftsTab, ReturnHistoryTab.
- **Revenue Chart**: Biểu đồ cột doanh thu theo 7 ngày gần nhất trên RevenueTab (sử dụng Chart.js hoặc Recharts).
- **Customer Portal**: Trang `/customer` để khách hàng xem điểm tích lũy, lịch sử mua hàng (backend `customerLogin` đã sẵn sàng).
- **Change Password**: Endpoint `PUT /api/auth/change-password` + UI modal cho staff đổi mật khẩu.

## Capabilities

### New Capabilities
- `inventory-api`: API endpoint GET danh sách lô hàng với filter (hết hạn, tồn kho thấp)
- `dashboard-overview`: Trang KPI tổng hợp với metrics thời gian thực và cảnh báo
- `return-history`: Tab lịch sử đổi trả trên Manager Dashboard
- `search-filter`: Hệ thống tìm kiếm và lọc dữ liệu trên toàn bộ bảng
- `pagination`: Phân trang cho API và Frontend
- `stock-alerts`: Cảnh báo tồn kho thấp và hàng sắp hết hạn
- `excel-export-extended`: Mở rộng xuất Excel cho toàn bộ module
- `revenue-chart`: Biểu đồ doanh thu theo thời gian
- `customer-portal`: Trang khách hàng tự phục vụ
- `change-password`: Chức năng đổi mật khẩu cho nhân viên

### Modified Capabilities
- `returns`: Thêm validation chống trùng lặp return trên cùng hóa đơn

## Impact

- **Backend**: Thêm/sửa 6+ controller files, thêm middleware pagination
- **Frontend**: Thêm 3 component mới (OverviewTab, ReturnHistoryTab, CustomerPortal page), sửa 8+ component hiện có
- **Database**: Không thay đổi schema (tận dụng model hiện có)
- **Dependencies**: Có thể cần thêm `recharts` hoặc `chart.js` cho biểu đồ
- **API**: Thêm 5+ endpoint mới, sửa behavior của endpoints hiện tại (pagination)
- **Breaking Changes**: Không có — tất cả thay đổi đều backward-compatible
