import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============ PRISMA CLIENT ============
const prisma = new PrismaClient();

// ============ AUTH MIDDLEWARE ============
interface AuthRequest extends express.Request {
  user?: { id: number; role: string; permissions?: string[] };
}

const authenticate = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const secret = process.env.JWT_SECRET || 'pos_super_secret_key_2024';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
};

const authorizePermissions = (perms: string[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) return res.status(403).json({ error: 'Access denied.' });
    if (req.user.role === 'CUSTOMER') return authorizeRoles(['CUSTOMER'])(req, res, next);
    const userPerms = req.user.permissions || [];
    const hasPermission = perms.some(p => userPerms.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ error: 'Missing required permission.' });
    }
    next();
  };
};

// ============ EXPRESS APP ============
const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// --------- AUTH ROUTES ---------
app.post('/api/auth/login', async (req: AuthRequest, res: express.Response) => {
  try {
    const { username, password } = req.body;
    const staff = await prisma.nhanVien.findUnique({
      where: { MaNV: parseInt(username) },
      include: { Role: { include: { RolePermissions: { include: { Permission: true } } } } }
    });
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, staff.MatKhau);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const permissions = staff.Role?.RolePermissions.map((rp: any) => rp.Permission.TenQuyen) || [];
    const token = jwt.sign(
      { id: staff.MaNV, role: staff.Role?.TenRole || 'STAFF', permissions },
      process.env.JWT_SECRET || 'pos_super_secret_key_2024',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: staff.MaNV, name: staff.HoTen, role: staff.Role?.TenRole || 'STAFF', permissions } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/customer-login', async (req: AuthRequest, res: express.Response) => {
  try {
    const { phone, password } = req.body;
    const customer = await prisma.khachHang.findFirst({ where: { SDT: phone } });
    if (!customer) return res.status(401).json({ error: 'Invalid credentials' });
    const defaultPass = await bcrypt.hash('123456', 10);
    const storedPass = (customer as any).MatKhau || defaultPass;
    const isMatch = await bcrypt.compare(password, storedPass);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: customer.MaKH, role: 'CUSTOMER', customerId: customer.MaKH },
      process.env.JWT_SECRET || 'pos_super_secret_key_2024',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: customer.MaKH, name: customer.HoTen, role: 'CUSTOMER', phone: customer.SDT } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/change-password', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staff = await prisma.nhanVien.findUnique({ where: { MaNV: req.user!.id } });
    if (!staff) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, staff.MatKhau);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.nhanVien.update({ where: { MaNV: req.user!.id }, data: { MatKhau: hashed } });
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const staff = await prisma.nhanVien.findUnique({
      where: { MaNV: req.user!.id },
      include: { Role: { include: { RolePermissions: { include: { Permission: true } } } } }
    });
    if (!staff) return res.status(404).json({ error: 'User not found' });
    const permissions = staff.Role?.RolePermissions.map((rp: any) => rp.Permission.TenQuyen) || [];
    res.json({ id: staff.MaNV, name: staff.HoTen, role: staff.Role?.TenRole || 'STAFF', permissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --------- PRODUCTS ---------
app.get('/api/products', authenticate, authorizePermissions(['VIEW_PRODUCTS']), async (_req, res) => {
  const products = await prisma.sanPham.findMany({ include: { DanhMuc: true } });
  res.json(products);
});
app.get('/api/products/:id', authenticate, authorizePermissions(['VIEW_PRODUCTS']), async (req, res) => {
  const p = await prisma.sanPham.findFirst({ where: { OR: [{ MaSP: parseInt(req.params.id) || 0 }, { Barcode: req.params.id }] }, include: { DanhMuc: true } });
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/products', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  const p = await prisma.sanPham.create({ data: req.body });
  res.json(p);
});
app.put('/api/products/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  const p = await prisma.sanPham.update({ where: { MaSP: parseInt(req.params.id) }, data: req.body });
  res.json(p);
});
app.delete('/api/products/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  await prisma.sanPham.delete({ where: { MaSP: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --------- CATEGORIES ---------
app.get('/api/categories', authenticate, authorizePermissions(['VIEW_PRODUCTS']), async (_req, res) => {
  res.json(await prisma.danhMuc.findMany());
});
app.post('/api/categories', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  res.json(await prisma.danhMuc.create({ data: req.body }));
});
app.put('/api/categories/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  res.json(await prisma.danhMuc.update({ where: { MaDM: parseInt(req.params.id) }, data: req.body }));
});
app.delete('/api/categories/:id', authenticate, authorizePermissions(['EDIT_PRODUCTS']), async (req, res) => {
  await prisma.danhMuc.delete({ where: { MaDM: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --------- CUSTOMERS ---------
app.get('/api/customers/me/history', authenticate, authorizeRoles(['CUSTOMER']), async (req: AuthRequest, res) => {
  const invoices = await prisma.hoaDon.findMany({
    where: { MaKH: req.user!.id },
    include: { ChiTietHoaDons: { include: { SanPham: true } }, NhanVien: true },
    orderBy: { NgayLap: 'desc' }
  });
  res.json(invoices);
});
app.get('/api/customers/:phone', authenticate, authorizePermissions(['VIEW_CUSTOMERS']), async (req, res) => {
  const c = await prisma.khachHang.findFirst({ where: { SDT: req.params.phone }, include: { HangThanhVien: true } });
  c ? res.json(c) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/customers', authenticate, authorizePermissions(['VIEW_CUSTOMERS']), async (_req, res) => {
  res.json(await prisma.khachHang.findMany({ include: { HangThanhVien: true } }));
});
app.post('/api/customers', authenticate, authorizePermissions(['EDIT_CUSTOMERS']), async (req, res) => {
  res.json(await prisma.khachHang.create({ data: req.body }));
});
app.put('/api/customers/:id', authenticate, authorizePermissions(['EDIT_CUSTOMERS']), async (req, res) => {
  res.json(await prisma.khachHang.update({ where: { MaKH: parseInt(req.params.id) }, data: req.body }));
});

// --------- TIERS ---------
app.get('/api/tiers', authenticate, authorizePermissions(['VIEW_TIERS']), async (_req, res) => {
  res.json(await prisma.hangThanhVien.findMany({ orderBy: { DiemToiThieu: 'asc' } }));
});
app.post('/api/tiers', authenticate, authorizePermissions(['EDIT_TIERS']), async (req, res) => {
  res.json(await prisma.hangThanhVien.create({ data: req.body }));
});
app.put('/api/tiers/:id', authenticate, authorizePermissions(['EDIT_TIERS']), async (req, res) => {
  res.json(await prisma.hangThanhVien.update({ where: { MaHang: parseInt(req.params.id) }, data: req.body }));
});
app.delete('/api/tiers/:id', authenticate, authorizePermissions(['EDIT_TIERS']), async (req, res) => {
  await prisma.hangThanhVien.delete({ where: { MaHang: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --------- SHIFTS ---------
app.get('/api/shifts/current', authenticate, authorizePermissions(['VIEW_SHIFTS']), async (_req, res) => {
  const shift = await prisma.caLamViec.findFirst({ where: { TrangThai: 'OPEN' }, include: { NhanVien: true } });
  res.json(shift);
});
app.get('/api/shifts', authenticate, authorizePermissions(['VIEW_SHIFTS']), async (_req, res) => {
  res.json(await prisma.caLamViec.findMany({ include: { NhanVien: true }, orderBy: { GioBatDau: 'desc' } }));
});
app.post('/api/shifts/open', authenticate, authorizePermissions(['EDIT_SHIFTS']), async (req: AuthRequest, res) => {
  const existing = await prisma.caLamViec.findFirst({ where: { TrangThai: 'OPEN' } });
  if (existing) return res.status(400).json({ error: 'A shift is already open' });
  const shift = await prisma.caLamViec.create({
    data: { MaNV: req.user!.id, GioBatDau: new Date(), TrangThai: 'OPEN', TienDauCa: parseFloat(req.body.TienDauCa) || 0, GhiChu: req.body.GhiChu || '' }
  });
  res.json(shift);
});
app.post('/api/shifts/close', authenticate, authorizePermissions(['EDIT_SHIFTS']), async (req, res) => {
  const shift = await prisma.caLamViec.findFirst({ where: { TrangThai: 'OPEN' } });
  if (!shift) return res.status(400).json({ error: 'No open shift' });
  const updated = await prisma.caLamViec.update({
    where: { MaCa: shift.MaCa },
    data: { TrangThai: 'CLOSED', GioKetThuc: new Date(), TienCuoiCa: parseFloat(req.body.TienCuoiCa) || 0, GhiChu: req.body.GhiChu || shift.GhiChu }
  });
  res.json(updated);
});

// --------- REPORTS ---------
app.get('/api/reports/revenue-daily', authenticate, authorizePermissions(['VIEW_REVENUE']), async (_req, res) => {
  const invoices = await prisma.hoaDon.findMany({ orderBy: { NgayLap: 'desc' } });
  const dailyMap: Record<string, number> = {};
  invoices.forEach(inv => {
    const day = inv.NgayLap.toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + (inv.TongTienHang - inv.GiamGia);
  });
  res.json(Object.entries(dailyMap).map(([date, total]) => ({ date, total })));
});
app.get('/api/reports/revenue', authenticate, authorizePermissions(['VIEW_REVENUE']), async (_req, res) => {
  const invoices = await prisma.hoaDon.findMany({ include: { KhachHang: true, NhanVien: true, ChiTietHoaDons: { include: { SanPham: true } } }, orderBy: { NgayLap: 'desc' } });
  const returns = await prisma.phieuTraHang.findMany({ include: { HoaDon: true, ChiTietTraHangs: { include: { SanPham: true } } }, orderBy: { NgayTra: 'desc' } });
  res.json({ invoices, returns });
});
app.get('/api/invoices', authenticate, authorizePermissions(['VIEW_RETURNS', 'CHECKOUT']), async (_req, res) => {
  const invoices = await prisma.hoaDon.findMany({ include: { KhachHang: true, NhanVien: true, ChiTietHoaDons: { include: { SanPham: true } } }, orderBy: { NgayLap: 'desc' } });
  const returns = await prisma.phieuTraHang.findMany({ include: { HoaDon: true, ChiTietTraHangs: { include: { SanPham: true } } }, orderBy: { NgayTra: 'desc' } });
  res.json({ invoices, returns });
});

// --------- RETURNS ---------
app.get('/api/returns', authenticate, authorizePermissions(['VIEW_RETURNS']), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const [data, total] = await Promise.all([
    prisma.phieuTraHang.findMany({ skip: (page - 1) * limit, take: limit, include: { HoaDon: true, ChiTietTraHangs: { include: { SanPham: true } } }, orderBy: { NgayTra: 'desc' } }),
    prisma.phieuTraHang.count()
  ]);
  res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});
app.get('/api/returns/invoice/:id', authenticate, authorizePermissions(['VIEW_RETURNS', 'EDIT_RETURNS']), async (req, res) => {
  const inv = await prisma.hoaDon.findUnique({ where: { MaHD: parseInt(req.params.id) }, include: { ChiTietHoaDons: { include: { SanPham: true } }, KhachHang: true, NhanVien: true, PhieuTraHangs: { include: { ChiTietTraHangs: true } } } });
  inv ? res.json(inv) : res.status(404).json({ error: 'Invoice not found' });
});
app.post('/api/returns', authenticate, authorizePermissions(['EDIT_RETURNS']), async (req: AuthRequest, res) => {
  try {
    const { MaHD, LyDo, items } = req.body;
    const invoice = await prisma.hoaDon.findUnique({ where: { MaHD }, include: { ChiTietHoaDons: true, PhieuTraHangs: { include: { ChiTietTraHangs: true } } } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    let tongTienHoan = 0;
    const details: any[] = [];
    for (const item of items) {
      const invoiceDetail = invoice.ChiTietHoaDons.find((d: any) => d.MaSP === item.MaSP);
      if (!invoiceDetail) continue;
      const alreadyReturned = invoice.PhieuTraHangs.reduce((sum: number, r: any) => sum + r.ChiTietTraHangs.filter((d: any) => d.MaSP === item.MaSP).reduce((s: number, d: any) => s + d.SoLuongTra, 0), 0);
      const maxReturn = invoiceDetail.SoLuong - alreadyReturned;
      const qty = Math.min(item.SoLuongTra, maxReturn);
      if (qty <= 0) continue;
      const refund = qty * invoiceDetail.DonGia;
      tongTienHoan += refund;
      details.push({ MaSP: item.MaSP, SoLuongTra: qty, DonGiaHoan: invoiceDetail.DonGia, ThanhTienHoan: refund });
    }
    if (details.length === 0) return res.status(400).json({ error: 'No valid items to return' });
    const result = await prisma.$transaction(async (tx: any) => {
      const returnOrder = await tx.phieuTraHang.create({ data: { MaHD, MaNV: req.user!.id, LyDo: LyDo || '', TongTienHoan: tongTienHoan, ChiTietTraHangs: { create: details } }, include: { ChiTietTraHangs: true } });
      for (const d of details) {
        await tx.sanPham.update({ where: { MaSP: d.MaSP }, data: { SoLuongTon: { increment: d.SoLuongTra } } });
      }
      return returnOrder;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --------- INVENTORY ---------
app.get('/api/inventory/alerts', authenticate, authorizePermissions(['VIEW_INVENTORY']), async (_req, res) => {
  const [lowStock, expiringSoon] = await Promise.all([
    prisma.loHang.findMany({ where: { SoLuongTon: { lt: 10 } }, include: { SanPham: true } }),
    prisma.loHang.findMany({ where: { HanSuDung: { lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }, include: { SanPham: true } })
  ]);
  res.json({ lowStock, expiringSoon });
});
app.get('/api/inventory', authenticate, authorizePermissions(['VIEW_INVENTORY']), async (req, res) => {
  const where: any = {};
  if (req.query.lowstock) where.SoLuongTon = { lt: parseInt(req.query.lowstock as string) };
  if (req.query.expiring) where.HanSuDung = { lt: new Date(Date.now() + parseInt(req.query.expiring as string) * 24 * 60 * 60 * 1000) };
  res.json(await prisma.loHang.findMany({ where, include: { SanPham: true }, orderBy: { HanSuDung: 'asc' } }));
});
app.post('/api/inventory/receive', authenticate, authorizePermissions(['EDIT_INVENTORY']), async (req, res) => {
  try {
    const { MaSP, SoLuongNhap, GiaNhap, HanSuDung } = req.body;
    const result = await prisma.$transaction(async (tx: any) => {
      const lot = await tx.loHang.create({ data: { MaSP: parseInt(MaSP), SoLuongTon: parseInt(SoLuongNhap), GiaNhap: parseFloat(GiaNhap), HanSuDung: new Date(HanSuDung) } });
      await tx.sanPham.update({ where: { MaSP: parseInt(MaSP) }, data: { SoLuongTon: { increment: parseInt(SoLuongNhap) } } });
      return lot;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/inventory/import-excel', authenticate, authorizePermissions(['EDIT_INVENTORY']), async (req, res) => {
  try {
    const { items } = req.body;
    const invalidBarcodes: string[] = [];
    const validItems: any[] = [];
    for (const item of items) {
      const product = await prisma.sanPham.findFirst({ where: { OR: [{ Barcode: String(item.Barcode) }, { MaSP: parseInt(item.Barcode) || 0 }] } });
      if (!product) { invalidBarcodes.push(item.Barcode); continue; }
      validItems.push({ ...item, MaSP: product.MaSP });
    }
    if (invalidBarcodes.length > 0 && validItems.length === 0) return res.status(400).json({ error: 'No valid barcodes', invalidBarcodes });
    await prisma.$transaction(async (tx: any) => {
      for (const item of validItems) {
        await tx.loHang.create({ data: { MaSP: item.MaSP, SoLuongTon: item.SoLuongNhap, GiaNhap: item.GiaNhap, HanSuDung: item.HanSuDung ? new Date(item.HanSuDung) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } });
        await tx.sanPham.update({ where: { MaSP: item.MaSP }, data: { SoLuongTon: { increment: item.SoLuongNhap } } });
      }
    });
    res.json({ count: validItems.length, invalidBarcodes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --------- STAFF ---------
app.get('/api/staff', authenticate, authorizePermissions(['VIEW_STAFF']), async (_req, res) => {
  res.json(await prisma.nhanVien.findMany({ include: { Role: true }, orderBy: { MaNV: 'asc' } }));
});
app.post('/api/staff', authenticate, authorizePermissions(['EDIT_STAFF']), async (req, res) => {
  const hashed = await bcrypt.hash(req.body.MatKhau || '123456', 10);
  res.json(await prisma.nhanVien.create({ data: { ...req.body, MatKhau: hashed } }));
});
app.put('/api/staff/:id', authenticate, authorizePermissions(['EDIT_STAFF']), async (req, res) => {
  const data: any = { ...req.body };
  if (data.MatKhau) data.MatKhau = await bcrypt.hash(data.MatKhau, 10);
  res.json(await prisma.nhanVien.update({ where: { MaNV: parseInt(req.params.id) }, data }));
});
app.delete('/api/staff/:id', authenticate, authorizePermissions(['EDIT_STAFF']), async (req, res) => {
  await prisma.nhanVien.delete({ where: { MaNV: parseInt(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --------- CHECKOUT ---------
app.post('/api/checkout', authenticate, authorizePermissions(['CHECKOUT']), async (req: AuthRequest, res) => {
  try {
    const { items, MaKH, DiemSuDung } = req.body;
    const result = await prisma.$transaction(async (tx: any) => {
      let tongTienHang = 0;
      const detailsData: any[] = [];
      for (const item of items) {
        const product = await tx.sanPham.findUnique({ where: { MaSP: item.MaSP } });
        if (!product || product.SoLuongTon < item.SoLuong) throw new Error(`Insufficient stock for ${product?.TenSP || item.MaSP}`);
        const donGia = product.GiaBan;
        tongTienHang += donGia * item.SoLuong;
        detailsData.push({ MaSP: item.MaSP, SoLuong: item.SoLuong, DonGia: donGia, ThanhTien: donGia * item.SoLuong });
        // FEFO: deduct from batches
        let remaining = item.SoLuong;
        const batches = await tx.loHang.findMany({ where: { MaSP: item.MaSP, SoLuongTon: { gt: 0 } }, orderBy: { HanSuDung: 'asc' } });
        for (const batch of batches) {
          if (remaining <= 0) break;
          const deduct = Math.min(remaining, batch.SoLuongTon);
          await tx.loHang.update({ where: { MaLo: batch.MaLo }, data: { SoLuongTon: { decrement: deduct } } });
          remaining -= deduct;
        }
        await tx.sanPham.update({ where: { MaSP: item.MaSP }, data: { SoLuongTon: { decrement: item.SoLuong } } });
      }
      let giamGia = 0;
      if (MaKH && DiemSuDung > 0) {
        const customer = await tx.khachHang.findUnique({ where: { MaKH } });
        if (customer && customer.DiemTichLuy >= DiemSuDung) {
          giamGia = DiemSuDung * 1000;
          await tx.khachHang.update({ where: { MaKH }, data: { DiemTichLuy: { decrement: DiemSuDung } } });
        }
      }
      const shift = await tx.caLamViec.findFirst({ where: { TrangThai: 'OPEN' } });
      const invoice = await tx.hoaDon.create({
        data: {
          MaNV: req.user!.id, MaKH: MaKH || null, MaCa: shift?.MaCa || null,
          TongTienHang: tongTienHang, GiamGia: giamGia, ThanhToan: tongTienHang - giamGia,
          ChiTietHoaDons: { create: detailsData }
        },
        include: { ChiTietHoaDons: { include: { SanPham: true } } }
      });
      // Earn loyalty points
      if (MaKH) {
        const pointsEarned = Math.floor((tongTienHang - giamGia) / 10000);
        if (pointsEarned > 0) {
          const updatedCustomer = await tx.khachHang.update({ where: { MaKH }, data: { DiemTichLuy: { increment: pointsEarned } } });
          // Auto-upgrade tier
          const nextTier = await tx.hangThanhVien.findFirst({ where: { DiemToiThieu: { lte: updatedCustomer.DiemTichLuy } }, orderBy: { DiemToiThieu: 'desc' } });
          if (nextTier && nextTier.MaHang !== updatedCustomer.MaHang) {
            await tx.khachHang.update({ where: { MaKH }, data: { MaHang: nextTier.MaHang } });
          }
        }
      }
      return invoice;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --------- RBAC ---------
app.get('/api/rbac/roles', authenticate, authorizePermissions(['VIEW_STAFF']), async (_req, res) => {
  res.json(await prisma.role.findMany({ include: { RolePermissions: { include: { Permission: true } } } }));
});
app.put('/api/rbac/roles/:id/permissions', authenticate, authorizePermissions(['EDIT_STAFF']), async (req, res) => {
  const roleId = parseInt(req.params.id);
  const { permissions } = req.body;
  await prisma.rolePermission.deleteMany({ where: { MaRole: roleId } });
  if (permissions && permissions.length > 0) {
    await prisma.rolePermission.createMany({ data: permissions.map((pid: number) => ({ MaRole: roleId, MaQuyen: pid })) });
  }
  const role = await prisma.role.findUnique({ where: { MaRole: roleId }, include: { RolePermissions: { include: { Permission: true } } } });
  res.json(role);
});
app.get('/api/rbac/permissions', authenticate, authorizePermissions(['VIEW_STAFF']), async (_req, res) => {
  res.json(await prisma.permission.findMany());
});

// ============ EXPORT AS NETLIFY FUNCTION ============
export const handler = serverless(app);
