# refund-receipt Specification

## Purpose
TBD - created by archiving change rbac-and-returns. Update Purpose after archive.
## Requirements
### Requirement: Print Refund Receipt
The system SHALL automatically trigger the printing of a refund receipt (K80 thermal) upon successful return.

#### Scenario: Successful return completion
- **WHEN** a return transaction is successfully processed
- **THEN** system opens the browser print dialogue with a formatted K80 refund receipt

