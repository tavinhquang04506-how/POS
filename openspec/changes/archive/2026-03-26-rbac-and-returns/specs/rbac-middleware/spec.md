## ADDED Requirements

### Requirement: Role-Based Endpoint Protection
The backend SHALL verify the JWT role against an allowed list of roles before granting access to sensitive endpoints.

#### Scenario: Unauthorized role access attempt
- **WHEN** a user with CASHIER role attempts to access the GET /api/reports/revenue endpoint (restricted to MANAGER)
- **THEN** system rejects the request with a 403 Forbidden status
