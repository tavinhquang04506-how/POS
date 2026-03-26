## 1. Môi trường & Backend (API)
- [x] 1.1 Cài đặt hoặc verify thư viện xử lý Excel `xlsx` (SheetJS) ở phía Frontend Client.
- [x] 1.2 Viết logic `POST /api/inventory/import-excel` trong `inventory.controller.ts` để nhận Array JSON từ Frontend.
- [x] 1.3 Cấu hình Prisma `$transaction` trong hàm import để Validate danh sách Barcodes, tạo `PhieuNhap`, insert `ChiTietPhieuNhap` và Update `SoLuongTon`.
- [x] 1.4 Khai báo route `/api/inventory/import-excel` vào `index.ts`.

## 2. Giao diện (Frontend) 
- [x] 2.1 Cập nhật thiết kế `ReceiveTab.tsx` thêm khu vực/nút "Upload Excel" bên cạnh form truyền thống.
- [x] 2.2 Viết logic hàm `onFileUpload` đọc file `.xlsx` trực tiếp trên trình duyệt bằng thư viện `xlsx` và map ra Array Object.
- [x] 2.3 Hiển thị Table Preview danh sách hàng hoá sau khi parse file thành công để nhân viên kiểm tra dòng/lỗi.
- [x] 2.4 Gọi API Axios truyền tải Data xuống `/api/inventory/import-excel` sau khi người dùng bấm "Xác Nhận Import Kho".

## 3. QA & Kiểm Thử
- [x] 3.1 Nhập thử file hợp lệ với 3-5 mặt hàng và kiểm tra Database xem Số lượng tồn có nhảy đúng.
- [x] 3.2 Nhập thử file rác (chứa 1 Barcode sai) để đảm bảo Transaction kích hoạt Rollback an toàn (không bị sinh rác PhieuNhap).
