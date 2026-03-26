# return-history Specification

## Purpose
TBD - created by archiving change pos-system-hardening. Update Purpose after archive.
## Requirements
### Requirement: Return history listing
The system SHALL provide a `GET /api/returns` endpoint that returns all `PhieuTraHang` records with associated `NhanVien`, `HoaDon`, and `ChiTietPhieuTra` details.

#### Scenario: Manager views return history
- **WHEN** a MANAGER calls `GET /api/returns`
- **THEN** the system returns a list of all return slips ordered by date descending

### Requirement: Return history tab in dashboard
The system SHALL display a "Lịch Sử Đổi Trả" tab in the Manager Dashboard sidebar showing all return records.

#### Scenario: Manager navigates to return history
- **WHEN** a MANAGER clicks on the "Lịch Sử Đổi Trả" tab
- **THEN** the system displays a table with columns: Mã Phiếu, Mã HĐ gốc, Nhân viên xử lý, Ngày trả, Tổng tiền hoàn, Lý do

