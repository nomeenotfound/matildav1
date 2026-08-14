import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Box, Users, Tag, LogOut, Code } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
    return <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center font-micro tracking-widest text-[#1A1A1A]">authenticating...</div>;
  }

  const NAV_LINKS = [
    { label: 'Analytics', path: '/admin/analytics', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Box },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discounts', path: '/admin/discounts', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#1A1A1A] font-body flex" style={{
      '--bg-admin': '#F4F4F5',
      '--bg-card': '#FFFFFF',
      '--border-admin': '#722F37',
      '--border-admin-subtle': 'rgba(114, 47, 55, 0.15)',
      '--text-admin': '#1A1A1A'
    } as React.CSSProperties}>
      
      {authenticated && location.pathname !== '/admin/login' && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50 shadow-sm">
          <div className="p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--border-admin)] flex items-center justify-center text-white">
              <Code className="w-4 h-4" />
            </div>
            <h1 className="font-display font-bold text-xl lowercase tracking-tighter text-black">matilda.</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 mt-4">
            {NAV_LINKS.map(link => {
              const active = location.pathname.includes(link.path);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-micro uppercase tracking-widest text-[10px] transition-all ${
                    active 
                      ? 'bg-[var(--border-admin)] text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex flex-col">
                <span className="font-display italic text-xs text-gray-900">Duha</span>
                <span className="font-micro text-[9px] text-gray-500 uppercase tracking-widest">Admin</span>
              </div>
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
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}
      
      <main className={`flex-1 ${authenticated && location.pathname !== '/admin/login' ? 'ml-64' : ''}`}>
        <div className="p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
