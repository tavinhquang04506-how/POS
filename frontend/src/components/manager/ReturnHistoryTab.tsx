import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { RotateCcw, Download } from 'lucide-react';
import Pagination from '../common/Pagination';

const ReturnHistoryTab = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem('token');

  const fetchReturns = async (page: number) => {
    if (token) {
      try {
        const res = await axios.get(`http://localhost:3000/api/returns?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          setReturns(res.data.data);
          setCurrentPage(res.data.pagination.page);
          setTotalPages(res.data.pagination.totalPages);
        } else {
          setReturns(res.data);
        }
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    fetchReturns(1);
  }, [token]);

  const handleExportExcel = () => {
    if (returns.length === 0) return alert('Không có dữ liệu!');
    const exportData = returns.map(r => ({
      'Mã Phiếu': r.MaPTH,
      'Mã Hóa Đơn': r.MaHD,
      'Ngày Lập': new Date(r.NgayTra).toLocaleString('vi-VN'),
      'Tổng Hoàn': r.TongTienHoan,
      'Nhân Viên': r.NhanVien?.HoTen,
      'Lý Do': r.LyDoTra
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lich Su Doi Tra");
    XLSX.writeFile(wb, `LichSuDoiTra_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <RotateCcw className="w-6 h-6 mr-2 text-rose-500" />
            Lịch Sử Đổi Trả
          </h2>
          <p className="text-sm text-slate-500 mt-1">Lưu trữ toàn bộ giao dịch hoàn tiền và trả hàng về kho.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Mã Phiếu</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Hóa Đơn Gốc</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Ngày Lập</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Tổng Hoàn</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Nhân Viên</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Lý Do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {returns.map(r => (
              <tr key={r.MaPTH} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-5 font-bold text-slate-500">#{r.MaPTH}</td>
                <td className="p-5 font-bold text-indigo-600">HD{String(r.MaHD).padStart(4, '0')}</td>
                <td className="p-5 text-sm font-medium text-slate-600">
                  {new Date(r.NgayTra).toLocaleString('vi-VN')}
                </td>
                <td className="p-5 text-right font-black text-rose-600">
                  {r.TongTienHoan.toLocaleString()} ₫
                </td>
                <td className="p-5 text-sm font-semibold text-slate-700">
                  {r.NhanVien?.HoTen}
                </td>
                <td className="p-5 text-sm text-slate-500">
                  {r.LyDoTra || <span className="text-slate-300 italic">Không có</span>}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">Chưa có giao dịch đổi trả nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchReturns}
      />
    </div>
  );
};

export default ReturnHistoryTab;
