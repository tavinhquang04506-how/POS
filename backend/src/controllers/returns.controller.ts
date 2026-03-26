import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getInvoiceForReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const NumberId = Number(id);

    const invoice = await prisma.hoaDon.findUnique({
      where: { MaHD: NumberId },
      include: {
        ChiTietHoaDons: {
          include: {
            SanPham: true,
          }
        },
        KhachHang: true,
      }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Load existing returns to calculate non-returnable remaining quantities
    const existingReturns = await prisma.phieuTraHang.findMany({
      where: { MaHD: NumberId },
      include: { ChiTietPhieuTras: true }
    });

    const returnedQuantities: Record<number, number> = {};
    existingReturns.forEach(rtn => {
      rtn.ChiTietPhieuTras.forEach(detail => {
        if (!returnedQuantities[detail.MaSP]) returnedQuantities[detail.MaSP] = 0;
        returnedQuantities[detail.MaSP] += detail.SoLuongTra;
      });
    });

    const returnableItems = invoice.ChiTietHoaDons.map(item => {
      const returnedAlready = returnedQuantities[item.MaSP] || 0;
      return {
        ...item,
        SoLuongCoTheTra: item.SoLuong - returnedAlready
      };
    });

    res.json({ ...invoice, ChiTietHoaDons: returnableItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice for return' });
  }
};

export const createReturn = async (req: AuthRequest, res: Response) => {
  try {
    const { MaHD, LyDoTra, Items } = req.body;
    // Items: Array of { MaSP, SoLuongTra, DonGiaHoan }

    if (!MaHD || !Items || Items.length === 0) {
      return res.status(400).json({ error: 'Missing return details' });
    }

    const maNV = req.user?.id;
    if (!maNV) return res.status(401).json({ error: 'Unauthorized' });

    const invoice = await prisma.hoaDon.findUnique({ 
      where: { MaHD: Number(MaHD) },
      include: { ChiTietHoaDons: true } 
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Validate return quantities against original minus already returned
    const existingReturns = await prisma.phieuTraHang.findMany({
      where: { MaHD: Number(MaHD) },
      include: { ChiTietPhieuTras: true }
    });

    const returnedQuantities: Record<number, number> = {};
    existingReturns.forEach(rtn => {
      rtn.ChiTietPhieuTras.forEach(detail => {
        returnedQuantities[detail.MaSP] = (returnedQuantities[detail.MaSP] || 0) + detail.SoLuongTra;
      });
    });

    for (const returnItem of Items) {
      const originalItem = invoice.ChiTietHoaDons.find(i => i.MaSP === returnItem.MaSP);
      if (!originalItem) {
         return res.status(400).json({ error: `Sản phẩm ${returnItem.MaSP} không có trong hóa đơn gốc` });
      }

      const alreadyReturned = returnedQuantities[returnItem.MaSP] || 0;
      const maxReturnable = originalItem.SoLuong - alreadyReturned;

      if (returnItem.SoLuongTra > maxReturnable) {
         return res.status(400).json({ error: `Sản phẩm ${returnItem.MaSP} vượt quá SL có thể trả (Tối đa: ${maxReturnable})` });
      }
    }

    let tongTienHoan = 0;
    Items.forEach((item: any) => {
      tongTienHoan += item.SoLuongTra * item.DonGiaHoan;
    });

    // We do a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create PhieuTraHang
      const phieuTra = await tx.phieuTraHang.create({
        data: {
          TongTienHoan: tongTienHoan,
          LyDoTra,
          MaHD: Number(MaHD),
          MaNV: maNV,
          MaCa: invoice.MaCa,
          ChiTietPhieuTras: {
            create: Items.map((item: any) => ({
              SoLuongTra: item.SoLuongTra,
              DonGiaHoan: item.DonGiaHoan,
              ThanhTien: item.SoLuongTra * item.DonGiaHoan,
              MaSP: item.MaSP
            }))
          }
        }
      });

      // 2. Restore Inventory (SoLuongTon)
      for (const item of Items) {
        await tx.sanPham.update({
          where: { MaSP: item.MaSP },
          data: { SoLuongTon: { increment: item.SoLuongTra } }
        });
      }

      // 3. Deduct Loyalty Points
      if (invoice.MaKH) {
        const pointsDeducted = Math.floor(tongTienHoan * 0.01);
        
        const currentKH = await tx.khachHang.findUnique({ where: { MaKH: invoice.MaKH }});
        if (currentKH) {
          const newPoints = Math.max(0, currentKH.DiemTichLuy - pointsDeducted);
          await tx.khachHang.update({
            where: { MaKH: invoice.MaKH },
            data: { DiemTichLuy: newPoints }
          });
        }
      }

      return phieuTra;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ error: 'Transaction failed for return' });
  }
};

export const getAllReturns = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : null;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : null;

    const queryArgs: any = {
      orderBy: { NgayTra: 'desc' },
      include: {
        NhanVien: { select: { HoTen: true } },
        HoaDon: { select: { MaHD: true } },
        ChiTietPhieuTras: {
          include: {
            SanPham: { select: { TenSP: true } }
          }
        }
      }
    };

    if (page && limit) {
      queryArgs.skip = (page - 1) * limit;
      queryArgs.take = limit;
    }

    const [returns, total] = await Promise.all([
      prisma.phieuTraHang.findMany(queryArgs),
      page && limit ? prisma.phieuTraHang.count() : Promise.resolve(0)
    ]);

    if (page && limit) {
      res.json({
        data: returns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      res.json(returns);
    }
  } catch (error) {
    console.error('Fetch returns error:', error);
    res.status(500).json({ error: 'Failed to fetch returns history' });
  }
};
