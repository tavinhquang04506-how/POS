# pagination Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
### Requirement: API pagination support
The system SHALL support `?page=N&limit=M` query parameters on all list endpoints, returning paginated results with metadata.

#### Scenario: Paginated invoice list
- **WHEN** a user calls `GET /api/reports/revenue?page=2&limit=20`
- **THEN** the system returns records 21-40 along with `{ data: [...], total, page: 2, totalPages }`

### Requirement: Frontend pagination controls
The system SHALL display pagination controls (Previous/Next/Page numbers) below data tables when total records exceed the page limit.

#### Scenario: Navigate between pages
- **WHEN** there are 50 invoices and the user is on page 1 (limit 20)
- **THEN** the system shows "Page 1 of 3" with a Next button to go to page 2

