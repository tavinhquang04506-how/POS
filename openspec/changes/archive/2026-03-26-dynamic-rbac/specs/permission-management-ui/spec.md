## ADDED Requirements

### Requirement: Permission Management Interface
The system SHALL provide a web UI array inside the `ManagerDashboard` allowing administrators to assign or revoke specific module permissions for each role dynamically.

#### Scenario: Toggling a permission state
- **WHEN** an admin checks the `EDIT_INVENTORY` box for the `CASHIER` role and submits the change
- **THEN** the system persists the updated `Role_Permission` mapping immediately to the database
