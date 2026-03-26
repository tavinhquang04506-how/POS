import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus, Search } from 'lucide-react';

const StaffTab = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/staff', { headers: { Authorization: `Bearer ${token}` }});
      setStaff(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/rbac/roles', { headers: { Authorization: `Bearer ${token}` }});
      setRoles(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff.MaNV) {
        await axios.put(`http://localhost:3000/api/staff/${editingStaff.MaNV}`, editingStaff, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post('http://localhost:3000/api/staff', editingStaff, { headers: { Authorization: `Bearer ${token}` }});
      }
      setEditingStaff(null);
      fetchStaff();
    } catch(e) { alert('Lưu nhân viên thất bại'); }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm('Cảnh báo: Nếu NV đã chốt ca/bán hóa đơn, việc xóa có thể crash Data. Nên vô hiệu hóa thay vì Delete. Tiếp tục xóa cứng?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/staff/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      fetchStaff();
    } catch(e) { alert('Không thể xóa nhân viên này!'); }
  };

  const filteredStaff = staff.filter(s => 
    s.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||  
    String(s.MaNV).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in flex flex-col md:flex-row md:justify-between md:items-center p-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hồ Sơ Nhân Sự</h2>
          <p className="text-sm text-slate-500 mt-1">Quản trị tài khoản đăng nhập của Thu Ngân & Quản Lý.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo Tên hoặc Mã NV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
            />
          </div>
          <button onClick={() => setEditingStaff({ HoTen: '', VaiTro: '', MaRole: '', MatKhau: '' })} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center">
            <Plus className="w-5 h-5 mr-1" /> Tuyển Nhân Sự
          </button>
        </div>
      </div>
      
      <div className="bg-transparent mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((s: any) => (
            <div key={s.MaNV} className="bg-white border text-center md:text-left border-slate-100 rounded-3xl shadow-sm p-6 relative group flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingStaff({...s, MatKhau: ''})} className="text-indigo-600 p-1 hover:bg-indigo-50 rounded"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.MaNV)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.HoTen)}&background=${s.GroupRole?.TenRole === 'MANAGER' ? '10b981' : s.GroupRole?.TenRole === 'WAREHOUSE' ? 'f59e0b' : '6366f1'}&color=fff`} alt={s.HoTen} className="w-12 h-12 rounded-full shadow-sm" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{s.HoTen}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                  s.GroupRole?.TenRole === 'MANAGER' ? 'bg-emerald-100 text-emerald-700' : 
                  s.GroupRole?.TenRole === 'WAREHOUSE' ? 'bg-amber-100 text-amber-700' : 
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {s.GroupRole?.TenRole || s.VaiTro || 'CASHIER'}
                </span>
                <p className="text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-100">Login ID/MaNV: {s.MaNV}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingStaff && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editingStaff.MaNV ? 'Cập Nhật' : 'Tuyển Mới'} Nhân Sự</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Họ và Tên" value={editingStaff.HoTen} onChange={e => setEditingStaff({...editingStaff, HoTen: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select required value={editingStaff.MaRole || ''} onChange={e => {
                const selectedRole = roles.find(r => r.MaRole === Number(e.target.value));
                setEditingStaff({...editingStaff, MaRole: Number(e.target.value), VaiTro: selectedRole?.TenRole});
              }} className="w-full p-3 border-2 rounded-xl">
                <option value="">Chọn vai trò...</option>
                {roles.map(r => (
                  <option key={r.MaRole} value={r.MaRole}>{r.MoTa || r.TenRole}</option>
                ))}
              </select>
              <input type="password" required={!editingStaff.MaNV} placeholder={editingStaff.MaNV ? "Mật khẩu mới (bỏ trống để giữ cũ)" : "Mật khẩu đăng nhập"} value={editingStaff.MatKhau} onChange={e => setEditingStaff({...editingStaff, MatKhau: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setEditingStaff(null)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default StaffTab;
