# auth Specification

## Purpose
TBD - created by archiving change rbac-and-returns. Update Purpose after archive.
## Requirements
### Requirement: Role Embedded in Token
The system SHALL embed the user's role explicitly in the generated JWT token payload upon successful authentication.

#### Scenario: Verify token payload
- **WHEN** any internal staff member successfully logs in
- **THEN** the returned JWT contains a `role` property matching their assigned VaiTro in the database

### Requirement: JWT Permission Payload Injection
The system SHALL query the user's role and embed the fully evaluated array of permission keys within their JWT payload upon a successful login event.

#### Scenario: Generating a token for a manager
- **WHEN** a user with the `MANAGER` role authenticates successfully
- **THEN** their generated JWT payload includes a `permissions` array containing all keys granted to the `MANAGER` role

