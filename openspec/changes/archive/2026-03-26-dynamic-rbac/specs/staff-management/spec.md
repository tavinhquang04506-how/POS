## ADDED Requirements

### Requirement: Dynamic Staff Role Assigment
The system SHALL populate the staff CRUD interfaces by querying dynamic active roles from the database rather than a static JSX enum dropdown.

#### Scenario: Selecting a role for a new hire
- **WHEN** an administrator opens the "Tuyển Nhân Sự" modal configuration
- **THEN** the `VaiTro` dropdown renders a dynamic list queried from the `GroupRole` database records
