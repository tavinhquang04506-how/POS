## 1. Database & Real Data

- [ ] 1.1 Update `schema.prisma` to include `CaLamViec` model and link it to `HoaDon` and `NhanVien`.
- [ ] 1.2 Run Prisma migration for the new Shift schema.
- [ ] 1.3 Write `seed.ts` with >30 real FMCG items (drinks, snacks, hygiene) using valid EAN-13 barcodes and real prices.

## 2. Shift Management Architecture

- [ ] 2.1 Build Express APIs to Open, Close, and fetch Current Active Shift for a Cashier.
- [ ] 2.2 Update Backend Checkout API to require and link the transaction to an active `MaCa` (Shift ID).
- [ ] 2.3 Build React Shift Modal (Open/Close shift, enter initial cash amount).

## 3. Receipt Printing

- [ ] 3.1 Build a visually hidden K80 Receipt React Component in `CashierPOS`.
- [ ] 3.2 Add `@media print` CSS rules in Tailwind to format the 80mm width perfectly.
- [ ] 3.3 Hook `window.print()` to automatically fire immediately after a successful checkout.
