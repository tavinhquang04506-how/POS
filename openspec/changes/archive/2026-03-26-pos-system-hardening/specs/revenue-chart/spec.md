## ADDED Requirements

### Requirement: Revenue bar chart
The system SHALL display a bar chart showing daily net revenue for the last 7 days on RevenueTab.

#### Scenario: Chart renders with 7-day data
- **WHEN** a MANAGER opens the RevenueTab
- **THEN** a bar chart is displayed showing revenue per day for the past 7 days with date labels on X-axis and VND amounts on Y-axis

### Requirement: Revenue chart API
The system SHALL provide `GET /api/reports/revenue-daily?days=7` returning daily revenue aggregation.

#### Scenario: Fetch daily revenue data
- **WHEN** an authenticated MANAGER calls `GET /api/reports/revenue-daily?days=7`
- **THEN** the system returns an array of `{ date, revenue, returns }` objects for each of the last 7 days
