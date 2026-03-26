## ADDED Requirements

### Requirement: Customer Loyalty Program
The system SHALL support customer identification via phone number and the application of loyalty points (`DiemTichLuy`) for invoice discounts.

#### Scenario: Customer identification
- **WHEN** the cashier enters a customer's phone number during checkout
- **THEN** the system displays the customer's name and available loyalty points.

#### Scenario: Applying points discount
- **WHEN** the cashier chooses to apply available loyalty points
- **THEN** the system reduces the total invoice amount proportionally and deducts the used points from the customer's balance.

#### Scenario: Accumulating new points
- **WHEN** a transaction is completed and linked to a customer
- **THEN** the system adds a set percentage of the total invoice value as new loyalty points to the customer's account.
