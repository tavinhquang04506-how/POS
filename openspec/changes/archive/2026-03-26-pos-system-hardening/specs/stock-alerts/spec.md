## ADDED Requirements

### Requirement: Low stock alert badge
The system SHALL display a notification badge on the sidebar showing the count of products with `SoLuongTon < 10`.

#### Scenario: Badge appears when stock is low
- **WHEN** 3 products have stock below 10
- **THEN** the sidebar Inventory menu item shows a red badge with "3"

### Requirement: Expiry alert badge
The system SHALL display a notification badge on the sidebar showing the count of batches expiring within 7 days.

#### Scenario: Badge appears for expiring batches
- **WHEN** 2 batches are expiring within 7 days
- **THEN** the sidebar Inventory menu item shows an orange badge with "2"

### Requirement: Combined alert API
The system SHALL provide a `GET /api/alerts` endpoint returning counts of low stock items and expiring batches.

#### Scenario: Fetch alert counts
- **WHEN** an authenticated user calls `GET /api/alerts`
- **THEN** the system returns `{ lowStock: 3, expiring: 2 }`
