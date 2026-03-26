## Why

The current POS system is highly functional but functions more as a technical demonstration. To commercialize the software for real-world mini-supermarkets (e.g., Mini Stop, WinMart), the system must handle real-world operational complexities. This includes seeded real data (EAN-13 barcodes), physical hardware integration (thermal receipt printing), and operational accountability (shift management for cashiers). 

## What Changes

- Add a robust database seeder containing >30 real FMCG products with actual EAN-13 barcodes, categories, and realistic pricing.
- Modify the database schema to include a `CaLamViec` (Shift Management) table to track cashier hours and cash drawer amounts.
- Build a dedicated Receipt Print template formatted for 80mm (K80) thermal printers.
- Update the POS UI to enforce opening a "Shift" before allowing any checkout transactions.

## Capabilities

### New Capabilities
- `shift-management`: Introduces the ability for cashiers to open and close shifts, tracking total cash entering and leaving the secure drawer.
- `receipt-printing`: Extends the checkout flow to automatically generate and trigger a browser-based print dialog for a thermal-formatted receipt.

### Modified Capabilities
- `product-catalog`: Replaces mock/demo data with real-world, commercial FMCG datasets and international EAN-13 barcodes for 1D scanning.

## Impact

- **Database**: Migration required to add `CaLamViec`.
- **Backend**: New APIs for Shift Management. Checkout API must link to the Active Shift.
- **Frontend**: Heavy UI updates for Shift Modals and Print Media CSS.
