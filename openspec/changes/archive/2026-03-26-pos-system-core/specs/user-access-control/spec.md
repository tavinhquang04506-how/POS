## ADDED Requirements

### Requirement: Role-Based UI and Privileges
The system SHALL restrict access to UI features and data based on the logged-in user's role (Cashier vs. Manager).

#### Scenario: Cashier login
- **WHEN** a user with the Cashier role logs in
- **THEN** the system only displays the POS checkout interface and strictly hides inventory, reporting, and settings menus.

#### Scenario: Manager login
- **WHEN** a user with the Manager role logs in
- **THEN** the system displays all operational dashboards including gross revenue, low stock alerts, and expiration warnings.

#### Scenario: Sensitive action logging
- **WHEN** a Cashier performs a sensitive action like voiding an entire transaction (e.g., via F12)
- **THEN** the system logs the action with a timestamp and the Cashier's ID for later Manager review.
