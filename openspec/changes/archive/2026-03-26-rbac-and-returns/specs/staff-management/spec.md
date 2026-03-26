## ADDED Requirements

### Requirement: Role Selection Enforcement
The system SHALL require managers to explicitly select one of the allowed roles (CASHIER, MANAGER, WAREHOUSE) when creating a new staff account.

#### Scenario: Staff creation with valid role
- **WHEN** a manager submits the form to create a new staff member with the WAREHOUSE role
- **THEN** the system validates the role against the defined Roles enum and successfully saves the staff record
