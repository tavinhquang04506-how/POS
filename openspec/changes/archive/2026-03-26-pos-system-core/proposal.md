## Why

The project requires a POS system for mini-supermarkets to handle checkout speed, manage product expiration dates accurately via batch tracking (`LoHang`), and prevent inventory loss. Existing off-the-shelf software lacks deep inventory tracking by expiration date. Switching from WinForms to a modern Web App architecture ensures seamless cross-platform deployment on Linux-based POS terminals at supermarkets without sacrificing performance.

## What Changes

- Implement a Web Application architecture (Frontend: React/Vite/Tailwind, Backend: Node.js/Express, ORM: Prisma, Database: SQLite/PostgreSQL).
- Create a streamlined Cashier interface enabling 100% keyboard operation (e.g., F12 to cancel, Enter to pay) and fast barcode scanning.
- Develop a robust database schema featuring a distinct `LoHang` (Batch) table to track expiration dates for each product batch accurately.
- Establish Role-Based Access Control distinguishing Cashier (sales only) and Manager (reporting, inventory, refunds) privileges.
- Implement transactional sales processing to ensure data integrity during checkout.
- Relocate the `DiemTichLuy` (loyalty points) attribute to the `KhachHang` table to reflect proper business logic.

## Capabilities

### New Capabilities
- `pos-checkout`: Fast keyboard-driven barcode scanning, cart management, tax calculation, payment processing, and receipt generation.
- `inventory-batch-management`: Tracking products by incoming batches (`LoHang`) to monitor expiration dates and alert staff about items nearing expiration.
- `member-loyalty`: Managing customer data and loyalty points (`DiemTichLuy`), applying discounts during checkout.
- `user-access-control`: Differentiating permissions and UI access between Cashier and Manager roles.

### Modified Capabilities
- (None)

## Impact

- **Database**: Creates 7 relational tables via Prisma schema (`NhanVien`, `KhachHang`, `LoaiHang`, `SanPham`, `LoHang`, `HoaDon`, `ChiTietHoaDon`).
- **Application**: Establishes a `/frontend` React codebase and `/backend` Node.js API codebase.
