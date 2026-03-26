## Why

The current POS uses a flat point-deduction system (1 point = 1000 VND). To provide a highly competitive enterprise-grade retail experience (Level 3 standard), the system needs a configurable Loyalty Tier Engine (e.g., Silver, Gold, Platinum). This allows supermarket owners to set dynamic percentage discounts based on customer loyalty, encouraging higher retention. Additionally, cashiers currently have no way to register empty profiles quickly at the checkout counter, losing potential data.

## What Changes

- Introduce a dynamic `HangThanhVien` (MembershipTier) database model controlling discount percentages based on accumulated points thresholds.
- Upgrade `KhachHang` to automatically link and compute their Tier.
- Add an inline Fast-Registration modal in the Cashier POS to capture unlisted phone numbers in 5 seconds.
- Build a Settings tab in the Manager Dashboard to fully Create, Read, Update, and Delete pricing tiers.

## Capabilities

### New Capabilities
- `loyalty-tier-engine`: Dynamic tiering system that calculates automatic percentage discounts to the total invoice.
- `pos-fast-registration`: A streamlined interface to inject new customers into the database without leaving the checkout loop.

### Modified Capabilities
- `checkout`: Invoice API and frontend must be rewritten to handle automatic percentage-based discounts instead of flat point-burning.

## Impact

- **Database**: Migration heavily modifying `KhachHang` and creating `HangThanhVien`.
- **Manager Backend**: New REST CRUD routes for Tiers.
- **Cashier POS**: Discount logic overrides and Inline Modals.
