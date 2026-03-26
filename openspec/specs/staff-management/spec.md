# staff-management Specification

## Purpose
TBD - created by archiving change rbac-and-returns. Update Purpose after archive.
## Requirements
### Requirement: Role Selection Enforcement
The system SHALL require managers to explicitly select one of the allowed roles (CASHIER, MANAGER, WAREHOUSE) when creating a new staff account.

#### Scenario: Staff creation with valid role
- **WHEN** a manager submits the form to create a new staff member with the WAREHOUSE role
- **THEN** the system validates the role against the defined Roles enum and successfully saves the staff record

### Requirement: Dynamic Staff Role Assigment
The system SHALL populate the staff CRUD interfaces by querying dynamic active roles from the database rather than a static JSX enum dropdown.

#### Scenario: Selecting a role for a new hire
- **WHEN** an administrator opens the "Tuyển Nhân Sự" modal configuration
- **THEN** the `VaiTro` dropdown renders a dynamic list queried from the `GroupRole` database records

