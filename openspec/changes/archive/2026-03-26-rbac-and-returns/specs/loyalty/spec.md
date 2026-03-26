## ADDED Requirements

### Requirement: Loyalty Points Deduction
The system SHALL deduct loyalty points (DiemTichLuy) from the customer when items they earned points for are returned.

#### Scenario: Points adjustment on return
- **WHEN** a return transaction is processed for an invoice associated with a customer
- **THEN** system calculates the equivalent points of the returned value and subtracts it from the customer's DiemTichLuy
