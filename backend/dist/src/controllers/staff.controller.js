"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getAllStaff = void 0;
const index_1 = require("../index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getAllStaff = async (req, res) => {
    try {
        const staff = await index_1.prisma.nhanVien.findMany({
            select: { MaNV: true, HoTen: true, VaiTro: true, MaRole: true, GroupRole: true }
        });
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};
exports.getAllStaff = getAllStaff;
const createStaff = async (req, res) => {
    try {
        const { HoTen, VaiTro, MatKhau, MaRole } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(MatKhau, 10);
        const staff = await index_1.prisma.nhanVien.create({
            data: { HoTen, VaiTro, MaRole: MaRole ? Number(MaRole) : null, MatKhau: hashedPassword }
        });
        res.json({ success: true, MaNV: staff.MaNV });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create staff' });
    }
};
exports.createStaff = createStaff;
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { HoTen, VaiTro, MatKhau, MaRole } = req.body;
        let updateData = { HoTen, VaiTro, MaRole: MaRole ? Number(MaRole) : null };
        if (MatKhau) {
            updateData.MatKhau = await bcryptjs_1.default.hash(MatKhau, 10);
        }
        const staff = await index_1.prisma.nhanVien.update({
            where: { MaNV: Number(id) },
            data: updateData
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update staff' });
    }
};
exports.updateStaff = updateStaff;
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.nhanVien.delete({ where: { MaNV: Number(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete staff' });
    }
};
exports.deleteStaff = deleteStaff;
