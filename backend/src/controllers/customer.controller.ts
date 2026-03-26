import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';

export const getCustomerByPhone = async (req: Request, res: Response) => {
  try {
    const phone = req.params.phone as string;
    const customer = await prisma.khachHang.findUnique({ where: { SDT: phone } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    // Evaluate Tier dynamically
    const tier = await prisma.hangThanhVien.findFirst({
      where: { MinDiem: { lte: customer.DiemTichLuy } },
      orderBy: { MinDiem: 'desc' }
    });

    res.json({
      ...customer,
      HangThanhVien: tier || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const getMyHistory = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.id;
    const history = await prisma.hoaDon.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { HoTen, SDT } = req.body;
    if (!HoTen || !SDT) return res.status(400).json({ error: 'Thiếu thông tin HoTen hoặc SDT' });
    
    const existing = await prisma.khachHang.findUnique({ where: { SDT } });
    if (existing) return res.status(400).json({ error: 'Số điện thoại này đã được đăng ký' });

    const MatKhau = await bcrypt.hash(SDT, 10);
    const newKhachHang = await prisma.khachHang.create({
      data: { HoTen, SDT, MatKhau, DiemTichLuy: 0 }
    });
    
    // Evaluate base tier
    const baseTier = await prisma.hangThanhVien.findFirst({
      where: { MinDiem: { lte: 0 } },
      orderBy: { MinDiem: 'desc' }
    });

    res.json({
      ...newKhachHang,
      HangThanhVien: baseTier || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi tạo khách hàng mới' });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.khachHang.findMany({
      orderBy: { DiemTichLuy: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Fetching customers failed' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { HoTen, DiemTichLuy } = req.body;
    
    const customer = await prisma.khachHang.update({
      where: { MaKH: Number(id) },
      data: { HoTen, DiemTichLuy: Number(DiemTichLuy) }
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Khong the cap nhat khach hang' });
  }
};
