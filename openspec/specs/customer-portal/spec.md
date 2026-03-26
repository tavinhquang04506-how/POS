# customer-portal Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
### Requirement: Customer dashboard page
The system SHALL provide a `/customer` route where authenticated customers can view their loyalty points and purchase history.

#### Scenario: Customer views their profile
- **WHEN** a customer logs in and navigates to `/customer`
- **THEN** the system displays their name, phone, loyalty points, tier level, and a list of past invoices

### Requirement: Customer route protection
The system SHALL restrict the `/customer` route to users with the CUSTOMER role only.

#### Scenario: Non-customer access denied
- **WHEN** a CASHIER tries to access `/customer`
- **THEN** the system redirects them to `/pos`

