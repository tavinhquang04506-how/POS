"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerLogin = exports.changePassword = exports.getMe = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // We allow logging in via Employee ID (MaNV)
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        const isMaNV = !isNaN(Number(username));
        const user = await index_1.prisma.nhanVien.findFirst({
            where: isMaNV ? { MaNV: Number(username) } : { HoTen: username },
            include: { GroupRole: { include: { Role_Permissions: { include: { Permission: true } } } } }
        });
        if (!user)
            return res.status(400).json({ error: 'User not found.' });
        const validPassword = await bcryptjs_1.default.compare(password, user.MatKhau);
        if (!validPassword)
            return res.status(400).json({ error: 'Invalid password.' });
        const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
        const normalizedRole = user.GroupRole?.TenRole || user.VaiTro?.toUpperCase() || '';
        const permissions = user.GroupRole?.Role_Permissions.map((rp) => rp.Permission.TenQuyen) || [];
        const token = jsonwebtoken_1.default.sign({ id: user.MaNV, role: normalizedRole, permissions }, secret, { expiresIn: '1d' });
        res.json({ token, user: { id: user.MaNV, HoTen: user.HoTen, role: normalizedRole, permissions } });
    }
    catch (error) {
        console.error('Login error', error);
        res.status(500).json({ error: 'Login failed due to a server error.' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;
        if (userRole === 'CUSTOMER') {
            const customer = await index_1.prisma.khachHang.findUnique({
                where: { MaKH: userId },
                select: { MaKH: true, HoTen: true, SDT: true, DiemTichLuy: true }
            });
            let tierInfo = { TenHang: 'MEMBER', PhanTramGiamGia: 0 };
            if (customer) {
                const tier = await index_1.prisma.hangThanhVien.findFirst({
                    where: { MinDiem: { lte: customer.DiemTichLuy } },
                    orderBy: { MinDiem: 'desc' }
                });
                if (tier)
                    tierInfo = tier;
            }
            return res.json({ id: customer?.MaKH, HoTen: customer?.HoTen, role: 'CUSTOMER', ...customer, HangThanhVien: tierInfo });
        }
        const user = await index_1.prisma.nhanVien.findUnique({
            where: { MaNV: userId },
            select: { MaNV: true, HoTen: true, VaiTro: true, GroupRole: { include: { Role_Permissions: { include: { Permission: true } } } } }
        });
        const normalizedRole = user?.GroupRole?.TenRole || user?.VaiTro?.toUpperCase() || '';
        const permissions = user?.GroupRole?.Role_Permissions.map((rp) => rp.Permission.TenQuyen) || [];
        res.json({ id: user?.MaNV, HoTen: user?.HoTen, role: normalizedRole, permissions, ...user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user context' });
    }
};
exports.getMe = getMe;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;
        if (!oldPassword || !newPassword)
            return res.status(400).json({ error: 'Cần mật khẩu cũ và mới' });
        if (userRole === 'CUSTOMER') {
            const userObj = await index_1.prisma.khachHang.findUnique({ where: { MaKH: userId } });
            if (!userObj || !userObj.MatKhau)
                return res.status(400).json({ error: 'Không tìm thấy người dùng' });
            const isValid = await bcryptjs_1.default.compare(oldPassword, userObj.MatKhau);
            if (!isValid)
                return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
            const hashed = await bcryptjs_1.default.hash(newPassword, 10);
            await index_1.prisma.khachHang.update({ where: { MaKH: userId }, data: { MatKhau: hashed } });
        }
        else {
            const userObj = await index_1.prisma.nhanVien.findUnique({ where: { MaNV: userId } });
            if (!userObj || !userObj.MatKhau)
                return res.status(400).json({ error: 'Không tìm thấy người dùng' });
            const isValid = await bcryptjs_1.default.compare(oldPassword, userObj.MatKhau);
            if (!isValid)
                return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
            const hashed = await bcryptjs_1.default.hash(newPassword, 10);
            await index_1.prisma.nhanVien.update({ where: { MaNV: userId }, data: { MatKhau: hashed } });
        }
        res.json({ message: 'Đổi mật khẩu thành công' });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};
exports.changePassword = changePassword;
const customerLogin = async (req, res) => {
    try {
        const { sdt, password } = req.body;
        if (!sdt || !password) {
            return res.status(400).json({ error: 'Require both phone and password.' });
        }
        const customer = await index_1.prisma.khachHang.findUnique({
            where: { SDT: sdt }
        });
        if (!customer || !customer.MatKhau) {
            return res.status(400).json({ error: 'Tài khoản không tồn tại hoặc chưa cài mật khẩu.' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, customer.MatKhau);
        if (!validPassword)
            return res.status(400).json({ error: 'Sai mật khẩu.' });
        const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
        const token = jsonwebtoken_1.default.sign({ id: customer.MaKH, role: 'CUSTOMER' }, secret, { expiresIn: '7d' });
        res.json({ token, user: { id: customer.MaKH, HoTen: customer.HoTen, role: 'CUSTOMER' } });
    }
    catch (error) {
        console.error('Customer Login error', error);
        res.status(500).json({ error: 'Login failed due to a server error.' });
    }
};
exports.customerLogin = customerLogin;
