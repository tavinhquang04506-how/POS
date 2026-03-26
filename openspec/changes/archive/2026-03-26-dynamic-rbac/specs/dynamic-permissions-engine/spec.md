## ADDED Requirements

### Requirement: Database-driven Roles and Permissions
The system SHALL store roles and permissions in the database using a relational schema (`GroupRole`, `Permission`, `Role_Permission`) instead of static string validation logic.

#### Scenario: Querying permissions for a role
- **WHEN** the system queries the active permissions for the 'MANAGER' role
- **THEN** it returns an array of assigned permission keys (e.g., `VIEW_INVENTORY`, `EDIT_STAFF`) natively from the database relations
