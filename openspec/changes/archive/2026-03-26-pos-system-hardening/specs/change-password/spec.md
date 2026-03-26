## ADDED Requirements

### Requirement: Change password endpoint
The system SHALL provide a `PUT /api/auth/change-password` endpoint allowing authenticated staff to change their password.

#### Scenario: Successful password change
- **WHEN** a staff member sends `PUT /api/auth/change-password` with `{ oldPassword, newPassword }`
- **THEN** the system verifies the old password, hashes the new password, updates the record, and returns success

#### Scenario: Wrong old password
- **WHEN** a staff member sends an incorrect `oldPassword`
- **THEN** the system returns 400 with error "Mật khẩu cũ không chính xác"

### Requirement: Change password UI
The system SHALL provide a modal accessible from the Manager Dashboard sidebar for staff to change their password.

#### Scenario: Staff opens change password modal
- **WHEN** a staff member clicks their profile area in the sidebar
- **THEN** a modal appears with fields for old password, new password, and confirm new password
