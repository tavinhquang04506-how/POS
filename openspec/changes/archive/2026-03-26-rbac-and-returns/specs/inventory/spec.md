## ADDED Requirements

### Requirement: Inventory Restoration
The system SHALL restore the stock quantity (SoLuongTon) of items that are successfully returned.

#### Scenario: Return item restores stock
- **WHEN** an item is returned via a return transaction
- **THEN** system automatically increases the SoLuongTon of the corresponding MaSP by the returned quantity
