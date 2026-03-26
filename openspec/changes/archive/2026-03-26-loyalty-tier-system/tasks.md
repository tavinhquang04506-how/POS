## 1. Database & Seeding

- [ ] 1.1 Add `HangThanhVien` model (MaHang, TenHang, MinDiem, PhanTramGiamGia) in `schema.prisma`.
- [ ] 1.2 Run Prisma migrate and add a seeder for 3 default tiers (Thành Viên, Bạc 2%, Vàng 5%).

## 2. API Backend

- [ ] 2.1 Build Tier Management CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE` `/api/tiers`).
- [ ] 2.2 Update Customer Lookup API to dynamically calculate and attach the `HangThanhVien` object based on `DiemTichLuy`.
- [ ] 2.3 Build Fast-Registration API (`POST /api/customers`) accepting HoTen and SDT.
- [ ] 2.4 Rewrite Checkout API to calculate Invoice discounts based on the Tier's `PhanTramGiamGia`.

## 3. Manager UI

- [ ] 3.1 Create a new tab/table in `ManagerDashboard.tsx` to display and configure `HangThanhVien`.

## 4. Giao diện Thu ngân (Quy trình hỏi SĐT Khách)

- [ ] 4.1 Nâng cấp ô Nhập SĐT hiện tại: Khi tìm thấy khách (Trường hợp 1) -> Tự động load Huy hiệu Hạng Thẻ (Bạc/Vàng) và áp dụng trừ % giảm giá thẳng vào hóa đơn.
- [ ] 4.2 Luồng Đăng ký thẻ (Trường hợp 2): Khi không tìm thấy SĐT -> Hiện nút "[+] Khách Mới". Bấm vào hiện Modal chỉ nhập Tên, lưu xong tự gán khách hàng này vào đơn hàng đang bán.
- [ ] 4.3 Luồng Khách Vãng Lai (Trường hợp 3): Không nhập SĐT, bỏ qua và thanh toán giữ nguyên giá gốc.
- [ ] 4.4 Nâng cấp giao diện mẫu In Biên Lai (K80) hiển thị mức % giảm giá và điểm dư để in đưa cho khách.
