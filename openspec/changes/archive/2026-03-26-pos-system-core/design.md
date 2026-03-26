## Context

The POS system is being built for mini-supermarkets taking over manual or inadequate software systems. The key constraints are high-speed checkout needs, accurate management of product expiration dates (cận date), and deployment flexibility. Originally set for C# WinForms, the architecture shifted to a modern Web Application stack (React + Node.js) to guarantee smooth execution on Linux-based terminals without compatibility issues.

## Goals / Non-Goals

**Goals:**
- Implement a decoupled architecture (Frontend UI vs Backend API) for maintainability and scalability.
- Ensure the database schema rigorously handles product batches (`LoHang`) and prevents deletion of items that have transaction history.
- Deliver a fast, keyboard-shortcut-driven interface for Cashiers in the browser.
- Facilitate atomic transactions during checkout to prevent partial sales data.

**Non-Goals:**
- Implementing an online e-commerce storefront.
- Handling employee payroll or complex accounting tasks.

## Decisions

1. **Architecture - Web-Based Stack:**
   - **Frontend (UI)**: React.js (Vite) + TailwindCSS. Accessible via any modern browser, fully cross-platform (runs perfectly on Linux POS).
   - **Backend (API)**: Node.js (Express) with RESTful endpoints routing requests to controllers and services.
   - **Database (DAL)**: Prisma ORM over SQLite (easily adaptable to PostgreSQL). Expressive schema modeling and built-in transaction support.
   - *Rationale*: A web tech stack is the industry standard for modern POS (like KiotViet/Sapo), enabling remote management and cross-platform terminal use.

2. **Database Schema - Separating `LoHang` (Batches):**
   - **Decision**: Not storing `StockQuantity` and `ExpirationDate` directly on the `SanPham` (Product) table alone. Instead, `LoHang` tracks each incoming batch linked to `SanPham`.
   - *Rationale*: Solves the critical business problem of managing products with the same barcode but different expiration dates.

3. **Database Schema - Storing Transient Data (`ThueVAT` & `DonGia`):**
   - **Decision**: `ChiTietHoaDon` (Invoice Details) stores the `DonGia` (Unit Price) at the time of sale. `HoaDon` stores the calculated `TongThueGTGT` (Total Tax) and `PhuongThucThanhToan`.
   - *Rationale*: Prices and taxes change over time. Storing the exact value at checkout ensures history reports remain accurate.

4. **Transactions (Rollback Mechanism):**
   - **Decision**: The backend service must wrap inserting into `HoaDon`, inserting into `ChiTietHoaDon`, and updating `LoHang`/`SanPham` stock levels in a single `$transaction` using Prisma.
   - *Rationale*: Prevents orphan invoice records or inaccurate stock if the system crashes mid-checkout.

## Risks / Trade-offs

- **[Risk]** Hotkeys (F12, Enter) in a web browser can sometimes conflict with browser defaults.
  - *Mitigation*: The React frontend will aggressively intercept keyboard events (`e.preventDefault()`) when the POS component is mounted to override browser defaults like F5 or F12.
