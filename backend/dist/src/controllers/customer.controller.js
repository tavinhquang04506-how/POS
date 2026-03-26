"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getAllCustomers = exports.createCustomer = exports.getMyHistory = exports.getCustomerByPhone = void 0;
const index_1 = require("../index");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getCustomerByPhone = async (req, res) => {
    try {
        const phone = req.params.phone;
        const customer = await index_1.prisma.khachHang.findUnique({ where: { SDT: phone } });
        if (!customer)
            return res.status(404).json({ error: 'Customer not found' });
        // Evaluate Tier dynamically
        const tier = await index_1.prisma.hangThanhVien.findFirst({
            where: { MinDiem: { lte: customer.DiemTichLuy } },
            orderBy: { MinDiem: 'desc' }
        });
        res.json({
            ...customer,
            HangThanhVien: tier || null
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};
exports.getCustomerByPhone = getCustomerByPhone;
const getMyHistory = async (req, res) => {
    try {
        const customerId = req.user.id;
        const history = await index_1.prisma.hoaDon.findMany({
            where: { MaKH: customerId },
            include: {
                ChiTietHoaDons: {
                    include: { SanPham: true }
                }
            },
            orderBy: { NgayLap: 'desc' },
            take: 20
        });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
exports.getMyHistory = getMyHistory;
const createCustomer = async (req, res) => {
    try {
        const { HoTen, SDT } = req.body;
        if (!HoTen || !SDT)
            return res.status(400).json({ error: 'Thiếu thông tin HoTen hoặc SDT' });
        const existing = await index_1.prisma.khachHang.findUnique({ where: { SDT } });
        if (existing)
            return res.status(400).json({ error: 'Số điện thoại này đã được đăng ký' });
        const MatKhau = await bcryptjs_1.default.hash(SDT, 10);
        const newKhachHang = await index_1.prisma.khachHang.create({
            data: { HoTen, SDT, MatKhau, DiemTichLuy: 0 }
        });
        // Evaluate base tier
        const baseTier = await index_1.prisma.hangThanhVien.findFirst({
            where: { MinDiem: { lte: 0 } },
            orderBy: { MinDiem: 'desc' }
        });
        res.json({
            ...newKhachHang,
            HangThanhVien: baseTier || null
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi máy chủ khi tạo khách hàng mới' });
    }
};
exports.createCustomer = createCustomer;
const getAllCustomers = async (req, res) => {
    try {
        const customers = await index_1.prisma.khachHang.findMany({
            orderBy: { DiemTichLuy: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Fetching customers failed' });
    }
};
exports.getAllCustomers = getAllCustomers;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { HoTen, DiemTichLuy } = req.body;
        const customer = await index_1.prisma.khachHang.update({
            where: { MaKH: Number(id) },
            data: { HoTen, DiemTichLuy: Number(DiemTichLuy) }
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Khong the cap nhat khach hang' });
    }
};
exports.updateCustomer = updateCustomer;
