## 1. Cơ sở dữ liệu (Database) 🛠️
- [x] 1.1 Khởi tạo Model `GroupRole`, `Permission`, `Role_Permission` trong `schema.prisma`.
- [x] 1.2 Viết script seed mặc định 3 vai trò (MANAGER, CASHIER, WAREHOUSE) và các quyền gốc vào Database để không làm sập Logic hệ thống cũ khi Migrate.
- [x] 1.3 Chạy lệnh `npx prisma db push` (hoặc migrate).

## 2. API & Middleware (Backend) ⚙️
- [x] 2.1 Cập nhật `auth.controller.ts` để đọc và đính kèm mảng mã `Permission` vào field `permissions` của cấu trúc JWT Payload lúc Login.
- [x] 2.2 Viết lại logic hàm `authorizeRoles` trong `auth.middleware.ts` để kiểm tra mảng JWT `permissions` thay vì `VaiTro` string rập khuôn.
- [x] 2.3 Tạo file API mới (ví dụ `rbac.controller.ts`) phụ trách CRUD dữ liệu của GroupRole và Permission.
- [x] 2.4 Đăng ký các route `/api/rbac/*` vào `index.ts`.

## 3. Giao diện Cấp Quyền (Frontend) 🖥️
- [x] 3.1 Nâng cấp form tạo mới/sửa User ở `StaffTab.tsx` gọi Data từ cấu trúc `GroupRole` thay vì `<select>` option tĩnh.
- [x] 3.2 Tạo tab giao diện mới `RoleManagementTab.tsx` với Table Controller hiển thị bảng Matrix ma trận phân vị quyền (`Permission Matrix`).
- [x] 3.3 Thiết kế các Checkbox State (Toggle) gọi về API `PUT /api/rbac/roles/:id/permissions` để cập nhật quyền Role theo thời gian thực.
- [x] 3.4 Sàng lọc (Filter) `SIDEBAR_MENU` trong `ManagerDashboard.tsx` dựa trên biến `user.permissions` đánh dấu hiển thị theo Token mới.

## 4. Kiểm thử Backend & Phân quyền (QA) 🧪
- [x] 4.1 Login test với tài khoản STAFF cũ đảm bảo hệ thống tự map sang Role mặc định.
- [x] 4.2 Thử gỡ quyền `VIEW_INVENTORY` của vai trò CASHIER trên UI Phân Quyền xem Menu "Tồn Kho" có biến mất lập tức sau khi Token refresh không.
- [x] 4.3 Thử tự cấp quyền CRUD Staff cho riêng WAREHOUSE (từ giao diện UI) và verify Backend có phản hồi `200` tại Router `/api/staff` không.
