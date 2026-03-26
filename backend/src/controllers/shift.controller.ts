import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCurrentShift = async (req: AuthRequest, res: Response) => {
  const MaNV = req.user?.id;
  if (!MaNV) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const activeShift = await prisma.caLamViec.findFirst({
      where: { MaNV, TrangThai: 'Đang mở' }
    });
    res.json({ shift: activeShift });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
};

export const openShift = async (req: AuthRequest, res: Response) => {
  const MaNV = req.user?.id;
  const { TienDauCa } = req.body;
  if (!MaNV) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const activeShift = await prisma.caLamViec.findFirst({
      where: { MaNV, TrangThai: 'Đang mở' }
    });
    if (activeShift) return res.status(400).json({ error: 'Shift already open', shift: activeShift });

    const newShift = await prisma.caLamViec.create({
      data: {
        MaNV,
        TienDauCa: Number(TienDauCa) || 0,
        TrangThai: 'Đang mở'
      }
    });

    res.json(newShift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to open shift' });
  }
};

export const closeShift = async (req: AuthRequest, res: Response) => {
  const MaNV = req.user?.id;
  if (!MaNV) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const activeShift = await prisma.caLamViec.findFirst({
      where: { MaNV, TrangThai: 'Đang mở' }
    });
    
    if (!activeShift) return res.status(400).json({ error: 'No active shift found' });

    // Calculate TienCuoiCa based on all cash invoices done during this exact shift
    const invoices = await prisma.hoaDon.findMany({
      where: { MaCa: activeShift.MaCa, PhuongThucThanhToan: 'Tiền mặt' }
    });
    const cashEarned = invoices.reduce((acc: number, inv: any) => acc + (inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia), 0);

    // Calculate money refunded during this shift
    const refunds = await prisma.phieuTraHang.findMany({
      where: { MaCa: activeShift.MaCa }
    });
    const cashRefunded = refunds.reduce((acc: number, rtn: any) => acc + rtn.TongTienHoan, 0);

    const expectedCash = activeShift.TienDauCa + cashEarned - cashRefunded;

    const closedShift = await prisma.caLamViec.update({
      where: { MaCa: activeShift.MaCa },
      data: {
        ThoiGianKetThuc: new Date(),
        TienCuoiCa: expectedCash,
        TrangThai: 'Đã chốt'
      }
    });

    res.json(closedShift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to close shift' });
  }
};

export const getAllShifts = async (req: AuthRequest, res: Response) => {
  try {
    const shifts = await prisma.caLamViec.findMany({
      include: {
        NhanVien: {
          select: { HoTen: true }
        }
      },
      orderBy: { ThoiGianBatDau: 'desc' }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all shifts for history report' });
  }
};
