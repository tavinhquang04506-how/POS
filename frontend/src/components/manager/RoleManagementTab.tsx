import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Check } from 'lucide-react';

const RoleManagementTab = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [activeRole, setActiveRole] = useState<any>(null);
  const [localPerms, setLocalPerms] = useState<number[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roleRes, permRes] = await Promise.all([
        axios.get('http://localhost:3000/api/rbac/roles', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('http://localhost:3000/api/rbac/permissions', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setRoles(roleRes.data);
      setAllPermissions(permRes.data);
      if (roleRes.data.length > 0 && !activeRole) {
        setActiveRole(roleRes.data[0]);
        setLocalPerms(roleRes.data[0].Role_Permissions.map((rp: any) => rp.MaQuyen));
      }
    } catch (e) {
      console.error('Failed to fetch ACL matrix');
    }
  };

  const handleRoleSelect = (role: any) => {
    setActiveRole(role);
    setLocalPerms(role.Role_Permissions.map((rp: any) => rp.MaQuyen));
  };

  const togglePermission = (pId: number) => {
    if (localPerms.includes(pId)) {
      setLocalPerms(localPerms.filter(id => id !== pId));
    } else {
      setLocalPerms([...localPerms, pId]);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/api/rbac/roles/${activeRole.MaRole}/permissions`, 
        { permissions: localPerms },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert('Đã cập nhật phân quyền thành công! Người dùng liên quan sẽ nhận quyền mới ở lần Login kế tiếp.');
      fetchData(); 
    } catch (e) {
      alert('Lỗi cập nhật phân quyền');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center"><ShieldAlert className="w-6 h-6 mr-2 text-indigo-600"/> Phân Quyền Matrix (ACL)</h2>
          <p className="text-sm text-slate-500 mt-1">Cấp quyền hạn truy cập module động cho từng chức danh.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4 space-y-3">
          {roles.map(r => (
            <button 
              key={r.MaRole}
              onClick={() => handleRoleSelect(r)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeRole?.MaRole === r.MaRole ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
            >
              <h3 className="font-bold text-slate-800">{r.TenRole}</h3>
              <p className="text-xs text-slate-500 mt-1">{r.MoTa}</p>
            </button>
          ))}
        </div>

        <div className="w-full md:w-3/4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          {activeRole && (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-lg">Quyền của <span className="text-indigo-600">{activeRole.TenRole}</span></h3>
                <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg shadow-indigo-500/30">
                  <Check className="w-4 h-4 mr-2" /> Lưu Cập Nhật
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allPermissions.map(p => {
                  const isChecked = localPerms.includes(p.MaQuyen);
                  return (
                    <label key={p.MaQuyen} className={`flex items-start p-3 rounded-xl border-2 cursor-pointer transition-colors ${isChecked ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}>
                      <div className="flex-shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => togglePermission(p.MaQuyen)}
                          className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-bold ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>{p.MoTa}</p>
                        <p className="text-xs font-mono text-slate-400 mt-1">{p.TenQuyen}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagementTab;
