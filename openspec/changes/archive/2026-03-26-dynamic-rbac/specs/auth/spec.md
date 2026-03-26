## ADDED Requirements

### Requirement: JWT Permission Payload Injection
The system SHALL query the user's role and embed the fully evaluated array of permission keys within their JWT payload upon a successful login event.

#### Scenario: Generating a token for a manager
- **WHEN** a user with the `MANAGER` role authenticates successfully
- **THEN** their generated JWT payload includes a `permissions` array containing all keys granted to the `MANAGER` role
