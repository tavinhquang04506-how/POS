import { useState, useEffect } from 'react';
import api from '../../api';
import * as XLSX from 'xlsx';
import { Download, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Pagination from '../common/Pagination';

const RevenueTab = () => {
  const [data, setData] = useState<{ summary: any, invoices: any[] }>({ summary: {}, invoices: [] });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chartData, setChartData] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports(1);
  }, []);

  const fetchReports = async (page: number) => {
    try {
      const res = await api.get(`/api/reports/revenue?page=${page}&limit=10`);
      setData(res.data);
      setInvoices(res.data.invoices);
      setReturns(res.data.returns);
      if (res.data.pagination) {
        setCurrentPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      }
      
      const resDaily = await api.get('/api/reports/revenue-daily?days=7');
      setChartData(resDaily.data);
    } catch (e) { console.error(e); }
  };

  const handleExportExcel = () => {
    if (!data.invoices || data.invoices.length === 0) return alert('Không có dữ liệu để xuất!');
    
    const exportData = data.invoices.map((inv: any) => ({
      'Mã Hóa Đơn': inv.MaHD,
      'Khách Hàng': inv.KhachHang?.HoTen || 'Khách vãng lai',
      'Số Điện Thoại': inv.KhachHang?.SDT || '',
      'Ngày Bán': new Date(inv.NgayLap).toLocaleString('vi-VN'),
      'Thu Ngân': inv.NhanVien?.HoTen || '',
      'Tổng Tiền Hàng': inv.TongTienHang,
      'Thuế VAT': inv.TongThueGTGT,
      'Giảm Giá': inv.GiamGia,
      'Doanh Thu Thuần': inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lich Su Hoa Don");
    
    XLSX.writeFile(workbook, `BaoCao_DoanhThu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredInvoices = invoices.filter(inv => {
    const searchLower = searchTerm.toLowerCase();
    return String(inv.MaHD).includes(searchLower) || 
           (inv.KhachHang?.HoTen?.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
          <p className="text-indigo-100 font-medium mb-1">Doanh thu thuần hôm nay</p>
          <p className="text-4xl font-black">{data.summary.todayRevenue?.toLocaleString() || 0} ₫</p>
          <div className="flex justify-between mt-3 px-3 py-2 bg-white/10 rounded-xl text-sm border border-white/20">
             <span>Hoàn trả: <span className="font-bold text-rose-300">-{data.summary.todayReturnAmount?.toLocaleString() || 0} ₫</span></span>
             <span>({data.summary.todayCount} hóa đơn)</span>
          </div>
        </div>
        <div className="bg-white border text-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Tổng doanh thu hệ thống</p>
            <p className="text-3xl font-black text-slate-800">{data.summary.totalRevenue?.toLocaleString() || 0} ₫</p>
          </div>
          <div className="flex justify-between mt-3 px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-100">
             <span className="text-slate-500">Tổng hoàn trả: <span className="text-rose-600 font-bold">-{data.summary.totalReturnAmount?.toLocaleString() || 0} ₫</span></span>
             <span className="font-bold text-slate-400" title="Tỷ lệ trả hàng / Tổng bán">
               {data.summary.totalRevenue > 0 ? ((data.summary.totalReturnAmount || 0) / ((data.summary.totalRevenue || 1) + (data.summary.totalReturnAmount || 0)) * 100).toFixed(1) : 0}% tỷ lệ trả
             </span>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Doanh Thu" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" name="Hoàn Tiền" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Báo Cáo Hóa Đơn Chi Tiết</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm theo Mã HĐ, Khách Hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64"
              />
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Mã Hóa Đơn</th>
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Ngày Lập</th>
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Khách Hàng</th>
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Thu Ngân</th>
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Giảm Giá</th>
                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Tổng Tiền Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv: any) => (
                <tr key={inv.MaHD} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="p-4 font-bold text-indigo-600">#{inv.MaHD}</td>
                  <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{new Date(inv.NgayLap).toLocaleString('vi-VN')}</td>
                  <td className="p-4 font-medium text-slate-800">{inv.KhachHang?.HoTen || 'Khách vãng lai'}</td>
                  <td className="p-4 text-slate-600 text-sm">{inv.NhanVien?.HoTen}</td>
                  <td className="p-4 text-slate-600 text-sm">{inv.GiamGia.toLocaleString()} ₫</td>
                  <td className="p-4 font-black text-emerald-600 text-right">{(inv.TongTienHang + inv.TongThueGTGT - inv.GiamGia).toLocaleString()} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchReports}
        />
      </div>
    </div>
  );
};
export default RevenueTab;
