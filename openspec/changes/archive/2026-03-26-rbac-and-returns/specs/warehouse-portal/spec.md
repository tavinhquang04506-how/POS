## ADDED Requirements

### Requirement: Warehouse Dashboard Layout
The frontend Manager Dashboard SHALL restrict warehouse staff to only view the 'Inventory & FEFO' and 'PO Receive' tabs.

#### Scenario: Warehouse staff login
- **WHEN** user logs in with the WAREHOUSE role
- **THEN** the sidebar only displays links to inventory management and receiving, hiding all revenue, staff, and customer modules
