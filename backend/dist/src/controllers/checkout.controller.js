"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const index_1 = require("../index");
const checkout = async (req, res) => {
    const { MaKH, items, phuongThucThanhToan } = req.body;
    const MaNV = req.user?.id;
    if (!MaNV)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!items || items.length === 0)
        return res.status(400).json({ error: 'Cart is empty' });
    try {
        const activeShift = await index_1.prisma.caLamViec.findFirst({
            where: { MaNV, TrangThai: 'Đang mở' }
        });
        if (!activeShift) {
            return res.status(400).json({ error: 'No active shift found. Cashier must Open Shift first.' });
        }
        const invoice = await index_1.prisma.$transaction(async (tx) => {
            let tongTienHang = 0;
            let tongThueGTGT = 0;
            for (const item of items) {
                if (!item.MaSP)
                    throw new Error('Dữ liệu giỏ hàng bị hỏng (Thiếu mã sản phẩm). Vui lòng làm trống giỏ hàng.');
                const product = await tx.sanPham.findUnique({
                    where: { MaSP: item.MaSP },
                    include: { LoHangs: { where: { SoLuongTon: { gt: 0 } }, orderBy: { HanSuDung: 'asc' } } }
                });
                if (!product)
                    throw new Error(`Product ${item.MaSP} not found`);
                const thanhTien = product.DonGiaBan * item.SoLuong;
                tongTienHang += thanhTien;
                tongThueGTGT += (thanhTien * product.ThueVAT) / 100;
                let remainingToDeduct = item.SoLuong;
                for (const batch of product.LoHangs) {
                    if (remainingToDeduct <= 0)
                        break;
                    const deducted = Math.min(batch.SoLuongTon, remainingToDeduct);
                    await tx.loHang.update({
                        where: { MaLo: batch.MaLo },
                        data: { SoLuongTon: batch.SoLuongTon - deducted }
                    });
                    remainingToDeduct -= deducted;
                }
                if (remainingToDeduct > 0)
                    throw new Error(`Not enough stock for ${product.TenSP}`);
                await tx.sanPham.update({
                    where: { MaSP: product.MaSP },
                    data: { SoLuongTon: product.SoLuongTon - item.SoLuong }
                });
            }
            // Tier Calculation & Accumulation
            let giamGia = 0;
            if (MaKH) {
                const kh = await tx.khachHang.findUnique({ where: { MaKH } });
                if (kh) {
                    // Identify percentage
                    const tier = await tx.hangThanhVien.findFirst({
                        where: { MinDiem: { lte: kh.DiemTichLuy } },
                        orderBy: { MinDiem: 'desc' }
                    });
                    if (tier && tier.PhanTramGiamGia > 0) {
                        giamGia = (tongTienHang * tier.PhanTramGiamGia) / 100;
                    }
                    // Earn points (XP base): 1 point per 10000 VND
                    const earnedPoints = Math.floor((tongTienHang - giamGia) / 10000);
                    await tx.khachHang.update({
                        where: { MaKH },
                        data: { DiemTichLuy: { increment: earnedPoints } }
                    });
                }
            }
            const hoaDon = await tx.hoaDon.create({
                data: {
                    TongTienHang: tongTienHang,
                    TongThueGTGT: tongThueGTGT,
                    PhuongThucThanhToan: phuongThucThanhToan,
                    GiamGia: giamGia,
                    MaNV,
                    MaKH,
                    MaCa: activeShift.MaCa, // LINK INVOICE TO CURRENT SHIFT
                    ChiTietHoaDons: {
                        create: items.map((i) => ({
                            MaSP: i.MaSP,
                            SoLuong: i.SoLuong,
                            DonGia: i.DonGia,
                            ThanhTien: i.SoLuong * i.DonGia
                        }))
                    }
                }
            });
            return hoaDon;
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Checkout failed', error);
        res.status(400).json({ error: error.message || 'Checkout failed' });
    }
};
exports.checkout = checkout;
