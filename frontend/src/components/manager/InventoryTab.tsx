import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Search, Download } from 'lucide-react';

const InventoryTab = ({ products: _unused }: { products?: any[] }) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios.get('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setBatches(res.data)).catch(console.error);
    }
  }, [token]);

  const filteredBatches = batches.filter(b => 
    b.SanPham?.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(b.MaLo).includes(searchTerm)
  );

  const handleExportExcel = () => {
    if (batches.length === 0) return alert('Không có dữ liệu!');
    const exportData = batches.map(b => ({
      'Mã Lô': b.MaLo,
      'Sản Phẩm': b.SanPham?.TenSP,
      'Hạn Sử Dụng': new Date(b.HanSuDung).toLocaleDateString('vi-VN'),
      'Tồn Kho': b.SoLuongTon
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ton Kho FEFO");
    XLSX.writeFile(wb, `TonKho_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kho Hàng Trực Tuyến</h2>
          <p className="text-sm text-slate-500 mt-1">Kiểm soát lô hàng theo nguyên tắc nhập trước xuất trước (FEFO).</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Lô, Tên Sản Phẩm..." 
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
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-slate-100">
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Mã Lô</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Sản Phẩm</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">SL Tồn Lô</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">HSD Lô</th>
              <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredBatches.map(b => {
              const expDate = new Date(b.HanSuDung);
              const isExp = expDate.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
              const isLowStock = b.SoLuongTon < 10 && b.SoLuongTon > 0;
              const isOutOfStock = b.SoLuongTon === 0;

              return (
                <tr key={b.MaLo} className={`hover:bg-slate-50/80 transition-colors ${isExp ? 'bg-orange-50/30' : ''}`}>
                  <td className="p-5 font-bold text-slate-400">#{b.MaLo}</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{b.SanPham?.TenSP}</div>
                    <div className="text-xs text-slate-400 font-medium">MSP: {b.SanPham?.MaSP} | Tồn danh mục: {b.SanPham?.SoLuongTon}</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`text-lg font-black px-4 py-1.5 rounded-xl ${isOutOfStock ? 'text-rose-600 bg-rose-50' : 'text-indigo-600 bg-indigo-50'}`}>{b.SoLuongTon}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isExp ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {expDate.toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    {isOutOfStock ? (
                      <span className="text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">Hết hàng</span>
                    ) : isLowStock ? (
                      <span className="text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">Sắp hết</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">Tốt</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {batches.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Chưa có lô hàng nào trong kho.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default InventoryTab;
