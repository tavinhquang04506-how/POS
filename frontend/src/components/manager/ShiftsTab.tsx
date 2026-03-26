import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Search, Download } from 'lucide-react';

const ShiftsTab = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/shifts', { headers: { Authorization: `Bearer ${token}` }});
        setShifts(res.data);
      } catch (e) { console.error(e); }
    };
    fetchShifts();
  }, [token]);

  const filteredShifts = shifts.filter(s => 
    s.NhanVien?.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(s.MaCa).includes(searchTerm)
  );

  const handleExportExcel = () => {
    if (shifts.length === 0) return alert('Không có dữ liệu!');
    const exportData = shifts.map(s => ({
      'Mã Ca': s.MaCa,
      'Nhân Viên': s.NhanVien?.HoTen,
      'Bắt Đầu': new Date(s.ThoiGianBatDau).toLocaleString('vi-VN'),
      'Kết Thúc': s.ThoiGianKetThuc ? new Date(s.ThoiGianKetThuc).toLocaleString('vi-VN') : 'Chưa chốt',
      'Trạng Thái': s.TrangThai,
      'Tiền Mặt (Dự Kiến)': s.TienCuoiCa
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ca Lam Viec");
    XLSX.writeFile(wb, `CaLamViec_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lịch sử Ca Làm Việc</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi quá trình mở/chốt ca của thu ngân.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Mã Ca, Nhân Viên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
            />
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Mã Ca</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Nhân Viên</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Bắt Đầu</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Kết Thúc</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Trạng Thái</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Dự kiến Tiền Mặt</th>
            </tr>
          </thead>
          <tbody>
            {filteredShifts.map((s: any) => (
              <tr key={s.MaCa} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-500">#{s.MaCa}</td>
                <td className="p-4 font-bold text-slate-800">{s.NhanVien?.HoTen}</td>
                <td className="p-4 text-slate-600 text-sm">{new Date(s.ThoiGianBatDau).toLocaleString('vi-VN')}</td>
                <td className="p-4 text-slate-600 text-sm">{s.ThoiGianKetThuc ? new Date(s.ThoiGianKetThuc).toLocaleString('vi-VN') : '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.TrangThai === 'Đang mở' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{s.TrangThai}</span>
                </td>
                <td className="p-4 font-black text-rose-600 text-right">{s.TienCuoiCa ? s.TienCuoiCa.toLocaleString() + ' ₫' : 'Đang tính...'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ShiftsTab;
