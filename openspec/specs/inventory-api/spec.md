# inventory-api Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
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

### Requirement: Bulk Import API Endpoint
The system SHALL provide a POST `/api/inventory/import-excel` endpoint that receives an array of purchase order line items.

#### Scenario: Processing valid bulk import
- **WHEN** an authenticated user posts a valid array of items to `/api/inventory/import-excel`
- **THEN** the system uses a single database transaction to map barcodes to product IDs, create a master `PhieuNhap`, insert all `ChiTietPhieuNhap` rows, and increment `SoLuongTon` for each product.

#### Scenario: Rejecting invalid barcodes
- **WHEN** the imported array contains barcodes not found in the `SanPham` catalog
- **THEN** the system rolls back the transaction entirely and returns a 400 Error detailing the unmapped barcodes.

