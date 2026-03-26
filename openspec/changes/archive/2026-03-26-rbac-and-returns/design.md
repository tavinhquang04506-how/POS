## Context

Hệ thống POS hiện tại chỉ đang xử lý chiều bán hàng (`HoaDon`). Khi phát sinh nhu cầu trả lại hàng hóa đã mua, quản lý và thu ngân chưa có công cụ để ghi nhận giao dịch trả hàng, hoàn tiền, cộng lại tồn kho và trừ điểm tích luỹ. Dự án cần bổ sung chức năng đổi trả trực tiếp từ Cashier POS. 

## Goals / Non-Goals

**Goals:**
- Xây dựng luồng trả hàng từ máy POS dựa trên mã Hóa Đơn cũ.
- Tự động hoàn lại số lượng tồn kho và cập nhật số dư điểm thành viên.
- Lưu trữ giao dịch trả hàng phục vụ báo cáo doanh thu chính xác.
- In biên lai hoàn tiền cho khách hàng.

**Non-Goals:**
- Không hỗ trợ trả hàng mà không có hóa đơn gốc.
- Không hỗ trợ phương thức hoàn tiền qua cổng thanh toán (chỉ hoàn tiền mặt hoặc ghi nhận trả qua ví thủ công).
- Không xử lý đổi hàng ngang giá trực tiếp trong một nghiệp vụ (quy trình sẽ là: Trả hàng -> Hoàn tiền -> Tạo đơn mua hàng mới).

## Decisions

1. **Thiết kế Database:**
   - Thay vì tạo bảng `HoaDonDoiTra` mới phức tạp, quyết định: Sử dụng lại bảng `HoaDon` nhưng thêm cột/đánh dấu loại hóa đơn (VD: `LoaiHD` = 'RETURN' hoặc 'SALE'). 
   - Hóa đơn trả (`HoaDon`) sẽ có `TongTienHang` là số âm, và trỏ `MaHDGoc` (nếu cần) hoặc chỉ đơn giản là chứa các `ChiTietHoaDon` với `SoLuong` âm.
   - Vì Prisma Schema hiện tại không có `LoaiHD`, chúng ta sẽ sinh ra một bảng `PhieuTraHang` mới để minh bạch hơn, hoặc ghi đè `TongTienHang` thành số âm. Quyết định: Thêm mô hình `PhieuTraHang` và `ChiTietPhieuTra` trong Prisma để độc lập dữ liệu bán và trả.

2. **Xử lý Tồn kho & Điểm thưởng:**
   - Khi tạo `PhieuTraHang`, hệ thống sẽ kích hoạt 2 trigger/logic trong Transaction:
     - Tăng `SoLuongTon` trong `SanPham` (hoặc `LoHang`).
     - Trừ `DiemTichLuy` của `KhachHang` tương ứng với số tiền hoàn lại.

3. **In Biên Lai:**
   - Tái sử dụng component K80 Thermal Receipt, nhưng thay đổi tiêu đề thành "BIÊN LAI HOÀN TIỀN" và các con số tổng tiền là số cấp âm.

## Risks / Trade-offs

- **Risk:** Lỗi trừ âm điểm tích lũy của khách hàng nếu khách đã dùng hết điểm.
  - **Mitigation:** Cho phép `DiemTichLuy` rơi xuống số âm (tương đương nợ điểm), hoặc chặn không cho trả hàng nếu điểm không đủ (không tối ưu), quyết định cho phép nợ điểm.
- **Risk:** Cập nhật tồn kho sai lô hàng (`LoHang`).
  - **Mitigation:** Hóa đơn gốc không lưu vết mua từ lô nào một cách chi tiết (hiện tại `ChiTietHoaDon` chỉ link tới `MaSP`). Do đó, khi hoàn kho, sản phẩm sẽ được cộng vào tổng `SoLuongTon` chung hoặc đẩy vào lô mới nhất.
## Context

Trong phiên bản hiện tại, 100% người dùng (của nhân viên) khi đăng nhập sẽ chỉ có cờ `VaiTro` đơn giản chưa được Validate kỹ thuật số và Routing tương tứng. Quan trọng hơn, đối tượng Nhóm Khách Hàng (`KhachHang`) chưa tồn tại luồng xác thực (Authentication), khiến việc phát triển Mini App hoặc Web Order dành cho khách hàng bị ngăn chặn. Thiết kế này cung cấp giải pháp xác thực tập trung và kiến trúc Middleware linh hoạt cho 4 Role.

## Goals / Non-Goals

**Goals:**
- Tạo JWT Payload thống nhất: `{ id, role }`, trong đó role thuộc `['CASHIER', 'MANAGER', 'WAREHOUSE', 'CUSTOMER']`.
- Xây dựng Middleware `authorizeRoles([...roles])` bảo vệ các Endpoints trên Express.
- Triển khai "Warehouse Dashboard" đơn giản tích hợp vào `ManagerDashboard.tsx` dựa theo quyền WAREHOUSE.

**Non-Goals:**
- Không chia Role thành các dạng Custom Permissions phức tạp kiểu RBAC nâng cao (như bảng `Role`, `Permission`, `RolePermission`). Chỉ định danh cứng 4 Role trong mã nguồn (Enum-based RBAC đơn giản).
- Không tự động đăng nhập Khách hàng qua OTP thật qua SMS ở giai đoạn này. (Chỉ Authentication bằng Mật Khẩu tự đặt hoặc Default).

## Decisions

1. **Khách hàng Mật khẩu:** 
   - Đề xuất bổ sung column `MatKhau` (String, nullable) vào model `KhachHang`.
   - Nếu đăng ký nhanh tại quầy thu ngân (Cashier), mật khẩu mặc định sẽ là SĐT của khách, khách có thể đổi lại trên App sau này. Khách hàng sử dụng chung logic cấp phát JWT Token (kèm role CUSTOMER) nhưng qua một Endpoint đăng nhập khác: `POST /api/auth/customer-login`.

2. **Enum Roles:**
   - Enum chính thức trong ứng dụng: 
     `enum Role { CASHIER = 'CASHIER', MANAGER = 'MANAGER', WAREHOUSE = 'WAREHOUSE', CUSTOMER = 'CUSTOMER' }`.
   - Dữ liệu `VaiTro` của `NhanVien` sẽ được chuẩn hóa thành một trong 3 Role hệ thống trên để dễ đối chiếu.

3. **Giao Diện "Warehouse Staff" trên React:**
   - Bố cục sẽ dùng chung layout `ManagerDashboard.tsx`, nhưng Sidebar sẽ lọc động tuỳ thuộc vào `user.VaiTro`. Nếu `user.VaiTro === 'WAREHOUSE'`, chỉ hiển thị các tab: Inventory (FEFO) và Receive (Nhập hàng). Nếu cố truy cập bằng đường link URL ảo, code sẽ Redirect về trang trống.

## Risks / Trade-offs

- **Risk:** Code có sẵn trong `auth.middleware.ts` hiện tại `authenticate` có thể đang mặc nhiên tra cứu user từ bảng `NhanVien`.
  - **Mitigation:** Sửa lại Middleware `authenticate` để giải mã token. Nếu role là CUSTOMER, nó cần truy vấn bảng `KhachHang`, thay vì `NhanVien`. Hoặc đơn giản, Middleware phân quyền chỉ lấy dữ liệu đã decode từ JWT (nếu Valid là duyệt qua).
