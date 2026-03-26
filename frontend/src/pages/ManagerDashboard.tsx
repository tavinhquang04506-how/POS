import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Activity, BarChart3, Package, Truck, Layers, Users, Star, Clock, ShieldCheck, RotateCcw } from 'lucide-react';

import OverviewTab from '../components/manager/OverviewTab';
import RevenueTab from '../components/manager/RevenueTab';
import InventoryTab from '../components/manager/InventoryTab';
import ReceiveTab from '../components/manager/ReceiveTab';
import ProductsTab from '../components/manager/ProductsTab';
import CustomersTab from '../components/manager/CustomersTab';
import TiersTab from '../components/manager/TiersTab';
import ShiftsTab from '../components/manager/ShiftsTab';
import ReturnHistoryTab from '../components/manager/ReturnHistoryTab';
import StaffTab from '../components/manager/StaffTab';
import RoleManagementTab from '../components/manager/RoleManagementTab';

const SIDEBAR_MENU = [
  { id: 'overview', icon: Activity, label: 'Tổng Quan (KPI)' },
  { id: 'revenue', icon: BarChart3, label: 'Báo Cáo Doanh Thu' },
  { id: 'inventory', icon: Package, label: 'Tồn Kho & FEFO' },
  { id: 'receive', icon: Truck, label: 'Nhập Hàng (PO)' },
  { id: 'products', icon: Layers, label: 'Danh Mục Cửa Hàng' },
  { id: 'customers', icon: Users, label: 'Khách Hội Viên' },
  { id: 'tiers', icon: Star, label: 'Chiến Dịch Hạng' },
  { id: 'shifts', icon: Clock, label: 'Ca Làm Việc' },
  { id: 'returns', icon: RotateCcw, label: 'Lịch Sử Đổi Trả' },
  { id: 'staff', icon: Users, label: 'Nhân Sự Quản Lý' },
  { id: 'rbac', icon: ShieldCheck, label: 'Phân Quyền (ACL)' },
];

const menuPermissions: Record<string, string> = {
  overview: 'VIEW_OVERVIEW',
  revenue: 'VIEW_REVENUE',
  inventory: 'VIEW_INVENTORY',
  receive: 'EDIT_INVENTORY',
  products: 'VIEW_PRODUCTS',
  customers: 'VIEW_CUSTOMERS',
  tiers: 'VIEW_TIERS',
  shifts: 'VIEW_SHIFTS',
  returns: 'VIEW_RETURNS',
  staff: 'VIEW_STAFF',
  rbac: 'EDIT_STAFF', 
};

const ManagerDashboard = () => {
  const { tab } = useParams<{ tab: string }>();
  const activeTab = tab || 'overview';
  const [products, setProducts] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState({ lowStockCount: 0, expiringCount: 0 });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch common data that might be needed across tabs
    if (token) {
      axios.get('http://localhost:3000/api/products', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProducts(res.data)).catch(console.error);
      axios.get('http://localhost:3000/api/tiers', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTiers(res.data)).catch(console.error);
      axios.get('http://localhost:3000/api/inventory/alerts', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setAlerts(res.data)).catch(console.error);
    }
  }, [token, activeTab]); // Refresh slightly on tab change for simplicity

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
    }
    try {
      const res = await axios.put('http://localhost:3000/api/auth/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMsg({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMsg({ type: '', text: '' });
      }, 1500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Đổi mật khẩu thất bại' });
    }
  };

  const filteredMenu = SIDEBAR_MENU.filter(item => {
    if (!user.permissions) return true; // fallback
    const reqPerm = menuPermissions[item.id];
    return reqPerm ? user.permissions.includes(reqPerm) : true;
  });

  useEffect(() => {
    if (filteredMenu.length > 0 && !filteredMenu.find(m => m.id === activeTab)) {
      navigate(`/dashboard/${filteredMenu[0].id}`, { replace: true });
    }
  }, [user.permissions, activeTab, filteredMenu.length, navigate]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 flex items-center space-x-3 mb-4">
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">Supermarket<br /><span className="text-emerald-400">Control Center</span></h1>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col space-y-3 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <img src={`https://ui-avatars.com/api/?name=${user.HoTen}&background=10b981&color=fff`} alt="Admin" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-sm font-bold">{user.HoTen}</p>
                <p className="text-xs text-slate-400 font-mono">ID: {user.MaNV} | Manager</p>
              </div>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full text-xs font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition-colors"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4">Modules Quản Trị</p>
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.id}`)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.id === 'inventory' && (alerts.lowStockCount > 0 || alerts.expiringCount > 0) && (
                <div className="flex space-x-1.5 items-center">
                  {alerts.lowStockCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title={`${alerts.lowStockCount} SP tồn kho thấp`} />}
                  {alerts.expiringCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" title={`${alerts.expiringCount} Lô hàng sắp hết hạn`} />}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 px-4 py-3 rounded-xl font-bold transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Dynamic header background glow */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-indigo-600 opacity-5 blur-3xl pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-8 relative z-10 w-full max-w-7xl mx-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'receive' && <ReceiveTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'tiers' && <TiersTab tiers={tiers} fetchTiers={() => {
            axios.get('http://localhost:3000/api/tiers', { headers: { Authorization: `Bearer ${token}` } }).then(res => setTiers(res.data))
          }} />}
          {activeTab === 'shifts' && <ShiftsTab />}
          {activeTab === 'returns' && <ReturnHistoryTab />}
          {activeTab === 'staff' && <StaffTab />}
          {activeTab === 'rbac' && <RoleManagementTab />}
        </div>
      </main>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Đổi Mật Khẩu</h3>

            {passwordMsg.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${passwordMsg.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu cũ</label>
                <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors">
                  Hủy
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
