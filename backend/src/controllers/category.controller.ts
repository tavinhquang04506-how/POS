import { Request, Response } from 'express';
import { prisma } from '../index';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.loaiHang.findMany({
      include: {
        _count: { select: { SanPhams: true } }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { TenLoai, Mota } = req.body;
    const cat = await prisma.loaiHang.create({ data: { TenLoai, Mota } });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TenLoai, Mota } = req.body;
    const cat = await prisma.loaiHang.update({
      where: { MaLoai: Number(id) },
      data: { TenLoai, Mota }
    });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.loaiHang.delete({ where: { MaLoai: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category (khả năng do ràng buộc khóa ngoại' });
  }
};
