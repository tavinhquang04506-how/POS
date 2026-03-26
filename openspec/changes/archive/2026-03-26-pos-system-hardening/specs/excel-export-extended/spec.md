## ADDED Requirements

### Requirement: Excel export on all management tabs
The system SHALL provide an "Xuất Excel" button on InventoryTab, CustomersTab, ShiftsTab, and ReturnHistoryTab.

#### Scenario: Export inventory to Excel
- **WHEN** a MANAGER clicks "Xuất Excel" on InventoryTab
- **THEN** the system downloads an `.xlsx` file containing all inventory batch data with columns: Mã lô, Tên SP, Số lượng tồn, Giá nhập, Hạn sử dụng
