import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // We allow logging in via Employee ID (MaNV)
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const isMaNV = !isNaN(Number(username));
    
    const user = await prisma.nhanVien.findFirst({
      where: isMaNV ? { MaNV: Number(username) } : { HoTen: username },
      include: { GroupRole: { include: { Role_Permissions: { include: { Permission: true } } } } }
    });

    if (!user) return res.status(400).json({ error: 'User not found.' });

    const validPassword = await bcrypt.compare(password, user.MatKhau);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password.' });

    const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
    const normalizedRole = user.GroupRole?.TenRole || user.VaiTro?.toUpperCase() || '';
    const permissions = user.GroupRole?.Role_Permissions.map((rp: any) => rp.Permission.TenQuyen) || [];
    
    const token = jwt.sign({ id: user.MaNV, role: normalizedRole, permissions }, secret, { expiresIn: '1d' });

    res.json({ token, user: { id: user.MaNV, HoTen: user.HoTen, role: normalizedRole, permissions } });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === 'CUSTOMER') {
      const customer = await prisma.khachHang.findUnique({
        where: { MaKH: userId },
        select: { MaKH: true, HoTen: true, SDT: true, DiemTichLuy: true }
      });
      
      let tierInfo = { TenHang: 'MEMBER', PhanTramGiamGia: 0 };
      if (customer) {
        const tier = await prisma.hangThanhVien.findFirst({
          where: { MinDiem: { lte: customer.DiemTichLuy } },
          orderBy: { MinDiem: 'desc' }
        });
        if (tier) tierInfo = tier;
      }

      return res.json({ id: customer?.MaKH, HoTen: customer?.HoTen, role: 'CUSTOMER', ...customer, HangThanhVien: tierInfo });
    }

    const user = await prisma.nhanVien.findUnique({
      where: { MaNV: userId },
      select: { MaNV: true, HoTen: true, VaiTro: true, GroupRole: { include: { Role_Permissions: { include: { Permission: true } } } } }
    });
    const normalizedRole = user?.GroupRole?.TenRole || user?.VaiTro?.toUpperCase() || '';
    const permissions = user?.GroupRole?.Role_Permissions.map((rp: any) => rp.Permission.TenQuyen) || [];
    res.json({ id: user?.MaNV, HoTen: user?.HoTen, role: normalizedRole, permissions, ...user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;

    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Cần mật khẩu cũ và mới' });

    if (userRole === 'CUSTOMER') {
      const userObj = await prisma.khachHang.findUnique({ where: { MaKH: userId } });
      if (!userObj || !userObj.MatKhau) return res.status(400).json({ error: 'Không tìm thấy người dùng' });
      const isValid = await bcrypt.compare(oldPassword, userObj.MatKhau);
      if (!isValid) return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.khachHang.update({ where: { MaKH: userId }, data: { MatKhau: hashed } });
    } else {
      const userObj = await prisma.nhanVien.findUnique({ where: { MaNV: userId } });
      if (!userObj || !userObj.MatKhau) return res.status(400).json({ error: 'Không tìm thấy người dùng' });
      const isValid = await bcrypt.compare(oldPassword, userObj.MatKhau);
      if (!isValid) return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.nhanVien.update({ where: { MaNV: userId }, data: { MatKhau: hashed } });
    }

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { sdt, password } = req.body;
    
    if (!sdt || !password) {
      return res.status(400).json({ error: 'Require both phone and password.' });
    }

    const customer = await prisma.khachHang.findUnique({
      where: { SDT: sdt }
    });

    if (!customer || !customer.MatKhau) {
      return res.status(400).json({ error: 'Tài khoản không tồn tại hoặc chưa cài mật khẩu.' });
    }

    const validPassword = await bcrypt.compare(password, customer.MatKhau);
    if (!validPassword) return res.status(400).json({ error: 'Sai mật khẩu.' });

    const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
    const token = jwt.sign({ id: customer.MaKH, role: 'CUSTOMER' }, secret, { expiresIn: '7d' });

    res.json({ token, user: { id: customer.MaKH, HoTen: customer.HoTen, role: 'CUSTOMER' } });
  } catch (error) {
    console.error('Customer Login error', error);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
};
