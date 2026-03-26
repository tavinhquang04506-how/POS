# checkout Specification

## Purpose
TBD - created by archiving change rbac-and-returns. Update Purpose after archive.
## Requirements
### Requirement: Invoice Return Tracking
The system SHALL prevent returning an item more times than it was purchased on a single invoice.

#### Scenario: Try to return already returned items
- **WHEN** cashier attempts to return an item that was fully returned in a previous transaction for the same Invoice ID
- **THEN** system blocks the return and displays an error indicating "Item already returned"

