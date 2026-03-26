import { Request, Response } from 'express';
import { prisma } from '../index';

export const receiveGoods = async (req: Request, res: Response) => {
  try {
    const { MaSP, SoLuongNhap, GiaNhap, HanSuDung } = req.body;
    
    if (!MaSP || !SoLuongNhap || !GiaNhap || !HanSuDung) {
      return res.status(400).json({ error: 'Missing required inventory data' });
    }

    const newBatch = await prisma.loHang.create({
      data: {
        MaSP: Number(MaSP),
        SoLuongTon: Number(SoLuongNhap),
        GiaNhap: Number(GiaNhap),
        HanSuDung: new Date(HanSuDung)
      }
    });

    // Update total product stock cache implicitly or explicitly
    const currentProduct = await prisma.sanPham.findUnique({
      where: { MaSP: Number(MaSP) }
    });

    await prisma.sanPham.update({
      where: { MaSP: Number(MaSP) },
      data: { SoLuongTon: (currentProduct?.SoLuongTon || 0) + Number(SoLuongNhap) }
    });

    res.json(newBatch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive goods via Purchase Order' });
  }
};

export const getInventory = async (req: Request, res: Response) => {
  try {
    const { expiring, lowstock } = req.query;
    
    // First find matching specific conditions if provided
    let batchWhereClause: any = {};
    let productWhereClause: any = {};

    // 1. Filter expiring batches
    if (expiring) {
      const days = Number(expiring);
      if (!isNaN(days)) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + days);
        batchWhereClause.HanSuDung = { lte: thresholdDate };
      }
    }

    // 2. Filter low stock products
    if (lowstock) {
      const stockThreshold = Number(lowstock);
      if (!isNaN(stockThreshold)) {
        productWhereClause.SoLuongTon = { lt: stockThreshold };
      }
    }

    // Query batches joining products
    const inventory = await prisma.loHang.findMany({
      where: {
        ...batchWhereClause,
        SanPham: {
          ...productWhereClause
        }
      },
      include: {
        SanPham: {
          include: {
            LoaiHang: true
          }
        }
      },
      orderBy: {
        HanSuDung: 'asc'
      }
    });

    res.json(inventory);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    res.status(500).json({ error: 'Lỗi khi tải dữ liệu kho hàng' });
  }
};

export const getInventoryAlerts = async (req: Request, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [lowStockCount, expiringCount] = await Promise.all([
      prisma.loHang.count({ where: { SoLuongTon: { lt: 10, gt: 0 } } }),
      prisma.loHang.count({ where: { HanSuDung: { lte: thirtyDaysFromNow }, SoLuongTon: { gt: 0 } } })
    ]);

    res.json({ lowStockCount, expiringCount });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory alerts' });
  }
};

export const importExcel = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; 
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu Excel rỗng hoặc định dạng không hợp lệ' });
    }

    const barcodes = items.map((i: any) => String(i.Barcode).trim());
    
    const products = await prisma.sanPham.findMany({
      where: { MaSP: { in: barcodes.map(b => Number(b)).filter(n => !isNaN(n)) } }
    });

    const productMap = new Map();
    products.forEach(p => productMap.set(String(p.MaSP), p));

    const invalidBarcodes = barcodes.filter(b => !productMap.has(b));
    if (invalidBarcodes.length > 0) {
      return res.status(400).json({ error: 'Có mã vạch không tồn tại trong hệ thống', invalidBarcodes });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const barcodeStr = String(item.Barcode).trim();
        const product = productMap.get(barcodeStr);
        const soLuongNhap = Number(item.SoLuongNhap);
        const giaNhap = Number(item.GiaNhap);
        
        let parsedDate = new Date(item.HanSuDung);
        if (isNaN(parsedDate.getTime())) {
          parsedDate = new Date();
          parsedDate.setFullYear(parsedDate.getFullYear() + 1); // fallback 1 year
        }

        await tx.loHang.create({
          data: {
            MaSP: product.MaSP,
            SoLuongTon: soLuongNhap,
            GiaNhap: giaNhap,
            HanSuDung: parsedDate
          }
        });

        await tx.sanPham.update({
          where: { MaSP: product.MaSP },
          data: { SoLuongTon: product.SoLuongTon + soLuongNhap }
        });
        
        productMap.set(barcodeStr, { ...product, SoLuongTon: product.SoLuongTon + soLuongNhap });
      }
    });

    res.json({ message: 'Nhập hàng Excel thành công!', count: items.length });
  } catch (error) {
    console.error('Import Excel Error:', error);
    res.status(500).json({ error: 'Lỗi khi import hàng loạt từ Excel' });
  }
};
