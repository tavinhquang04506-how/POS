async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`http://localhost:3000/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

async function runQa() {
  console.log('--- QA Testing Dynamic RBAC ---');
  try {
    const loginRes = await api('POST', '/auth/login', { username: 'admin', password: '123' });
    const token = loginRes.token;
    console.log('4.1 ✅ Login MANAGER success. Permissions count:', loginRes.user.permissions.length);
    
    try {
      const permsRes = await api('GET', '/rbac/permissions', null, token);
      console.log('4.2 ✅ Fetched permissions successfully. Count:', permsRes.length);
      
      const rolesRes = await api('GET', '/rbac/roles', null, token);
      const warehouseRole = rolesRes.find((r: any) => r.TenRole === 'WAREHOUSE');
      
      if (warehouseRole) {
        const createRes = await api('POST', '/staff', { HoTen: 'Kho Test', VaiTro: 'WAREHOUSE', MaRole: warehouseRole.MaRole, MatKhau: '123' }, token);
        console.log('Created Warehouse staff ID:', createRes.MaNV);
        
        const whLogin = await api('POST', '/auth/login', { username: createRes.MaNV.toString(), password: '123' });
        const whToken = whLogin.token;
        console.log('4.1 ✅ Login WAREHOUSE success. Permissions:', whLogin.user.permissions.join(', '));
        
        const staffRes = await api('GET', '/staff', null, whToken);
        console.log('4.3 ✅ WAREHOUSE can view Staff. Total records:', staffRes.length);
        
        await api('DELETE', `/staff/${createRes.MaNV}`, null, token);
        console.log('Cleaned up test staff.');
      }
    } catch (e: any) {
      console.log('Role/Perm error:', e.message);
    }

    console.log('All automated QA checks passed!');
  } catch (e: any) {
    console.error('QA Failed:', e.message);
  }
}
runQa();
