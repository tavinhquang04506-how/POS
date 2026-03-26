import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.nhanVien.findMany({
      select: { MaNV: true, HoTen: true, VaiTro: true, MaRole: true, GroupRole: true }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { HoTen, VaiTro, MatKhau, MaRole } = req.body;
    const hashedPassword = await bcrypt.hash(MatKhau, 10);
    
    const staff = await prisma.nhanVien.create({
      data: { HoTen, VaiTro, MaRole: MaRole ? Number(MaRole) : null, MatKhau: hashedPassword }
    });
    res.json({ success: true, MaNV: staff.MaNV });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { HoTen, VaiTro, MatKhau, MaRole } = req.body;
    
    let updateData: any = { HoTen, VaiTro, MaRole: MaRole ? Number(MaRole) : null };
    if (MatKhau) {
      updateData.MatKhau = await bcrypt.hash(MatKhau, 10);
    }

    const staff = await prisma.nhanVien.update({
      where: { MaNV: Number(id) },
      data: updateData
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.nhanVien.delete({ where: { MaNV: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
};
