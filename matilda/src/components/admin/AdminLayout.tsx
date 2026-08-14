import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check auth
    if (location.pathname === '/admin/login') {
      setAuthenticated(false);
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/auth/me', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    })
      .then(res => {
        if (res.ok) setAuthenticated(true);
        else {
          setAuthenticated(false);
          navigate('/admin/login');
        }
      })
      .catch(() => {
        setAuthenticated(false);
        navigate('/admin/login');
      });
  }, [location.pathname, navigate]);

  if (authenticated === null && location.pathname !== '/admin/login') {
    return <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center font-micro tracking-widest text-[#1A1A1A]">authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-body" style={{
      '--bg-admin': '#FAFAF7',
      '--bg-card': '#FFFFFF',
      '--border-admin': '#722F37',
      '--border-admin-subtle': 'rgba(114, 47, 55, 0.15)',
      '--text-admin': '#1A1A1A'
    } as React.CSSProperties}>
      
      {authenticated && location.pathname !== '/admin/login' && (
        <nav className="border-b border-[var(--border-admin)] bg-[var(--bg-card)] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <h1 className="font-display font-bold text-xl lowercase tracking-tighter text-[var(--border-admin)]">matilda suite</h1>
            <div className="flex items-center gap-6 font-micro uppercase tracking-widest text-[10px]">
              <Link to="/admin/orders" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('orders') ? 'text-[var(--border-admin)] font-bold' : ''}`}>orders</Link>
              <Link to="/admin/products" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('products') ? 'text-[var(--border-admin)] font-bold' : ''}`}>products</Link>
              <Link to="/admin/analytics" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('analytics') ? 'text-[var(--border-admin)] font-bold' : ''}`}>analytics</Link>
              <Link to="/admin/settings" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('settings') ? 'text-[var(--border-admin)] font-bold' : ''}`}>settings</Link>
              <Link to="/admin/customers" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('customers') ? 'text-[var(--border-admin)] font-bold' : ''}`}>crm</Link>
              <Link to="/admin/discounts" className={`hover:text-[var(--border-admin)] ${location.pathname.includes('discounts') ? 'text-[var(--border-admin)] font-bold' : ''}`}>promos</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-display italic text-[var(--border-admin)]">Hello, Duha..</span>
            <button 
              onClick={() => {
                const token = localStorage.getItem('admin_token');
                fetch('/api/admin/auth/logout', { 
                  method: 'POST',
                  headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                }).then(() => {
                  localStorage.removeItem('admin_token');
                  setAuthenticated(false);
                  navigate('/admin/login');
                });
              }}
              className="font-micro uppercase tracking-widest text-[10px] text-[var(--border-admin)] border border-[var(--border-admin)] px-4 py-2 rounded-full hover:bg-[var(--border-admin)] hover:text-white transition-colors shadow-sm"
            >
              logout
            </button>
          </div>
        </nav>
      )}

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};
