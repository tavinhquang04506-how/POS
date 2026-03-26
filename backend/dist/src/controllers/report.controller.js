"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyRevenue = exports.getReportsAndInvoices = void 0;
const index_1 = require("../index");
const getReportsAndInvoices = async (req, res) => {
    try {
        const invoices = await index_1.prisma.hoaDon.findMany({
            include: {
                NhanVien: { select: { HoTen: true } },
                KhachHang: { select: { HoTen: true, SDT: true } },
                ChiTietHoaDons: {
                    include: {
                        SanPham: { select: { TenSP: true } }
                    }
                }
            },
            orderBy: { NgayLap: 'desc' }
        });
        const returnsQuery = await index_1.prisma.phieuTraHang.findMany({
            orderBy: { NgayTra: 'desc' }
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayInvoices = invoices.filter(inv => inv.NgayLap >= today);
        const todayGross = todayInvoices.reduce((acc, inv) => acc + (inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia), 0);
        const todayCount = todayInvoices.length;
        const todayReturns = returnsQuery.filter(rtn => rtn.NgayTra >= today);
        const todayReturnAmount = todayReturns.reduce((acc, rtn) => acc + rtn.TongTienHoan, 0);
        const todayRevenue = todayGross - todayReturnAmount;
        const totalGross = invoices.reduce((acc, inv) => acc + (inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia), 0);
        const totalReturnAmount = returnsQuery.reduce((acc, rtn) => acc + rtn.TongTienHoan, 0);
        const totalRevenue = totalGross - totalReturnAmount;
        let responseInvoices = invoices;
        let pagination = null;
        if (req.query.page && req.query.limit) {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 20);
            const skip = (page - 1) * limit;
            responseInvoices = invoices.slice(skip, skip + limit);
            pagination = {
                page,
                limit,
                total: invoices.length,
                totalPages: Math.ceil(invoices.length / limit)
            };
        }
        res.json({
            summary: {
                todayRevenue,
                todayReturnAmount,
                todayCount,
                totalRevenue,
                totalReturnAmount,
                totalInvoices: invoices.length
            },
            invoices: responseInvoices,
            returns: returnsQuery,
            ...(pagination && { pagination })
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi khi tải báo cáo doanh thu' });
    }
};
exports.getReportsAndInvoices = getReportsAndInvoices;
const getDailyRevenue = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);
        startDate.setHours(0, 0, 0, 0);
        const invoices = await index_1.prisma.hoaDon.findMany({
            where: { NgayLap: { gte: startDate } }
        });
        const returnsQuery = await index_1.prisma.phieuTraHang.findMany({
            where: { NgayTra: { gte: startDate } }
        });
        const dailyData = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            dailyData[dateStr] = { date: dateStr, revenue: 0, returns: 0 };
        }
        invoices.forEach(inv => {
            const dateStr = new Date(inv.NgayLap).toISOString().split('T')[0];
            if (dailyData[dateStr])
                dailyData[dateStr].revenue += (inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia);
        });
        returnsQuery.forEach((rt) => {
            const dateStr = new Date(rt.NgayTra).toISOString().split('T')[0];
            if (dailyData[dateStr])
                dailyData[dateStr].returns += rt.TongTienHoan;
        });
        const result = Object.values(dailyData).map((d) => ({
            date: new Date(d.date).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' }),
            revenue: d.revenue,
            returns: d.returns
        }));
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch daily revenue' });
    }
};
exports.getDailyRevenue = getDailyRevenue;
