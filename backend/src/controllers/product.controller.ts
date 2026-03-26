import { Request, Response } from 'express';
import { prisma } from '../index';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.sanPham.findMany({
      include: {
        LoaiHang: true,
        LoHangs: {
          where: { SoLuongTon: { gt: 0 } },
          orderBy: { HanSuDung: 'asc' }
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

export const getProductByBarcode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const MaSP = Number(id);
    if (isNaN(MaSP)) {
      return res.status(400).json({ error: 'Invalid product barcode' });
    }

    const product = await prisma.sanPham.findUnique({
      where: { MaSP },
      include: {
        LoHangs: {
          where: { SoLuongTon: { gt: 0 } },
          orderBy: { HanSuDung: 'asc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by barcode', error);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { TenSP, DonGiaBan, ThueVAT, SoLuongTon, MaLoai } = req.body;
    const product = await prisma.sanPham.create({
      data: { TenSP, DonGiaBan: Number(DonGiaBan), ThueVAT: Number(ThueVAT), SoLuongTon: Number(SoLuongTon || 0), MaLoai: Number(MaLoai) }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TenSP, DonGiaBan, ThueVAT, MaLoai } = req.body;
    const product = await prisma.sanPham.update({
      where: { MaSP: Number(id) },
      data: { TenSP, DonGiaBan: Number(DonGiaBan), ThueVAT: Number(ThueVAT), MaLoai: Number(MaLoai) }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sanPham.delete({ where: { MaSP: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product (khả năng do ràng buộc hóa đơn/lô hàng)' });
  }
};
