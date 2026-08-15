import { supabase } from './supabase';

export function getAdminToken(): string {
  return localStorage.getItem('admin_token') || 'matilda_auth_ok';
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// --- Orders API ---
export async function fetchAllOrders(): Promise<any[]> {
  let ordersMap = new Map<string, any>();

  // 1. Fetch from Express Backend API
  try {
    const res = await fetch('/api/admin/orders', {
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(order => {
          const key = order.order_number || order.id;
          if (key) ordersMap.set(key, order);
        });
      }
    }
  } catch (err) {
    console.warn('API admin orders fetch notice:', err);
  }

  // 2. Fetch directly from Supabase if available
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        data.forEach(order => {
          const key = order.order_number || order.id;
          if (key && !ordersMap.has(key)) {
            ordersMap.set(key, order);
          }
        });
      }
    } catch (err) {
      console.warn('Supabase orders fetch notice:', err);
    }
  }

  // 3. Fallback / Merge from LocalStorage
  try {
    const localStr = localStorage.getItem('matilda_local_orders');
    if (localStr) {
      const localArr = JSON.parse(localStr);
      if (Array.isArray(localArr)) {
        localArr.forEach((item: any) => {
          const key = item.order_number || item.id;
          if (key && !ordersMap.has(key)) {
            ordersMap.set(key, item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('LocalStorage orders merge notice:', err);
  }

  // Return sorted by created_at descending
  return Array.from(ordersMap.values()).sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });
}

export async function updateOrderStatus(id: string, status: string, additionalData: any = {}): Promise<any> {
  const updateData = { status, ...additionalData, updated_at: new Date().toISOString() };

  // 1. Express Backend
  try {
    await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updateData)
    });
  } catch (e) {
    console.warn('Backend update status notice:', e);
  }

  // 2. Supabase
  if (supabase) {
    try {
      await supabase.from('orders').update(updateData).eq('id', id);
      await supabase.from('orders').update(updateData).eq('order_number', id);
    } catch (e) {
      console.warn('Supabase update status notice:', e);
    }
  }

  // 3. LocalStorage
  try {
    const localStr = localStorage.getItem('matilda_local_orders');
    if (localStr) {
      let localArr = JSON.parse(localStr);
      if (Array.isArray(localArr)) {
        localArr = localArr.map((o: any) => (o.id === id || o.order_number === id) ? { ...o, ...updateData } : o);
        localStorage.setItem('matilda_local_orders', JSON.stringify(localArr));
      }
    }
  } catch (e) {}

  return updateData;
}

export async function deleteOrderRecord(id: string): Promise<boolean> {
  // 1. Express Backend
  try {
    await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {
    console.warn('Backend delete order notice:', e);
  }

  // 2. Supabase
  if (supabase) {
    try {
      await supabase.from('orders').delete().eq('id', id);
      await supabase.from('orders').delete().eq('order_number', id);
    } catch (e) {
      console.warn('Supabase delete order notice:', e);
    }
  }

  // 3. LocalStorage
  try {
    const localStr = localStorage.getItem('matilda_local_orders');
    if (localStr) {
      let localArr = JSON.parse(localStr);
      if (Array.isArray(localArr)) {
        localArr = localArr.filter((o: any) => o.id !== id && o.order_number !== id);
        localStorage.setItem('matilda_local_orders', JSON.stringify(localArr));
      }
    }
  } catch (e) {}

  return true;
}

// --- Analytics API ---
export async function fetchAnalyticsData(): Promise<any> {
  try {
    const res = await fetch('/api/admin/analytics', {
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Analytics API notice:', e);
  }

  // Fallback calculation from orders
  const orders = await fetchAllOrders();
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
  const grossRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const aov = paidOrders.length ? Math.round(grossRevenue / paidOrders.length) : 0;

  const recentOrdersMap: Record<string, number> = {};
  paidOrders.forEach((o: any) => {
    const date = new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    recentOrdersMap[date] = (recentOrdersMap[date] || 0) + Number(o.total_amount || 0);
  });

  const recentOrders = Object.keys(recentOrdersMap).map(date => ({
    date,
    revenue: recentOrdersMap[date]
  })).slice(-7);

  return {
    grossRevenue,
    totalPaidOrders: paidOrders.length,
    aov,
    recentOrders,
    latestTransactions: orders.slice(0, 15)
  };
}

// --- Products API ---
export async function fetchAdminProducts(): Promise<any[]> {
  try {
    const res = await fetch('/api/admin/products', {
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('API products fetch notice:', e);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (e) {}
  }

  return [];
}

export async function saveAdminProduct(prod: any, isEdit: boolean): Promise<any> {
  const url = isEdit ? `/api/admin/products/${encodeURIComponent(prod.id)}` : '/api/admin/products';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(prod)
    });
    if (res.ok) {
      const saved = await res.json();
      if (saved) return saved;
    }
  } catch (e) {
    console.warn('Backend product save notice:', e);
  }

  if (supabase) {
    try {
      if (isEdit) {
        await supabase.from('products').update(prod).eq('id', prod.id);
      } else {
        await supabase.from('products').insert(prod);
      }
    } catch (e) {}
  }

  return prod;
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  try {
    await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {}
  }

  return true;
}

// --- Customers API ---
export async function fetchAdminCustomers(): Promise<any[]> {
  try {
    const res = await fetch('/api/admin/customers', {
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}

  if (supabase) {
    try {
      const { data } = await supabase.from('customers').select('*').order('last_order_at', { ascending: false });
      if (data) return data;
    } catch (e) {}
  }

  return [];
}

export async function toggleCustomerBlacklist(phone: string): Promise<any> {
  try {
    const res = await fetch(`/api/admin/customers/${encodeURIComponent(phone)}/toggle-blacklist`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  if (supabase) {
    try {
      const { data: customer } = await supabase.from('customers').select('is_blacklisted').eq('phone', phone).single();
      if (customer) {
        const { data } = await supabase.from('customers').update({ is_blacklisted: !customer.is_blacklisted }).eq('phone', phone).select().single();
        return data;
      }
    } catch (e) {}
  }

  return null;
}
