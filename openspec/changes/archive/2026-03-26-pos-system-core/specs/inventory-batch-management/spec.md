## ADDED Requirements

### Requirement: Product Batch Tracking
The system SHALL track inventory at the batch level (`LoHang`) rather than just the product level, ensuring each batch has its own expiration date and precise stock count.

#### Scenario: Stock deduction during sale
- **WHEN** a product is sold
- **THEN** the system deducts the stock from the oldest unexpired batch (FEFO - First Expired, First Out) of that product.

#### Scenario: Expiration warning
- **WHEN** a manager views the inventory dashboard
- **THEN** the system highlights product batches that are within a configurable threshold of their expiration date.

#### Scenario: Expired sale prevention
- **WHEN** a cashier scans a product whose only remaining batches are critically expired
- **THEN** the system displays a warning regarding the expiration status.
