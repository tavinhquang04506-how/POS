# returns Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
### Requirement: Return quantity validation
The system SHALL validate that the total returned quantity for each product on an invoice does not exceed the originally purchased quantity, accounting for all previous returns on that same invoice.

#### Scenario: First return within limit
- **WHEN** a cashier submits a return for invoice #1 with 2 units of product A (originally purchased 5)
- **THEN** the system accepts the return and creates a `PhieuTraHang` record

#### Scenario: Subsequent return exceeds limit
- **WHEN** a cashier submits a return for invoice #1 with 4 units of product A, but 2 units were already returned previously
- **THEN** the system rejects the return with error "Số lượng trả vượt quá số lượng có thể trả" because 2 + 4 > 5

#### Scenario: Return exactly remaining quantity
- **WHEN** a cashier submits a return for invoice #1 with 3 units of product A, and 2 units were already returned
- **THEN** the system accepts the return because 2 + 3 = 5 (equal to original quantity)

### Requirement: Process Return
The system SHALL allow the cashier to enter a valid Invoice ID (MaHD) to begin a return process.

#### Scenario: Valid Invoice entered
- **WHEN** cashier inputs an existing Invoice ID to the Return module
- **THEN** system loads the invoice details including items, quantities, and paid prices

