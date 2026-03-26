"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllShifts = exports.closeShift = exports.openShift = exports.getCurrentShift = void 0;
const index_1 = require("../index");
const getCurrentShift = async (req, res) => {
    const MaNV = req.user?.id;
    if (!MaNV)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const activeShift = await index_1.prisma.caLamViec.findFirst({
            where: { MaNV, TrangThai: 'Đang mở' }
        });
        res.json({ shift: activeShift });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch shift' });
    }
};
exports.getCurrentShift = getCurrentShift;
const openShift = async (req, res) => {
    const MaNV = req.user?.id;
    const { TienDauCa } = req.body;
    if (!MaNV)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const activeShift = await index_1.prisma.caLamViec.findFirst({
            where: { MaNV, TrangThai: 'Đang mở' }
        });
        if (activeShift)
            return res.status(400).json({ error: 'Shift already open', shift: activeShift });
        const newShift = await index_1.prisma.caLamViec.create({
            data: {
                MaNV,
                TienDauCa: Number(TienDauCa) || 0,
                TrangThai: 'Đang mở'
            }
        });
        res.json(newShift);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to open shift' });
    }
};
exports.openShift = openShift;
const closeShift = async (req, res) => {
    const MaNV = req.user?.id;
    if (!MaNV)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const activeShift = await index_1.prisma.caLamViec.findFirst({
            where: { MaNV, TrangThai: 'Đang mở' }
        });
        if (!activeShift)
            return res.status(400).json({ error: 'No active shift found' });
        // Calculate TienCuoiCa based on all cash invoices done during this exact shift
        const invoices = await index_1.prisma.hoaDon.findMany({
            where: { MaCa: activeShift.MaCa, PhuongThucThanhToan: 'Tiền mặt' }
        });
        const cashEarned = invoices.reduce((acc, inv) => acc + (inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia), 0);
        // Calculate money refunded during this shift
        const refunds = await index_1.prisma.phieuTraHang.findMany({
            where: { MaCa: activeShift.MaCa }
        });
        const cashRefunded = refunds.reduce((acc, rtn) => acc + rtn.TongTienHoan, 0);
        const expectedCash = activeShift.TienDauCa + cashEarned - cashRefunded;
        const closedShift = await index_1.prisma.caLamViec.update({
            where: { MaCa: activeShift.MaCa },
            data: {
                ThoiGianKetThuc: new Date(),
                TienCuoiCa: expectedCash,
                TrangThai: 'Đã chốt'
            }
        });
        res.json(closedShift);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to close shift' });
    }
};
exports.closeShift = closeShift;
const getAllShifts = async (req, res) => {
    try {
        const shifts = await index_1.prisma.caLamViec.findMany({
            include: {
                NhanVien: {
                    select: { HoTen: true }
                }
            },
            orderBy: { ThoiGianBatDau: 'desc' }
        });
        res.json(shifts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch all shifts for history report' });
    }
};
exports.getAllShifts = getAllShifts;
