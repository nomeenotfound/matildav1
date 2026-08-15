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
export async function fetchPublicProducts(collection?: string, category?: string): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (collection) query.set('collection', collection);
    if (category) query.set('category', category);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`/api/products${queryString}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn('Public products fetch notice:', e);
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

  return fetchPublicProducts();
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
    } catch (e) {
      console.warn('Supabase product save notice:', e);
    }
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
  } catch (e) {
    console.warn('Backend product delete notice:', e);
  }

  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase product delete notice:', e);
    }
  }

  return true;
}

// --- Categories API ---
export async function fetchPublicCategories(): Promise<any[]> {
  let cats: any[] | null = null;

  // 1. Fetch via Express API endpoint
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        cats = data;
      }
    }
  } catch (e) {
    console.warn('Public categories fetch notice:', e);
  }

  // 2. Direct Supabase query fallback (ONLY if API call failed or returned null)
  if (cats === null && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && Array.isArray(data)) {
        cats = data;
      }
    } catch (e) {}
  }

  // 3. LocalStorage fallback (ONLY if API and Supabase both failed)
  if (cats === null) {
    try {
      const saved = localStorage.getItem('matilda_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          cats = parsed;
        }
      }
    } catch (e) {}
  }

  const finalCats = cats || [];

  // Normalize format
  return finalCats.map((c: any, idx: number) => {
    const name = c.name || c.title || 'Category';
    const slug = (c.slug || name.toLowerCase().replace(/\s+/g, '-')).toLowerCase().trim();
    return {
      id: c.id || `cat-${slug}-${idx}`,
      name,
      slug,
      description: c.description || ''
    };
  });
}

export async function saveAdminCategory(category: any, isEdit: boolean): Promise<any> {
  const url = isEdit ? `/api/admin/categories/${encodeURIComponent(category.id)}` : '/api/admin/categories';
  const method = isEdit ? 'PUT' : 'POST';

  const dbCat = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || ''
  };

  // 1. Write to Express API
  try {
    const res = await fetch(url, {
      method,
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(dbCat)
    });
    if (res.ok) {
      const saved = await res.json();
      if (saved) {
        dbCat.id = saved.id || dbCat.id;
      }
    }
  } catch (e) {
    console.warn('Backend category save notice:', e);
  }

  // 2. Write to Supabase if connected
  if (supabase) {
    try {
      await supabase.from('categories').upsert(dbCat);
    } catch (e) {
      console.warn('Supabase category upsert notice:', e);
    }
  }

  return dbCat;
}

export async function deleteAdminCategory(id: string, slug?: string): Promise<boolean> {
  const cleanSlug = slug || id.replace(/^cat-/, '').toLowerCase().trim();
  const query = slug ? `?slug=${encodeURIComponent(slug)}` : '';

  // 1. Express API delete
  try {
    await fetch(`/api/admin/categories/${encodeURIComponent(id)}${query}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {
    console.warn('Backend category delete notice:', e);
  }

  // 2. Supabase delete
  if (supabase) {
    try {
      await supabase.from('categories').delete().or(`id.eq.${id},id.eq.${cleanSlug},slug.eq.${cleanSlug}`);
      await supabase.from('products').update({ category: 'general' }).or(`category.eq.${cleanSlug},category.eq.${id}`);
    } catch (e) {
      console.warn('Supabase category delete notice:', e);
    }
  }

  // 3. Clear from LocalStorage fallback
  try {
    const saved = localStorage.getItem('matilda_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((c: any) => c.id !== id && c.slug !== cleanSlug && c.id !== cleanSlug);
        localStorage.setItem('matilda_categories', JSON.stringify(filtered));
      }
    }
  } catch (e) {}

  return true;
}

export async function resetAdminCategories(): Promise<any[]> {
  try {
    localStorage.removeItem('matilda_categories');
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('categories').delete().neq('id', '___none___');
    } catch (e) {}
  }

  try {
    await fetch('/api/admin/categories/clear-all', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {}

  return [];
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
