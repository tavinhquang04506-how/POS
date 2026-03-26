## Context

Retail stores utilizing Level 3 Loyalty strategies separate their customers into strictly defined brackets (e.g., Bronze: 0pts = 0%, Silver: 50pts = 2%, Gold: 200pts = 5%). The POS must automatically identify the tier when the cashier enters the phone number and inject the discount math across the entire cart transparently. 

## Goals / Non-Goals

**Goals:**
- Provide a database-driven table `HangThanhVien` so Managers can configure Tiers on the fly without changing code.
- Implement an automatic `KhachHang` promotion system: when a customer earns enough points from a purchase, their next visit will grant them the higher tier.
- Add a "Tạo Khách Mới" button in the Cashier UI that instantly hits `POST /api/customers` and selects them into the active cart.

**Non-Goals:**
- Complicated product-specific discounts. The Tier discount applies to the `TongTienHang` (Subtotal) of the entire invoice evenly.

## Decisions

1. **Auto-Tier Calculation**:
   Instead of storing a hardcoded `MaHang` foreign key in `KhachHang` which can desync if the Manager changes tier thresholds, `KhachHang` will only store `DiemTichLuy`. During lookup (`GET /api/customers/:phone`), the backend will dynamically query the highest `HangThanhVien` where `MinDiem <= KhachHang.DiemTichLuy` and return it.
2. **Discount Source of Truth**:
   The Frontend only displays the Tier Percentage. The true discount is strictly calculated on the Backend inside the Prisma `$transaction` against the live `HangThanhVien` table to block API manipulation.

## Risks / Trade-offs

- **Risk**: Changing Tier thresholds retroactively demotes existing customers.
  - **Mitigation**: Standard retail behavior. If a Manager raises Gold from 200pts to 500pts, 300pt customers will drop to Silver. We rely on the Manager's operational judgment.
