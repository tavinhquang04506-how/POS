# rbac-middleware Specification

## Purpose
TBD - created by archiving change rbac-and-returns. Update Purpose after archive.
## Requirements
### Requirement: Role-Based Endpoint Protection
The backend SHALL verify the JWT role against an allowed list of roles before granting access to sensitive endpoints.

#### Scenario: Unauthorized role access attempt
- **WHEN** a user with CASHIER role attempts to access the GET /api/reports/revenue endpoint (restricted to MANAGER)
- **THEN** system rejects the request with a 403 Forbidden status

### Requirement: Dynamic Payload Authorization
The Express middleware SHALL evaluate incoming API requests by ensuring the user's JWT permission array intersects with the endpoint's required functional permission keys.

#### Scenario: Authorized API interaction
- **WHEN** a user requests `POST /api/products` and their JWT contains the `EDIT_PRODUCTS` permission
- **THEN** the request proceeds to the specific route controller

#### Scenario: Unauthorized API interaction
- **WHEN** a user requests `POST /api/products` but their JWT lacks the `EDIT_PRODUCTS` permission
- **THEN** access is immediately denied with a `403 Forbidden` response

