import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Box, Users, Tag, LogOut, Code, Menu, X } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/admin/login') {
      setAuthenticated(false);
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      navigate('/admin/login');
    }
  }, [location.pathname, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (authenticated === null && location.pathname !== '/admin/login') {
    return <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center font-micro tracking-widest text-[#1A1A1A]">authenticating...</div>;
  }

  const NAV_LINKS = [
    { label: 'Dashboard', path: '/admin/analytics', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Box },
    { label: 'Categories', path: '/admin/categories', icon: Menu },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Promo Codes', path: '/admin/discounts', icon: Tag },
    { label: 'Sales & Banners', path: '/admin/sales', icon: Tag },
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
        <>
          {/* Mobile Header Overlay */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--border-admin)] flex items-center justify-center text-white">
                <Code className="w-3 h-3" />
              </div>
              <h1 className="font-display font-bold text-lg lowercase tracking-tighter text-black">matilda.</h1>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-gray-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Backdrop for mobile menu */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16" 
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 shadow-sm transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } lg:top-0 top-16`}>
            <div className="hidden lg:flex p-8 border-b border-gray-100 items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--border-admin)] flex items-center justify-center text-white">
                <Code className="w-4 h-4" />
              </div>
              <h1 className="font-display font-bold text-xl lowercase tracking-tighter text-black">matilda.</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto">
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
            
            <div className="p-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--border-admin)]/5 border border-[var(--border-admin)]/10 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--border-admin)] flex items-center justify-center text-white font-display font-bold text-sm shadow-inner">
                    D
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-sm text-gray-900 tracking-tight">Hello, Duha.</span>
                    <span className="font-micro text-[9px] text-[var(--border-admin)] uppercase tracking-widest font-semibold">Store Admin</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('admin_token');
                    setAuthenticated(false);
                    navigate('/admin/login');
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
      
      <main className={`flex-1 min-w-0 overflow-x-hidden ${authenticated && location.pathname !== '/admin/login' ? 'lg:ml-64 pt-16 lg:pt-0' : ''}`}>
        <div className="p-4 sm:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
