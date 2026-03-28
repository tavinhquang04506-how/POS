import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, Star, ShoppingBag, Clock, Trophy } from 'lucide-react';

const CustomerDashboard = () => {
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [profile, setProfile] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    if (token) {
      api.get('/api/customers/me/history').then(res => setHistory(res.data)).catch(console.error);

      api.get('/api/auth/me').then(res => setProfile(res.data)).catch(console.error);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const currentTier = profile.HangThanhVien?.TenHang || 'MEMBER';
  
  const getTierStyle = (tier: string) => {
    const t = tier.toUpperCase();
    if (t.includes('PLATINUM')) return 'bg-gradient-to-r from-slate-800 to-black text-white shadow-xl shadow-slate-900/20';
    if (t.includes('GOLD') || t.includes('VÀNG')) return 'bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-900 shadow-xl shadow-amber-500/20';
    if (t.includes('SILVER') || t.includes('BẠC')) return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 shadow-xl shadow-slate-400/20';
    return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">Supermarket<span className="text-indigo-600">Rewards</span></h1>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-500 hover:text-rose-600 font-bold transition-colors">
          <span className="hidden sm:inline">Đăng Xuất</span>
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Welcome & Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Xin chào, {profile.HoTen}!</h2>
            <p className="text-slate-500 mb-6">Chào mừng trở lại chương trình khách hàng thân thiết.</p>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
              <div className="bg-amber-100 text-amber-600 p-4 rounded-2xl">
                <Star className="w-8 h-8 fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Điểm Tích Lũy</p>
                <div className="text-4xl font-black text-slate-800">{Math.floor(profile.DiemTichLuy || 0)} <span className="text-lg text-slate-400 font-bold">pts</span></div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden ${getTierStyle(currentTier)}`}>
            {/* Glossy overlay */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Hạng Thành Viên</p>
              <h3 className="text-3xl font-black uppercase tracking-wider">{currentTier}</h3>
            </div>
            
            <div className="relative z-10 mt-8">
              <p className="font-mono text-sm opacity-80">ID: {profile.id || profile.MaKH || '---'}</p>
              <p className="font-bold opacity-90">{profile.SDT || '---'}</p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-500" />
              Lịch Sử Mua Hàng
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <p>Bạn chưa có lịch sử mua hàng nào.</p>
              </div>
            ) : (
              history.map((invoice, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">Hóa đơn #{invoice.MaHD}</p>
                      <p className="text-sm text-slate-500 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(invoice.NgayLap).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      <p className="text-lg font-black text-indigo-600">{(invoice.TongTienHang + invoice.TongThueGTGT - invoice.GiamGia).toLocaleString('vi-VN')}đ</p>
                      <p className="text-xs font-bold text-emerald-500 bg-emerald-50 inline-block px-2 py-1 rounded-md mt-1">
                        +{Math.floor((invoice.TongTienHang + invoice.TongThueGTGT - invoice.GiamGia) / 10000)} điểm
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    {invoice.ChiTietHoaDons?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-700 font-medium">{item.SanPham?.TenSP || 'Sản phẩm'} <span className="text-slate-400">x{item.SoLuong}</span></span>
                        <span className="text-slate-600 font-bold">{(item.ThanhTien).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
