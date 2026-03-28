import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { ShoppingCart, LogOut, Search, Trash2, UserCheck, Phone, CreditCard, Wallet, QrCode, Banknote, Coffee, Printer, Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  MaSP: number;
  TenSP: string;
  DonGia: number;
  SoLuong: number;
  ThueVAT: number;
}

interface Customer {
  MaKH: number;
  HoTen: string;
  SDT: string;
  DiemTichLuy: number;
  HangThanhVien?: {
    TenHang: string;
    PhanTramGiamGia: number;
  };
}

const CashierPOS = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  
  // Product Search State
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Custom & Payment State
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerError, setCustomerError] = useState('');
  
  // Fast Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  
  // Shift Management State
  const [shift, setShift] = useState<any>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [tienDauCa, setTienDauCa] = useState('');
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [closedShiftData, setClosedShiftData] = useState<any>(null);

  // Printing State
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [lastRefund, setLastRefund] = useState<any>(null);

  // Return State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnInvoiceId, setReturnInvoiceId] = useState('');
  const [returnInvoiceData, setReturnInvoiceData] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnReason, setReturnReason] = useState('Khách đổi ý');
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkActiveShift();
    fetchAllProducts();
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setAllProducts(res.data);
    } catch (err) { console.error('Failed to fetch products'); }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        handleClear();
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setIsReturnModalOpen(true);
      }
      if (e.key === 'F9' && !isShiftModalOpen && shift && !isReturnModalOpen) {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customer, paymentMethod, shift, isShiftModalOpen]);

  const checkActiveShift = async () => {
    try {
      const res = await api.get('/api/shifts/current');
      if (res.data.shift) {
        setShift(res.data.shift);
        setIsShiftModalOpen(false);
      } else {
        setIsShiftModalOpen(true);
      }
    } catch (err) { setIsShiftModalOpen(true); }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/shifts/open', { TienDauCa: Number(tienDauCa) });
      setShift(res.data);
      setIsShiftModalOpen(false);
    } catch (err) { alert('Cannot open shift'); }
  };

  const handleCloseShift = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn chốt ca làm việc này? Khách hàng sẽ không thể thanh toán tiếp.")) return;
    try {
      const res = await api.post('/api/shifts/close', {});
      setClosedShiftData(res.data);
      setIsClosingShift(true);
      setShift(null);
    } catch (err) { alert('Error closing shift'); }
  };

  const handleClear = () => {
    setCart([]);
    setCustomer(null);
    setPhone('');
    setCustomerError('');
    setIsRegistering(false);
  };

  const addProductToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.MaSP === product.MaSP);
      if (existing) {
        return prev.map(item => item.MaSP === product.MaSP ? { ...item, SoLuong: item.SoLuong + 1 } : item);
      }
      return [...prev, {
        MaSP: product.MaSP,
        TenSP: product.TenSP,
        DonGia: product.DonGiaBan || product.DonGia,
        SoLuong: 1,
        ThueVAT: product.ThueVAT
      }];
    });
  };

  const handleSearchInput = (value: string) => {
    setBarcode(value);
    setSelectedIndex(-1);
    if (value.trim().length > 0) {
      const query = value.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.TenSP.toLowerCase().includes(query) || String(p.MaSP).includes(query)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (product: any) => {
    addProductToCart(product);
    setBarcode('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    barcodeInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuggestions(false);
    const trimmed = barcode.trim();
    if (!trimmed) {
      setBarcode('');
      return;
    }
    try {
      const safeBarcode = encodeURIComponent(trimmed);
      const res = await api.get(`/api/products/${safeBarcode}`);
      const product = res.data;
      if (Array.isArray(product) || !product.MaSP) throw new Error('Barcode không tồn tại hoặc lỗi dữ liệu.');

      addProductToCart(product);
      setBarcode('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setBarcode('');
    }
  };

  const handleCustomerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');
    setIsRegistering(false);
    if (!phone) return;
    try {
      const res = await api.get(`/api/customers/${phone}`);
      setCustomer(res.data);
    } catch (err) {
      setCustomerError('SĐT này chưa đăng ký thành viên.');
      setCustomer(null);
    }
  };

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/customers', { HoTen: newCustomerName, SDT: phone });
      setCustomer(res.data);
      setIsRegistering(false);
      setCustomerError('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi tạo khách hàng');
    }
  };

  const handleRemove = (id: number) => {
    setCart(cart.filter(c => c.MaSP !== id));
  };

  // Math block
  const total = cart.reduce((acc, item) => acc + ((item.DonGia || 0) * item.SoLuong), 0);
  const tax = cart.reduce((acc, item) => acc + (((item.DonGia || 0) * item.SoLuong * (item.ThueVAT || 0)) / 100), 0);
  
  const tierDiscountPct = customer?.HangThanhVien?.PhanTramGiamGia || 0;
  const discountApplied = Math.floor((total * tierDiscountPct) / 100);
  const grandTotal = total + tax - discountApplied;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const reqPayload = {
        items: cart,
        MaKH: customer?.MaKH || null,
        phuongThucThanhToan: paymentMethod
      };
      
      const res = await api.post('/api/checkout', reqPayload);
      
      setLastInvoice({
        id: res.data.MaHD,
        time: new Date().toLocaleString('vi-VN'),
        items: [...cart],
        subtotal: total,
        tax: tax,
        discount: discountApplied,
        tierName: customer?.HangThanhVien?.TenHang,
        total: grandTotal,
        cashier: user.HoTen,
        method: paymentMethod
      });

      // Browser Print Logic
      setTimeout(() => {
        window.print();
        handleClear();
      }, 500);

    } catch (err: any) {
      alert('❌ Lỗi thanh toán: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLookupInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get(`/api/returns/invoice/${returnInvoiceId}`);
      const invData = res.data;
      setReturnInvoiceData(invData);
      
      const phanTramGiam = (invData.GiamGia || 0) / (invData.TongTienHang || 1);

      setReturnItems(invData.ChiTietHoaDons.map((item: any) => ({
        MaSP: item.MaSP,
        TenSP: item.SanPham?.TenSP || ('SP-' + item.MaSP),
        SoLuongTra: 0,
        SoLuongCoTheTra: item.SoLuongCoTheTra,
        DonGiaHoan: Math.round(item.DonGia * (1 - phanTramGiam))
      })));
    } catch (err) {
      alert('Không tìm thấy hóa đơn hoặc hóa đơn không hợp lệ');
    }
  };

  const updateReturnQty = (MaSP: number, delta: number) => {
    setReturnItems(prev => prev.map(item => {
      if (item.MaSP === MaSP) {
        const newQty = Math.max(0, Math.min(item.SoLuongCoTheTra, item.SoLuongTra + delta));
        return { ...item, SoLuongTra: newQty };
      }
      return item;
    }));
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = returnItems.filter(i => i.SoLuongTra > 0);
    if (itemsToReturn.length === 0) return alert('Vui lòng chọn ít nhất 1 sản phẩm để trả!');
    
    try {
      const payload = {
        MaHD: returnInvoiceData.MaHD,
        LyDoTra: returnReason,
        Items: itemsToReturn.map(i => ({ MaSP: i.MaSP, SoLuongTra: i.SoLuongTra, DonGiaHoan: i.DonGiaHoan }))
      };
      
      const res = await api.post('/api/returns', payload);
      
      setLastRefund({
        id: res.data.MaPTH,
        invoiceId: returnInvoiceData.MaHD,
        time: new Date().toLocaleString('vi-VN'),
        items: itemsToReturn,
        totalRefund: res.data.TongTienHoan,
        cashier: user.HoTen,
        reason: returnReason
      });

      setIsReturnModalOpen(false);
      setTimeout(() => {
        window.print();
        setLastRefund(null);
        setReturnInvoiceData(null);
        setReturnInvoiceId('');
      }, 500);

    } catch (err) {
      alert('Lỗi khi trả hàng!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // -------------------------
  // RENDER MODALS
  // -------------------------
  if (isShiftModalOpen) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 fixed inset-0">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95">
          <div className="flex justify-center mb-6"><div className="bg-indigo-100 p-4 rounded-full"><Coffee className="w-10 h-10 text-indigo-600" /></div></div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Mở Ca Làm Việc</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">Vui lòng nhập số tiền mặt có sẵn trong két để bắt đầu ca làm việc của bạn.</p>
          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền đầu ca (VNĐ)</label>
              <div className="relative">
                <input type="number" autoFocus required min="0" value={tienDauCa} onChange={e => setTienDauCa(e.target.value)} className="w-full text-xl font-bold text-indigo-600 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="Ví dụ: 500000" />
                <span className="absolute right-4 top-4 text-slate-400 font-medium">₫</span>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">Bắt đầu Bán Hàng</button>
            <button type="button" onClick={handleLogout} className="w-full text-slate-500 hover:text-slate-800 font-medium py-2">Đăng xuất</button>
          </form>
        </div>
      </div>
    );
  }

  if (isClosingShift && closedShiftData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-50 fixed inset-0">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in">
          <h2 className="text-3xl font-black text-center text-slate-800 mb-8">Báo Cáo Chốt Ca</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Tiền mặt đầu ca:</span>
              <span className="font-bold text-slate-700">{closedShiftData.TienDauCa.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Doanh thu tiền mặt trong ca:</span>
              <span className="font-bold text-emerald-600">+{(closedShiftData.TienCuoiCa - closedShiftData.TienDauCa).toLocaleString()} ₫</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center mt-4 border border-slate-200">
              <span className="text-slate-700 font-semibold">TỔNG PHẢI CÓ:</span>
              <span className="text-2xl font-black text-indigo-600">{closedShiftData.TienCuoiCa.toLocaleString()} ₫</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">Xác nhận & Đăng xuất</button>
        </div>
      </div>
    );
  }

  if (isReturnModalOpen) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 fixed inset-0">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">Đổi/Trả Hàng</h2>
            <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold px-3 py-1 bg-slate-100 rounded-lg">Đóng</button>
          </div>

          {!returnInvoiceData ? (
            <form onSubmit={handleLookupInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nhập mã hóa đơn cần trả (MaHD):</label>
                <input type="number" autoFocus required value={returnInvoiceId} onChange={e => setReturnInvoiceId(e.target.value)} className="w-full text-lg font-bold border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" placeholder="VD: 1024" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg">Tìm kiếm Hóa Đơn</button>
            </form>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                <p><span className="font-semibold text-slate-600">Hóa đơn:</span> #{returnInvoiceData.MaHD}</p>
                <p><span className="font-semibold text-slate-600">Ngày mua:</span> {new Date(returnInvoiceData.NgayLap).toLocaleString('vi-VN')}</p>
                <p><span className="font-semibold text-slate-600">Khách hàng:</span> {returnInvoiceData.KhachHang?.HoTen || 'Khách lẻ'}</p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-center">Có thể trả</th>
                      <th className="p-3 text-center">Trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="p-3 font-medium">{item.TenSP}</td>
                        <td className="p-3 text-right">{item.DonGiaHoan.toLocaleString()} ₫</td>
                        <td className="p-3 text-center text-slate-500">{item.SoLuongCoTheTra}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => updateReturnQty(item.MaSP, -1)} className="bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-lg font-bold text-slate-600">-</button>
                            <span className="font-bold w-4 text-center">{item.SoLuongTra}</span>
                            <button onClick={() => updateReturnQty(item.MaSP, 1)} className="bg-indigo-100 hover:bg-indigo-200 w-8 h-8 rounded-lg font-bold text-indigo-700">+</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do trả hàng:</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-medium">
                  <option>Khách đổi ý</option>
                  <option>Sản phẩm bị lỗi</option>
                  <option>Đổi size/màu</option>
                  <option>Khác</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tổng tiền hoàn trả:</p>
                  <p className="text-2xl font-black text-rose-600">
                    {returnItems.reduce((acc, i) => acc + (i.SoLuongTra * i.DonGiaHoan), 0).toLocaleString()} ₫
                  </p>
                </div>
                <button onClick={handleSubmitReturn} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg">Xác Nhận Hoàn Tiền</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------
  // MAIN UI
  // -------------------------
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 print:bg-white print:h-auto print:block flex-1 overflow-hidden">
      
      {/* 🧾 THERMAL RECEIPT (K80) */}
      <div className="hidden print:block w-[80mm] mx-auto text-black bg-white p-4 font-mono text-sm leading-tight">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">HỆ THỐNG POS PRO</h2>
          <p className="text-xs">Chi nhánh Trung Tâm</p>
          <p className="mt-2 text-xs border-b border-black border-dashed pb-2">Hoá đơn: #{lastInvoice?.id || '---'}<br/>Ngày: {lastInvoice?.time || new Date().toLocaleString()}<br/>Thu Ngân: {lastInvoice?.cashier || user.HoTen}</p>
        </div>
        <table className="w-full mb-2 text-xs border-b border-black border-dashed pb-2">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Tên SP</th>
              <th className="text-right py-1">SL</th>
              <th className="text-right py-1">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {(lastInvoice?.items || cart).map((i: any, idx: number) => (
              <tr key={idx}>
                <td className="py-1 pr-1 truncate max-w-[40mm]">{i.TenSP}</td>
                <td className="py-1 text-right">{i.SoLuong}</td>
                <td className="py-1 text-right">{((i.DonGia || 0) * i.SoLuong).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 text-xs mb-4">
          <div className="flex justify-between"><span>Tổng tiền hàng:</span><span>{(lastInvoice?.subtotal || total).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Thuế VAT:</span><span>{(lastInvoice?.tax || tax).toLocaleString()}</span></div>
          {((lastInvoice?.discount || discountApplied) > 0) && (
             <div className="flex justify-between font-bold"><span>Hạng {lastInvoice?.tierName || 'Thành Viên'}:</span><span>-{(lastInvoice?.discount || discountApplied).toLocaleString()}</span></div>
          )}
          <div className="flex justify-between font-black text-[15px] mt-2 pt-2 border-t border-black border-dashed">
            <span>PHẢI THANH TOÁN:</span><span>{(lastInvoice?.total || grandTotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1"><span>Phương thức:</span><span>{lastInvoice?.method || paymentMethod}</span></div>
        </div>
        <div className="text-center mt-6 text-xs italic"><p>Cảm ơn quý khách!</p><div className="mt-4 break-words">*********************************</div></div>
      </div>

      {/* 📃 REFUND RECEIPT (K80) */}
      <div className="hidden print:block w-[80mm] mx-auto text-black bg-white p-4 font-mono text-sm leading-tight">
        {lastRefund && (
          <>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">HỆ THỐNG POS PRO</h2>
              <p className="text-xs">Chi nhánh Trung Tâm</p>
              <h3 className="text-lg font-bold mt-2 border-y border-black border-dashed py-1 uppercase">Phiếu Trả Hàng</h3>
              <p className="mt-2 text-xs border-b border-black border-dashed pb-2">Phiếu Trả: #{lastRefund.id}<br/>Từ Hóa Đơn: #{lastRefund.invoiceId}<br/>Ngày: {lastRefund.time}<br/>Thu Ngân: {lastRefund.cashier}</p>
            </div>
            <table className="w-full mb-2 text-xs border-b border-black border-dashed pb-2">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-1">Tên SP</th>
                  <th className="text-right py-1">SL T.Về</th>
                  <th className="text-right py-1">T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {lastRefund.items.map((i: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1 pr-1 truncate max-w-[40mm]">{i.TenSP}</td>
                    <td className="py-1 text-right">{i.SoLuongTra}</td>
                    <td className="py-1 text-right">{(i.SoLuongTra * i.DonGiaHoan).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between font-black text-[15px] pt-2">
                <span>TỔNG HOÀN TIỀN:</span><span>{lastRefund.totalRefund.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-1"><span>Lý do:</span><span>{lastRefund.reason}</span></div>
            </div>
            <div className="text-center mt-6 text-xs italic"><p>Chữ ký khách hàng</p><br/><br/><br/></div>
          </>
        )}
      </div>

      {/* 🛒 POS APPLICATION UI */}
      <div className={`flex flex-col h-full print:hidden ${lastRefund ? 'hidden' : ''}`}>
        <header className="bg-indigo-900 text-white p-5 flex justify-between items-center shadow-lg relative z-20">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/30 p-2 rounded-lg"><ShoppingCart className="w-6 h-6 text-indigo-100" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hệ Thống Bán Hàng (POS)</h1>
              <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase mt-0.5">Ca làm việc: {shift ? `#${shift.MaCa}` : 'Chưa mở'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-indigo-950/50 border border-indigo-700/50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-100">Thu ngân: <span className="text-white font-bold">{user.HoTen}</span></span>
            </div>
            <button onClick={() => setIsReturnModalOpen(true)} className="flex items-center space-x-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500 hover:text-white px-4 py-2 rounded-full transition-all">
              <LogOut className="w-4 h-4" /><span className="text-sm font-semibold">Trả Hàng (F4)</span>
            </button>
            <button onClick={handleCloseShift} className="flex items-center space-x-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-full transition-all">
              <LogOut className="w-4 h-4" /><span className="text-sm font-semibold">Chốt Ca Về</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Cart */}
          <div className="w-2/3 flex flex-col p-6 space-y-6 h-full bg-slate-50/50">
            <div className="relative" ref={suggestionsRef}>
              <form onSubmit={handleScan} className="flex relative group">
                <Search className="absolute left-4 top-5 h-6 w-6 text-indigo-400 pointer-events-none" />
                <input 
                  ref={barcodeInputRef} type="text" value={barcode}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  className="w-full pl-14 pr-32 py-5 text-xl bg-white border-2 border-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800"
                  placeholder="Tìm sản phẩm theo tên hoặc mã..." autoFocus
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-8 rounded-xl font-bold hover:bg-indigo-700">Thêm</button>
              </form>
              {/* Product Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-indigo-100 rounded-2xl shadow-2xl shadow-indigo-500/10 z-50 overflow-hidden">
                  {suggestions.map((product, idx) => (
                    <button
                      key={product.MaSP}
                      onClick={() => handleSelectSuggestion(product)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-all ${
                        idx === selectedIndex
                          ? 'bg-indigo-50 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      } ${idx < suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 text-indigo-600 font-bold text-xs px-2.5 py-1 rounded-lg">#{product.MaSP}</div>
                        <span className="font-bold text-slate-800 text-base">{product.TenSP}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-400">Tồn: {product.SoLuongTon}</span>
                        <span className="font-bold text-indigo-600 text-base">{Number(product.DonGiaBan).toLocaleString()} ₫</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {error && <div className="text-red-500 font-medium px-4">{error}</div>}

            <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-1 p-2">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="p-4 font-semibold uppercase text-xs">Sản phẩm</th>
                      <th className="p-4 font-semibold uppercase text-xs text-right">Đơn giá</th>
                      <th className="p-4 font-semibold uppercase text-xs text-center">SL</th>
                      <th className="p-4 font-semibold uppercase text-xs text-right">Thành tiền</th>
                      <th className="p-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/80 group">
                        <td className="p-4"><p className="font-bold text-slate-800">{item.TenSP}</p><p className="text-xs text-slate-400 mt-1">Mã: {item.MaSP}</p></td>
                        <td className="p-4 text-right text-slate-600 font-medium">{Number(item.DonGia || 0).toLocaleString()} ₫</td>
                        <td className="p-4 text-center font-bold text-indigo-600 bg-indigo-50/50 rounded-lg">{item.SoLuong}</td>
                        <td className="p-4 text-right font-bold text-slate-800">{((item.DonGia || 0) * item.SoLuong).toLocaleString()} ₫</td>
                        <td className="p-4 text-right"><button onClick={() => handleRemove(item.MaSP)} className="text-slate-300 hover:text-red-500 p-2.5 rounded-xl"><Trash2 className="w-5 h-5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Payment Dashboard */}
          <div className="w-1/3 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-30">
            {/* Customer Section */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center"><UserCheck className="w-4 h-4 mr-2 text-indigo-500" /> Hệ Thống Thành Viên</h3>
              
              {customer ? (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 shadow-lg shadow-indigo-600/20 text-white relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] opacity-10"><Shield className="w-24 h-24" /></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="font-black text-xl tracking-tight leading-tight">{customer.HoTen}</p>
                      <p className="text-indigo-200 text-sm mt-1">{customer.SDT}</p>
                    </div>
                    <button onClick={() => setCustomer(null)} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm transition-all">Hủy chọn</button>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                    <span className="font-medium text-indigo-100 text-sm">Hạng hiện tại:</span>
                    <span className="font-black bg-amber-400 text-slate-900 px-3 py-1 rounded-md text-sm">{customer.HangThanhVien?.TenHang || 'Thành Viên'}</span>
                  </div>
                  {tierDiscountPct > 0 && (
                    <div className="mt-2 flex justify-between items-center relative z-10">
                      <span className="font-medium text-indigo-100 text-sm">Ưu đãi giảm giá:</span>
                      <span className="font-bold text-emerald-900 bg-emerald-400 px-2 py-0.5 rounded text-sm tracking-wide">-{tierDiscountPct}% TOÀN ĐƠN</span>
                    </div>
                  )}
                </div>
              ) : isRegistering ? (
                <form onSubmit={handleRegisterCustomer} className="bg-white border-2 border-indigo-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-indigo-600 mb-3">TẠO NHANH THÀNH VIÊN</p>
                  <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại..." className="w-full text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-lg px-3 py-2.5 mb-2 focus:outline-none focus:border-indigo-500" />
                  <input type="text" autoFocus required value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Tên khách hàng..." className="w-full text-sm font-bold text-slate-800 border-2 border-slate-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:border-indigo-500" />
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg border border-slate-200">Bỏ qua</button>
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm shadow-indigo-300">Lưu lại</button>
                  </div>
                </form>
              ) : (
                <>
                  <form onSubmit={handleCustomerLookup} className="flex space-x-1">
                    <div className="relative flex-grow">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập SĐT khách hàng..." className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-sm focus:ring-2 focus:ring-indigo-100" />
                    </div>
                    <button type="submit" className="bg-slate-800 text-white px-4 rounded-xl font-bold hover:bg-slate-700 transition-colors">Tìm</button>
                    <button type="button" onClick={() => setIsRegistering(true)} className="bg-indigo-600 text-white px-3 flex flex-col justify-center items-center rounded-xl font-bold hover:bg-indigo-700 transition-colors" title="Tạo Khách Mới">
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                  {customerError && (
                    <div className="mt-3 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3 animate-in fade-in">
                      <span className="text-xs font-medium text-orange-700">{customerError}</span>
                      <button onClick={() => setIsRegistering(true)} className="bg-orange-600 text-white flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-orange-700">
                        <Plus className="w-3 h-3" /><span>Tạo Ngay</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center"><Wallet className="w-4 h-4 mr-2 text-indigo-500" /> Phương thức</h3>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: 'Tiền mặt', icon: Banknote }, { id: 'Thẻ Ghi Nợ', icon: CreditCard }, { id: 'Ví QR', icon: QrCode }].map(method => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`py-3 flex flex-col items-center rounded-xl border ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                    <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold mt-2">{method.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-6 flex-1 flex flex-col justify-end bg-slate-50/50">
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-slate-500 font-medium"><span>Tổng tiền hàng:</span><span className="text-slate-800 font-bold">{total.toLocaleString()} ₫</span></div>
                <div className="flex justify-between text-slate-500 font-medium"><span>Thuế GTGT (VAT):</span><span className="text-slate-800 font-bold">{tax.toLocaleString()} ₫</span></div>
                {discountApplied > 0 && (
                  <div className="flex justify-between font-bold text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg -mx-2 border border-emerald-200/50">
                    <span>Ưu đãi {customer?.HangThanhVien?.TenHang}:</span><span>-{discountApplied.toLocaleString()} ₫</span>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                <div className="flex flex-col mb-5 relative z-10">
                  <span className="text-slate-300 font-medium mb-1 text-sm uppercase tracking-wider">Khách cần thanh toán</span>
                  <span className="text-4xl font-black tracking-tight text-emerald-400">{grandTotal.toLocaleString()} ₫</span>
                </div>
                <button 
                  onClick={handleCheckout} disabled={cart.length === 0}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:shadow-none py-4 rounded-xl text-lg font-bold shadow-[0_8px_20px_-4px_rgba(79,70,229,0.5)] active:scale-95 transition-all relative z-10"
                >
                  <Printer className="w-5 h-5 mr-2" /><span>In hoá đơn K80 & Bán</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierPOS;
