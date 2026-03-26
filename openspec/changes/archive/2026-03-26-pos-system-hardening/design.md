## Context

Hệ thống POS Supermarket hiện tại gồm Backend (Express + Prisma/SQLite) và Frontend (React + Vite). Đã hoàn thành: RBAC, Returns, FEFO Inventory, Loyalty Tiers, Shift Management, và Staff CRUD. Tuy nhiên thiếu nhiều chức năng vận hành thực tế (xem proposal.md).

**Stack hiện tại:**
- Backend: 11 controllers, 1 middleware, Prisma ORM
- Frontend: 3 pages (Login, CashierPOS, ManagerDashboard), 8 manager tabs
- Database: SQLite với 9 models

## Goals / Non-Goals

**Goals:**
- Bổ sung đầy đủ API endpoints cho Inventory (GET list, filter)
- Chặn return trùng lặp để bảo toàn tài chính
- Thêm Dashboard Overview với KPI metrics thời gian thực
- Thêm Return History Tab, Search/Filter, Pagination
- Tích hợp cảnh báo tồn kho thấp và hàng sắp hết hạn
- Mở rộng Excel Export toàn hệ thống
- Thêm biểu đồ doanh thu (Revenue Chart)
- Xây dựng Customer Portal và Change Password

**Non-Goals:**
- Không thay đổi database schema (tận dụng model hiện có)
- Không triển khai push notification qua WebSocket (dùng polling/badge)
- Không làm mobile responsive (chỉ desktop)
- Không tích hợp payment gateway thật

## Decisions

### 1. Inventory API — Tách endpoint riêng
Thêm `GET /api/inventory` trả về danh sách `LoHang` kèm join `SanPham`. Hỗ trợ query params: `?expiring=7` (lô sắp hết hạn trong N ngày), `?lowstock=10` (SP có tồn kho < N).   
**Lý do:** InventoryTab hiện dùng `/api/products` rồi đọc nested `LoHangs` — không tối ưu và thiếu khả năng filter phía server.

### 2. Return Validation — Server-side quantity tracking
Khi `POST /api/returns`, tính tổng `SoLuongTra` đã return trước đó cho từng `MaSP` trong cùng `MaHD`. So sánh với `SoLuong` gốc trong `ChiTietHoaDon`. Chặn nếu vượt quá.  
**Lý do:** Hiện tại không validate → có thể return vô hạn lần trên cùng 1 hóa đơn.

### 3. Dashboard Overview — Frontend-only aggregation
Tạo `OverviewTab.tsx` gọi các API hiện có (`/api/reports/revenue`, `/api/inventory`) rồi tổng hợp KPI cards phía client.  
**Lý do:** Không cần thêm endpoint mới, tận dụng data đã có. Đơn giản và nhanh.

### 4. Search/Filter — Client-side filtering
Implement search trên frontend bằng cách filter array đã fetch. Không thêm search endpoint phía backend.  
**Lý do:** Với SQLite và dataset < 10000 records, client-side filter đủ nhanh. Chỉ cần backend pagination cho scalability.

### 5. Pagination — Cursor-based via query params
Thêm `?page=1&limit=20` cho các GET endpoints trả danh sách. Response kèm `{ data: [], total, page, totalPages }`.  
**Lý do:** Simple offset pagination phù hợp với SQLite + Prisma `skip/take`.

### 6. Chart Library — Recharts
Chọn Recharts (React-native chart library) thay vì Chart.js.  
**Lý do:** Recharts là React component thuần, tích hợp mượt hơn với existing stack. Không cần canvas manipulation.

### 7. Customer Portal — Reuse existing Login
Thêm route `/customer` với `CustomerDashboard.tsx`. Dùng `customerLogin` API đã có. Giao diện đơn giản: xem điểm, xem lịch sử mua.  
**Lý do:** Backend đã sẵn sàng (endpoint + JWT), chỉ cần frontend.

## Risks / Trade-offs

- **Client-side search không scale** → Nếu dataset tăng > 50000 records sẽ cần chuyển sang server-side search với full-text index. Accepted vì scope hiện tại là siêu thị nhỏ.
- **Recharts bundle size** → Thêm ~200KB gzipped. Acceptable cho admin dashboard.
- **Customer Portal security** → Khách hàng xem được lịch sử mua hàng có thể là vấn đề privacy. Cần đảm bảo token chỉ trả data của chính khách hàng đó.
