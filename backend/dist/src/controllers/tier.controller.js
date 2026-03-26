"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTier = exports.updateTier = exports.createTier = exports.getTiers = void 0;
const index_1 = require("../index");
const getTiers = async (req, res) => {
    try {
        const tiers = await index_1.prisma.hangThanhVien.findMany({
            orderBy: { MinDiem: 'asc' }
        });
        res.json(tiers);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi tải danh sách hạng' });
    }
};
exports.getTiers = getTiers;
const createTier = async (req, res) => {
    try {
        const { TenHang, MinDiem, PhanTramGiamGia } = req.body;
        const newTier = await index_1.prisma.hangThanhVien.create({
            data: { TenHang, MinDiem: Number(MinDiem), PhanTramGiamGia: Number(PhanTramGiamGia) }
        });
        res.json(newTier);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi tạo hạng' });
    }
};
exports.createTier = createTier;
const updateTier = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenHang, MinDiem, PhanTramGiamGia } = req.body;
        const updated = await index_1.prisma.hangThanhVien.update({
            where: { MaHang: Number(id) },
            data: { TenHang, MinDiem: Number(MinDiem), PhanTramGiamGia: Number(PhanTramGiamGia) }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi sửa hạng' });
    }
};
exports.updateTier = updateTier;
const deleteTier = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.hangThanhVien.delete({
            where: { MaHang: Number(id) }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi xóa hạng' });
    }
};
exports.deleteTier = deleteTier;
