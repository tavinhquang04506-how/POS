import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Search, Download } from 'lucide-react';

const CustomersTab = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/customers', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setCustomers(res.data));
  }, [token]);

  const filteredCustomers = customers.filter(c => 
    c.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.SDT.includes(searchTerm)
  );

  const handleExportExcel = () => {
    if (customers.length === 0) return alert('Không có dữ liệu!');
    const exportData = customers.map(c => ({
      'ID Hội Viên': c.MaKH,
      'Họ Tên': c.HoTen,
      'SĐT': c.SDT,
      'Điểm Tích Lũy': c.DiemTichLuy
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoi Vien");
    XLSX.writeFile(wb, `HoiVien_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tệp Khách Hàng (CRM)</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi điểm tích lũy và điều chỉnh tệp hội viên.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Tên hoặc SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
            />
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 font-bold rounded-lg text-sm flex items-center justify-center whitespace-nowrap">
              Tổng hội viên: {customers.length}
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">ID Hội Viên</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Họ & Tên</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase">Số Điện Thoại</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Điểm Tích Lũy</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c: any) => (
              <tr key={c.MaKH} className="border-b border-slate-50">
                <td className="p-4 font-bold text-slate-400">KH{String(c.MaKH).padStart(4, '0')}</td>
                <td className="p-4 font-bold text-slate-800">{c.HoTen}</td>
                <td className="p-4 font-medium text-slate-600 font-mono tracking-wider">{c.SDT}</td>
                <td className="p-4 text-right">
                  <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-black text-sm">{c.DiemTichLuy} PTS</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CustomersTab;
