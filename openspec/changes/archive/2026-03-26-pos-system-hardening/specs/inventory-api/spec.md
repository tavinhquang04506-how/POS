## ADDED Requirements

### Requirement: Inventory batch listing
The system SHALL provide a GET `/api/inventory` endpoint that returns all `LoHang` records joined with their parent `SanPham` data.

#### Scenario: List all batches
- **WHEN** an authenticated MANAGER or WAREHOUSE user calls `GET /api/inventory`
- **THEN** the system returns an array of batches with product name, quantity, import price, and expiry date

### Requirement: Filter expiring batches
The system SHALL support a query parameter `?expiring=N` to filter batches expiring within N days.

#### Scenario: Filter batches expiring within 7 days
- **WHEN** user calls `GET /api/inventory?expiring=7`
- **THEN** only batches with `HanSuDung` within 7 days from now are returned

### Requirement: Filter low stock products
The system SHALL support a query parameter `?lowstock=N` to filter products with `SoLuongTon < N`.

#### Scenario: Filter products with stock below threshold
- **WHEN** user calls `GET /api/inventory?lowstock=10`
- **THEN** only batches belonging to products with `SoLuongTon < 10` are returned
