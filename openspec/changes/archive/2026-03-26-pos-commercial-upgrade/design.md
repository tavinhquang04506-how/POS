## Context

Mini-supermarkets operate in fast-paced environments requiring strict accountability (shifts) and seamless hardware interaction (printing). The current web app lacks database structures to trace which cashier sold what during a specific time period (a "Shift"). Furthermore, customers expect printed receipts.

## Goals / Non-Goals

**Goals:**
- Implement a `CaLamViec` (Shift) table to link invoices (`HoaDon`) to specific working windows.
- Seed the database with high-quality, real-world data to make the app instantly demo-able to investors/clients.
- Provide a responsive print layout (`@media print`) that perfectly fits K80 thermal paper without requiring complex native desktop drivers.

**Non-Goals:**
- Direct hardware serial port communication (Esc/POS commands via native bindings). We rely on the browser's native print spooler for broad Linux cross-compatibility.

## Decisions

1. **Shift Management Enforcement**:
   - The Cashier cannot access the POS interface unless they have an "Active" shift. Upon login, if no active shift exists for their `MaNV`, they are prompted to enter their starting cash drawer amount to "Open Shift".
2. **K80 Receipt Format**:
   - Instead of generating a PDF on the backend (which is slow), we will render a hidden React component styled specifically with CSS `@media print { ... }`. When the transaction completes, we call `window.print()`.

## Risks / Trade-offs

- **Risk**: Browser print dialog interrupts the fast-paced checkout flow.
  - **Mitigation**: Modern browsers allow Kiosk Mode or Silent Printing flags (`--kiosk-printing` on Chrome/Chromium) which bypasses the dialog entirely on the final POS hardware.
