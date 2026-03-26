import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CashierPOS from './pages/CashierPOS';
import ManagerDashboard from './pages/ManagerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const token = localStorage.getItem('token');
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    localStorage.removeItem('user');
    user = {};
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'WAREHOUSE') return <Navigate to="/dashboard" replace />;
    if (user.role === 'MANAGER' || user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
    if (user.role === 'CASHIER') return <Navigate to="/pos" replace />;
    if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/pos" element={
          <PrivateRoute allowedRoles={['CASHIER', 'MANAGER']}>
            <CashierPOS />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/dashboard/:tab" element={
          <PrivateRoute allowedRoles={['MANAGER', 'WAREHOUSE', 'ADMIN']}>
             <ManagerDashboard />
          </PrivateRoute>
        } />

        <Route path="/customer" element={
          <PrivateRoute allowedRoles={['CUSTOMER']}>
             <CustomerDashboard />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
