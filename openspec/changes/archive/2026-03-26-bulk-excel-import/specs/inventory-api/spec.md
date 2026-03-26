## ADDED Requirements

### Requirement: Bulk Import API Endpoint
The system SHALL provide a POST `/api/inventory/import-excel` endpoint that receives an array of purchase order line items.

#### Scenario: Processing valid bulk import
- **WHEN** an authenticated user posts a valid array of items to `/api/inventory/import-excel`
- **THEN** the system uses a single database transaction to map barcodes to product IDs, create a master `PhieuNhap`, insert all `ChiTietPhieuNhap` rows, and increment `SoLuongTon` for each product.

#### Scenario: Rejecting invalid barcodes
- **WHEN** the imported array contains barcodes not found in the `SanPham` catalog
- **THEN** the system rolls back the transaction entirely and returns a 400 Error detailing the unmapped barcodes.
