import React, { useState } from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import api from '../../api';

const TiersTab = ({ tiers, fetchTiers }: { tiers: any[], fetchTiers: () => void }) => {
  const [editingTier, setEditingTier] = useState<any>(null);
  const token = localStorage.getItem('token');

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTier.MaHang) {
        await api.put(`/api/tiers/${editingTier.MaHang}`, editingTier);
      } else {
        await api.post('/api/tiers', editingTier);
      }
      setEditingTier(null);
      fetchTiers();
    } catch(e) { alert('Lưu hạng thất bại'); }
  };

  const handleDeleteTier = async (id: number) => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa hạng này?')) return;
    try {
      await api.delete(`/api/tiers/${id}`);
      fetchTiers();
    } catch(e) { alert('Xóa hạng thất bại'); }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cấu Hình Hạng Thành Viên</h2>
            <p className="text-sm text-slate-500 mt-1">Định nghĩa phần trăm giảm giá tự động quét khi tính tiền.</p>
          </div>
          <button onClick={() => setEditingTier({ TenHang: '', MinDiem: 0, PhanTramGiamGia: 0 })} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-200 active:scale-95 transition-all">
            <Plus className="w-5 h-5 mr-1" /> Thêm Hạng Mới
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map(tier => (
            <div key={tier.MaHang} className="border-2 border-slate-100 rounded-2xl p-6 relative group hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-slate-50">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingTier(tier)} className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-100"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteTier(tier.MaHang)} className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">{tier.TenHang}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Yêu cầu điểm:</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">&ge; {tier.MinDiem} điểm</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Giảm giá Bill:</span>
                  <span className="font-black text-emerald-600 text-xl">{tier.PhanTramGiamGia}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleSaveTier} className="space-y-5">
              <input required type="text" value={editingTier.TenHang} onChange={e => setEditingTier({...editingTier, TenHang: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4" placeholder="Tên Hạng (VD: Bạc)" />
              <input required min="0" type="number" value={editingTier.MinDiem} onChange={e => setEditingTier({...editingTier, MinDiem: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4" placeholder="Min Điểm" />
              <input required min="0" max="100" type="number" value={editingTier.PhanTramGiamGia} onChange={e => setEditingTier({...editingTier, PhanTramGiamGia: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl mb-4" placeholder="% Giảm" />
              <div className="flex space-x-3">
                <button type="button" onClick={() => setEditingTier(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default TiersTab;
