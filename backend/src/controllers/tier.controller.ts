import { Request, Response } from 'express';
import { prisma } from '../index';

export const getTiers = async (req: Request, res: Response) => {
  try {
    const tiers = await prisma.hangThanhVien.findMany({
      orderBy: { MinDiem: 'asc' }
    });
    res.json(tiers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải danh sách hạng' });
  }
};

export const createTier = async (req: Request, res: Response) => {
  try {
    const { TenHang, MinDiem, PhanTramGiamGia } = req.body;
    const newTier = await prisma.hangThanhVien.create({
      data: { TenHang, MinDiem: Number(MinDiem), PhanTramGiamGia: Number(PhanTramGiamGia) }
    });
    res.json(newTier);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo hạng' });
  }
};

export const updateTier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TenHang, MinDiem, PhanTramGiamGia } = req.body;
    const updated = await prisma.hangThanhVien.update({
      where: { MaHang: Number(id) },
      data: { TenHang, MinDiem: Number(MinDiem), PhanTramGiamGia: Number(PhanTramGiamGia) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi sửa hạng' });
  }
};

export const deleteTier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hangThanhVien.delete({
      where: { MaHang: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa hạng' });
  }
};
