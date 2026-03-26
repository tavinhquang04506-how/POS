# dashboard-overview Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
### Requirement: Dashboard overview page
The system SHALL display a KPI overview tab as the default landing page when a MANAGER logs into the dashboard.

#### Scenario: Manager sees KPI summary on login
- **WHEN** a MANAGER navigates to `/dashboard`
- **THEN** the system displays cards showing: today's net revenue, today's invoice count, total returns amount, and top 5 best-selling products

### Requirement: Low stock warnings on dashboard
The system SHALL display a warning section on the overview listing products with `SoLuongTon < 10`.

#### Scenario: Products below threshold shown
- **WHEN** there are products with stock less than 10
- **THEN** the dashboard overview displays an alert card listing those products with their current stock levels

### Requirement: Expiry warnings on dashboard
The system SHALL display a warning section for batches expiring within 7 days.

#### Scenario: Expiring batches shown
- **WHEN** there are batches with `HanSuDung` within 7 days
- **THEN** the dashboard overview displays an alert card listing those batches with product name and expiry date

