import { useState, useEffect } from 'react';
import api from '../../api';
import { DollarSign, FileText, RefreshCcw, TrendingUp, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';

const OverviewTab = () => {
  const [metrics, setMetrics] = useState({
    revenueToday: 0,
    invoicesToday: 0,
    returnsToday: 0,
    topProducts: [] as { name: string; qty: number }[]
  });
  
  const [alerts, setAlerts] = useState({
    lowStock: [] as any[],
    expiring: [] as any[]
  });

  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Revenue data to calculate today's metrics
        const revenueRes = await api.get('/api/reports/revenue');
        const todayStr = new Date().toDateString();
        
        let revenueToday = 0;
        let invoicesToday = 0;
        let returnsToday = 0;
        
        const productSales: Record<string, number> = {};

        revenueRes.data.invoices.forEach((inv: any) => {
          if (new Date(inv.NgayLap).toDateString() === todayStr) {
            revenueToday += (inv.TongTienHang - inv.GiamGia);
            invoicesToday++;
          }
          // Calculate top products
          inv.ChiTietHoaDons.forEach((detail: any) => {
            const spName = detail.SanPham?.TenSP || `SP #${detail.MaSP}`;
            productSales[spName] = (productSales[spName] || 0) + detail.SoLuong;
          });
        });

        revenueRes.data.returns.forEach((rtn: any) => {
          if (new Date(rtn.NgayTra).toDateString() === todayStr) {
            returnsToday += rtn.TongTienHoan;
          }
        });

        // Sort top 5 products
        const topProducts = Object.entries(productSales)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        setMetrics({ revenueToday, invoicesToday, returnsToday, topProducts });

        // 2. Fetch Alerts using new inventory APIs
        const [lowStockRes, expiringRes] = await Promise.all([
          api.get('/api/inventory?lowstock=10'),
          api.get('/api/inventory?expiring=7')
        ]);

        // Using Set to get unique products for low stock across batches
        const uniqueLowStock = new Map();
        lowStockRes.data.forEach((batch: any) => {
          if (batch.SanPham) {
            uniqueLowStock.set(batch.MaSP, batch.SanPham);
          }
        });

        setAlerts({
          lowStock: Array.from(uniqueLowStock.values()),
          expiring: expiringRes.data
        });

      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const netRevenueToday = metrics.revenueToday - metrics.returnsToday;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Doanh Thu Thuần (Hôm nay)</p>
            <p className="text-2xl font-black text-slate-800">{netRevenueToday.toLocaleString()} ₫</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Hóa Đơn (Hôm nay)</p>
            <p className="text-2xl font-black text-slate-800">{metrics.invoicesToday}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-rose-100 text-rose-600 p-4 rounded-2xl">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Hoàn Trả (Hôm nay)</p>
            <p className="text-2xl font-black text-slate-800">{metrics.returnsToday.toLocaleString()} ₫</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-2xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400">Cảnh Báo Hệ Thống</p>
            <p className="text-2xl font-black text-slate-800">{alerts.lowStock.length + alerts.expiring.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Top Sản Phẩm</h2>
          </div>
          <div className="space-y-4">
            {metrics.topProducts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-slate-700">{p.name}</span>
                </div>
                <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">{p.qty}</span>
              </div>
            ))}
            {metrics.topProducts.length === 0 && (
              <p className="text-center text-slate-400 py-4 font-medium">Chưa có dữ liệu bán hàng.</p>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <AlertCircle className="w-6 h-6 text-rose-500 mr-2" />
             Trung Tâm Cảnh Báo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
              <h3 className="text-rose-700 font-bold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Sắp Hết Hàng ({alerts.lowStock.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {alerts.lowStock.map((p: any) => (
                  <div key={p.MaSP} className="bg-white p-3 border border-rose-100 rounded-xl flex justify-between items-center shadow-sm">
                    <span className="font-semibold text-slate-700 text-sm truncate mr-2">{p.TenSP}</span>
                    <span className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-md min-w-[3rem] text-center">SL: {p.SoLuongTon}</span>
                  </div>
                ))}
                {alerts.lowStock.length === 0 && (
                  <p className="text-sm text-rose-400/80 font-medium pb-2 text-center">Kho hàng đang ổn định.</p>
                )}
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
              <h3 className="text-orange-700 font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Sắp Hết Hạn ({alerts.expiring.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {alerts.expiring.map((b: any) => (
                  <div key={b.MaLo} className="bg-white p-3 border border-orange-100 rounded-xl flex justify-between items-center shadow-sm">
                    <div className="flex flex-col truncate mr-2">
                      <span className="font-semibold text-slate-700 text-sm truncate">{b.SanPham?.TenSP}</span>
                      <span className="text-xs text-slate-400 font-medium mt-0.5">Lô #{b.MaLo} | Tồn: {b.SoLuongTon}</span>
                    </div>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md whitespace-nowrap">
                      {new Date(b.HanSuDung).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
                {alerts.expiring.length === 0 && (
                  <p className="text-sm text-orange-400/80 font-medium pb-2 text-center">Không có lô hàng sắp hết hạn.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
