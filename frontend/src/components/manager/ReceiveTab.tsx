import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, Trash2 } from 'lucide-react';

const ReceiveTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');
  
  // Manual Form
  const [form, setForm] = useState({ MaSP: '', SoLuongNhap: '', GiaNhap: '', HanSuDung: '' });
  
  // Excel Import
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setProducts(res.data));
  }, [token]);

  // --- Manual Submit ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory/receive', form, { headers: { Authorization: `Bearer ${token}` }});
      alert('Nhập hàng thành công! Đã lên kệ lô FEFO mới.');
      setForm({ MaSP: '', SoLuongNhap: '', GiaNhap: '', HanSuDung: '' });
    } catch (e) { alert('Lỗi nhập hàng'); }
  };

  // --- Excel Import Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' });
        
        // Map to expected format
        const formattedData = data.map((row: any) => ({
          Barcode: row['Barcode'] || row['Mã Sản Phẩm'] || row['MaSP'],
          SoLuongNhap: parseInt(row['Số Lượng'] || row['SoLuong'] || row['SoLuongNhap']) || 0,
          GiaNhap: parseFloat(row['Giá Nhập'] || row['GiaNhap']) || 0,
          HanSuDung: row['Hạn Sử Dụng'] || row['HanSuDung'] || ''
        })).filter(r => r.Barcode); // Only keep rows with barcode

        setExcelData(formattedData);
      } catch (err) {
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleClearExcel = () => {
    setExcelData([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExcelSubmit = async () => {
    if (excelData.length === 0) return alert('Chưa có dữ liệu hợp lệ để import!');
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/inventory/import-excel', { items: excelData }, { headers: { Authorization: `Bearer ${token}` }});
      alert(`Nhập hàng thành công! Đã xử lý ${res.data.count} mặt hàng.`);
      handleClearExcel();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Lỗi nhập hàng hàng loạt từ Server!');
      if (e.response?.data?.invalidBarcodes) {
        alert('Các mã lỗi: ' + e.response.data.invalidBarcodes.join(', '));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Phiếu Nhập Hàng (Purchase Order)</h2>
          <p className="text-sm text-slate-500 mt-1">Ghi nhận hàng về kho theo mã vạch, tự động lô hàng FEFO mới.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl shrink-0">
          <button onClick={() => setMode('manual')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${mode === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Nhập Lẻ</button>
          <button onClick={() => setMode('excel')} className={`px-4 py-2 text-sm font-bold flex items-center rounded-lg transition-colors ${mode === 'excel' ? 'bg-emerald-500 shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}><FileSpreadsheet className="w-4 h-4 mr-1"/> Import Excel</button>
        </div>
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Sản Phẩm Cần Nhập</label>
            <select required value={form.MaSP} onChange={e => setForm({...form, MaSP: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 font-medium">
              <option value="">-- Chọn sản phẩm dự kiến nhập --</option>
              {products.map(p => <option key={p.MaSP} value={p.MaSP}>#{p.MaSP} - {p.TenSP}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng nhập</label>
              <input required type="number" min="1" value={form.SoLuongNhap} onChange={e => setForm({...form, SoLuongNhap: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-bold focus:border-indigo-500" placeholder="VD: 50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Giá Nhập (VND)</label>
              <input required type="number" min="0" value={form.GiaNhap} onChange={e => setForm({...form, GiaNhap: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-emerald-600 focus:border-indigo-500" placeholder="VD: 8000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold border-l-4 pl-3 border-orange-500 text-slate-700 mb-2">Hạn Sử Dụng Của Lô Này</label>
            <input required type="date" value={form.HanSuDung} onChange={e => setForm({...form, HanSuDung: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 text-lg transition-all active:scale-95">In Phiếu & Cập Nhật Tồn Kho</button>
        </form>
      ) : (
        <div className="p-8">
          {excelData.length === 0 ? (
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center bg-slate-50 flex flex-col items-center justify-center">
               <UploadCloud className="w-16 h-16 text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-800 mb-2">Tải Lên File Excel (.xlsx)</h3>
               <p className="text-slate-500 mb-6 max-w-md">File cần chứa bảng gồm các cột chuẩn: <code>Barcode</code>, <code>Số Lượng</code>, <code>Giá Nhập</code>, <code>Hạn Sử Dụng (YYYY-MM-DD)</code>.</p>
               <label className="cursor-pointer bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-3 rounded-xl font-bold transition-colors">
                 Chọn File Excel
                 <input type="file" ref={fileRef} accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
               </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-700">Tìm thấy <span className="text-emerald-600 mx-1 px-2 py-0.5 bg-emerald-100 rounded-md">{excelData.length}</span> lô hàng có mã vạch</p>
                <button onClick={handleClearExcel} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center font-bold text-sm">
                  <Trash2 className="w-4 h-4 mr-1"/> Hủy Bỏ
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-2xl scrollbar-hide">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 sticky top-0 z-10 text-slate-600 font-bold">
                    <tr>
                      <th className="px-6 py-4">Mã SP / Barcode</th>
                      <th className="px-6 py-4">Số lượng</th>
                      <th className="px-6 py-4">Giá nhập (VND)</th>
                      <th className="px-6 py-4">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excelData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">{row.Barcode}</td>
                        <td className="px-6 py-4 font-medium text-emerald-600">+{row.SoLuongNhap}</td>
                        <td className="px-6 py-4 text-slate-600">{row.GiaNhap.toLocaleString()} ₫</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{row.HanSuDung}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleExcelSubmit} 
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center"
                >
                  {isProcessing ? 'Đang Xử Lý Transaction...' : 'Xác Nhận Import Kho Hàng Loạt'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ReceiveTab;
