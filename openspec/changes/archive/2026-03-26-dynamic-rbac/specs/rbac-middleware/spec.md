## ADDED Requirements

### Requirement: Dynamic Payload Authorization
The Express middleware SHALL evaluate incoming API requests by ensuring the user's JWT permission array intersects with the endpoint's required functional permission keys.

#### Scenario: Authorized API interaction
- **WHEN** a user requests `POST /api/products` and their JWT contains the `EDIT_PRODUCTS` permission
- **THEN** the request proceeds to the specific route controller

#### Scenario: Unauthorized API interaction
- **WHEN** a user requests `POST /api/products` but their JWT lacks the `EDIT_PRODUCTS` permission
- **THEN** access is immediately denied with a `403 Forbidden` response
