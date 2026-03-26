## ADDED Requirements

### Requirement: Customer Login
The system SHALL allow customers to authenticate using their phone number and password to access their profile and order history.

#### Scenario: Successful customer login
- **WHEN** customer provides a registered phone number and correct password to the customer auth endpoint
- **THEN** system returns a valid JWT token with the CUSTOMER role and customer ID
