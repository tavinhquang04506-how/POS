## ADDED Requirements

### Requirement: Table search functionality
The system SHALL provide a search input on each data table that filters visible rows by matching the search term against relevant text columns.

#### Scenario: Search products by name
- **WHEN** a user types "Coca" into the search box on ProductsTab
- **THEN** only products containing "Coca" in their name are displayed

### Requirement: Search across multiple tabs
The system SHALL implement search on: ProductsTab, CustomersTab, RevenueTab (invoices), InventoryTab, ShiftsTab, and StaffTab.

#### Scenario: Search customers by phone
- **WHEN** a user types "0901" into the search box on CustomersTab
- **THEN** only customers with phone numbers containing "0901" are displayed
