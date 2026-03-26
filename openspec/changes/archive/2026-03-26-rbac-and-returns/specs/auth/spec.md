## ADDED Requirements

### Requirement: Role Embedded in Token
The system SHALL embed the user's role explicitly in the generated JWT token payload upon successful authentication.

#### Scenario: Verify token payload
- **WHEN** any internal staff member successfully logs in
- **THEN** the returned JWT contains a `role` property matching their assigned VaiTro in the database
