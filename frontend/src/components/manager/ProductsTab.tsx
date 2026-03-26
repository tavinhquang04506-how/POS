import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Edit2, Trash2, Search } from 'lucide-react';

const ProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProd, setEditingProd] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [resP, resC] = await Promise.all([
        axios.get('http://localhost:3000/api/products', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('http://localhost:3000/api/categories', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setProducts(resP.data);
      setCategories(resC.data);
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProd.MaSP) {
        await axios.put(`http://localhost:3000/api/products/${editingProd.MaSP}`, editingProd, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post('http://localhost:3000/api/products', editingProd, { headers: { Authorization: `Bearer ${token}` }});
      }
      setEditingProd(null);
      fetchData();
    } catch(e) { alert('Lưu thất bại'); }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm('Xóa sản phẩm này? Chú ý: Cẩn thận dữ liệu hóa đơn cũ bị mồ côi.')) return;
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      fetchData();
    } catch(e) { alert('Không thể xóa sp (vướng hóa đơn/lô hàng)'); }
  };

  const filteredProducts = products.filter(p => 
    p.TenSP.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(p.MaSP).includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Danh Mục Cửa Hàng</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các sản phẩm và nhóm ngành hàng đang kinh doanh.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm SP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
            />
          </div>
          <button onClick={() => setEditingProd({ TenSP: '', DonGiaBan: '', ThueVAT: 10, MaLoai: categories[0]?.MaLoai || '' })} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-colors flex items-center justify-center">
            <PackagePlus className="w-5 h-5 mr-2" /> Thêm Sản Phẩm
          </button>
        </div>
      </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Mã Vạch</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Tên Sản Phẩm</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Danh Mục</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Giá Bán Lẻ</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Thuế VAT</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(p => (
                <tr key={p.MaSP} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-400">#{String(p.MaSP).padStart(4, '0')}</td>
                  <td className="p-4 font-bold text-slate-800">{p.TenSP}</td>
                  <td className="p-4"><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">{p.LoaiHang?.TenLoai}</span></td>
                  <td className="p-4 font-black text-indigo-600">{p.DonGiaBan.toLocaleString()} ₫</td>
                  <td className="p-4 text-slate-500 font-medium">{p.ThueVAT}%</td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button onClick={() => setEditingProd(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.MaSP)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingProd.MaSP ? 'Sửa' : 'Thêm'} Sản Phẩm</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Tên Sản Phẩm" value={editingProd.TenSP} onChange={e => setEditingProd({...editingProd, TenSP: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select required value={editingProd.MaLoai} onChange={e => setEditingProd({...editingProd, MaLoai: e.target.value})} className="w-full p-3 border-2 rounded-xl">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.MaLoai} value={c.MaLoai}>{c.TenLoai}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Giá Bán Lẻ" value={editingProd.DonGiaBan} onChange={e => setEditingProd({...editingProd, DonGiaBan: e.target.value})} className="w-full p-3 border-2 rounded-xl font-bold text-indigo-600" />
                <input required type="number" placeholder="Thuế VAT (%)" value={editingProd.ThueVAT} onChange={e => setEditingProd({...editingProd, ThueVAT: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setEditingProd(null)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsTab;
