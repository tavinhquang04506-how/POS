import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Lock, Users, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'CUSTOMER'>('STAFF');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'STAFF') {
        const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (response.data.user.role === 'CASHIER') {
          navigate('/pos');
        } else {
          navigate('/dashboard');
        }
      } else {
        const response = await axios.post('http://localhost:3000/api/auth/customer-login', { sdt: username, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Supermarket POS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to access your register or dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100">
          
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              type="button"
              onClick={() => { setActiveTab('STAFF'); setError(''); }} 
              className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-lg ${activeTab === 'STAFF' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <ShieldCheck className="w-4 h-4" /> <span>Nhân viên</span>
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('CUSTOMER'); setError(''); }} 
              className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-lg ${activeTab === 'CUSTOMER' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Users className="w-4 h-4" /> <span>Khách hàng</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">{activeTab === 'STAFF' ? 'Username or Employee ID' : 'Số điện thoại'}</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-slate-500">
              <p>Demo Accounts:</p>
              <p>Manager: admin / 123456</p>
              <p>Cashier: cashier / 123456</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
