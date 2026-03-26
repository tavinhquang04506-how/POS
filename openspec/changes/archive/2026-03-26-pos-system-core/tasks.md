## 1. Project Initialization & Database Setup

- [ ] 1.1 Initialize the Node.js backend project (`/backend`) with TypeScript, Express, and Prisma.
- [ ] 1.2 Define the Prisma schema for the 7 tables (`NhanVien`, `KhachHang`, `LoaiHang`, `SanPham`, `LoHang`, `HoaDon`, `ChiTietHoaDon`).
- [ ] 1.3 Run Prisma migrations to generate the SQLite database and seed initial admin data.

## 2. Backend Implementation (Express/Prisma Services)

- [ ] 2.1 Implement `AuthService` for `NhanVien` login and role-based authentication middleware.
- [ ] 2.2 Implement `SanPhamService` & `LoHangService` (CRUD for products and fetch batches by FEFO/Expiration).
- [ ] 2.3 Implement `KhachHangService` (CRUD and retrieve customer loyalty points).
- [ ] 2.4 Implement `HoaDonService` handling atomic `$transaction` inserts for `HoaDon`, `ChiTietHoaDon` and deducting stock from `LoHang`.

## 3. Frontend Initialization (React)

- [ ] 3.1 Initialize the React frontend project (`/frontend`) with Vite, TypeScript, Tailwind CSS, and simple components.
- [ ] 3.2 Setup React Router with protected routes mapping to `Cashier` vs `Manager` roles.

## 4. Frontend Implementation - POS Cashier & Manager GUIs

- [ ] 4.1 Build the `Login` screen for authenticating as Cashier or Manager.
- [ ] 4.2 Build the `Cashier POS Interface` optimized for barcode scanning, displaying cart items, and auto-calculating totals.
- [ ] 4.3 Build the `Payment Modal` capturing received cash, returning change, and triggering checkout.
- [ ] 4.4 Build the `Dashboard` for Managers displaying low stock and expiration date alerts.

## 5. Integration & Polish

- [ ] 5.1 Wire up the Cashier POS to interact with the real backend API (fetch product by barcode, submit invoice).
- [ ] 5.2 Intercept global keyboard events (Enter to checkout, F12 to void item) in the Cashier Dashboard.
- [ ] 5.3 Verify comprehensive error handling (e.g., showing alert if expired item is scanned or if transaction rollback occurs).
