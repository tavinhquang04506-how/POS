## Why

Theo phân tích thiết kế, hệ thống POS hiện tại cần giải quyết 2 bài toán lớn:
1. **Phân quyền (RBAC):** Phân tách rõ ràng quyền hạn của 4 nhóm đối tượng (Actor): Nhân viên thu ngân, Nhân viên quản lý, Khách hàng và Nhân viên kho.
2. **Đổi trả hàng (Returns & Refunds):** Bổ sung quy trình "Trả Hàng" (chiều về) trên Giao diện Thu Ngân để hoàn tiền và trả lại kho.

## What Changes

- **RBAC & Security:**
  - Xây dựng lại Middleware phân quyền (`authorizeRole`) trên Backend để bảo vệ API theo 4 quyền: `CASHIER`, `MANAGER`, `WAREHOUSE`, `CUSTOMER`.
  - Chuẩn hóa cột `VaiTro` trong bảng `NhanVien`, thêm xác thực JWT cho `KhachHang` bằng SĐT và Mật khẩu.
  - Phân quyền Protected Routes trên React (ẩn/hiện Sidebar tuỳ quyền).

- **Returns & Refunds:**
  - Bổ sung quy trình "Trả Hàng" nhập mã Hóa Đơn cũ để lấy danh sách sản phẩm.
  - Tự động hoàn lại số lượng tồn kho (`SoLuongTon`) và trừ đi Điểm Tích Lũy đã cộng.
  - Hỗ trợ in Hóa Đơn Hoàn Tiền (Refund Receipt) qua máy K80.

## Capabilities

### New Capabilities
- `returns`: Quy trình trả hàng, xử lý logic hoàn tiền và chọn sản phẩm từ hóa đơn cũ.
- `refund-receipt`: Chức năng in biên lai hoàn tiền cho khách.
- `customer-auth`: Cấp JWT Token cho Khách hàng để đăng nhập.
- `warehouse-portal`: Quy định quyền truy cập riêng của Nhân viên Kho (chỉ thấy Tồn kho, Nhập hàng).
- `rbac-middleware`: Khung phân quyền kỹ thuật bảo vệ API Backend.

### Modified Capabilities
- `checkout`: Cần theo dõi thêm trạng thái hoàn trả, tránh trả lại nhiều lần.
- `inventory`: Cộng ngược tồn kho khi có trả hàng.
- `loyalty`: Thu hồi điểm thưởng tương ứng với giá trị hàng bị trả lại.
- `reporting`: Báo cáo doanh thu cần trừ đi giá trị hàng trả.
- `auth`: Logic đăng nhập trả về Role cụ thể (CASHIER, MANAGER, WAREHOUSE).
- `staff-management`: Quản lý cấp role chuẩn cho nhân sự mới.

## Impact

- Cần cập nhật `schema.prisma` (thêm `MatKhau` cho Khách hàng, tạo bảng `PhieuTraHang`).
- Cần cập nhật toàn bộ API Backend qua Middleware RBAC.
- Điều chỉnh UI ManagerDashboard và CashierPOS để tuân thủ quyền.
