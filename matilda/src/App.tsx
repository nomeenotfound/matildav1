/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CollectionProvider, useCollection } from './context/CollectionContext';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { GlobalBackground } from './components/GlobalBackground';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { AboutUs } from './components/AboutUs';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

// Lazy load non-critical and heavy components
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./components/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));
const ProductModal = lazy(() => import('./components/ProductModal').then(m => ({ default: m.ProductModal })));
const SayHelloModal = lazy(() => import('./components/SayHelloModal').then(m => ({ default: m.SayHelloModal })));
const CheckoutHandoff = lazy(() => import('./components/CheckoutHandoff').then(m => ({ default: m.CheckoutHandoff })));

// Lazy load admin module
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./components/admin/pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminOrders = lazy(() => import('./components/admin/pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminAnalytics = lazy(() => import('./components/admin/pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminProducts = lazy(() => import('./components/admin/pages/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('./components/admin/pages/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminCustomers = lazy(() => import('./components/admin/pages/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminDiscounts = lazy(() => import('./components/admin/pages/AdminDiscounts').then(m => ({ default: m.AdminDiscounts })));
const AdminSales = lazy(() => import('./components/admin/pages/AdminSales').then(m => ({ default: m.AdminSales })));

const SuspenseFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center p-8 text-xs font-mono lowercase text-[var(--text-muted)] animate-pulse">
    loading...
  </div>
);

const AppLayout: React.FC = () => {
  const { viewMode } = useCollection();

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // If visiting homepage with ?order=MT-XXXX, redirect directly to the dedicated confirmation page
  const orderQuery = new URLSearchParams(location.search).get('order');
  if (location.pathname === '/' && orderQuery) {
    return <Navigate to={`/order-confirmation/${orderQuery}`} replace />;
  }

  return (
    <div className="min-h-screen relative font-body selection:bg-[var(--border-main)] selection:text-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Global Background Layer */}
      {!isAdmin && <GlobalBackground />}

      {/* Global Preloader */}
      {!isAdmin && <Preloader />}

      {/* Global Header Navigation Bar */}
      {!isAdmin && <Navbar />}

      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="analytics" replace />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="sales" element={<AdminSales />} />
          </Route>
          
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/app/checkout" element={<CheckoutPage />} />
          
          {/* Dedicated Order Confirmation & Live Tracking Pages */}
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/order-success" element={<OrderConfirmationPage />} />
          <Route path="/order" element={<OrderConfirmationPage />} />
          
          <Route path="/" element={
            <>
              {/* Main Page Layout based on viewMode */}
              {viewMode === 'brand' ? (
                <>
                  {/* Main Brand Page: Focused on story & philosophy */}
                  <Hero />
                  <AboutUs />
                </>
              ) : (
                <>
                  {/* Dedicated Shop Catalogue Page */}
                  <ProductGrid />
                </>
              )}

              {/* Footer */}
              <Footer />
            </>
          } />
        </Routes>
      </Suspense>

      {/* Cart Drawer */}
      {!isAdmin && <CartDrawer />}

      {/* Lazy Suspense for Client Overlays */}
      {!isAdmin && (
        <Suspense fallback={null}>
          <SearchModal />
          <ProductModal />
          <CheckoutHandoff />
          <SayHelloModal />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CollectionProvider>
      <AppLayout />
    </CollectionProvider>
  );
}

