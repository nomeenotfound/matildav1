/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CollectionProvider, useCollection } from './context/CollectionContext';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { GlobalBackground } from './components/GlobalBackground';
import { Hero } from './components/Hero';

import { ProductGrid } from './components/ProductGrid';
import { AboutUs } from './components/AboutUs';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutHandoff } from './components/CheckoutHandoff';
import { SayHelloModal } from './components/SayHelloModal';
import { SearchModal } from './components/SearchModal';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderTrackerOverlay } from './components/OrderTrackerOverlay';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/pages/AdminLogin';
import { AdminOrders } from './components/admin/pages/AdminOrders';
import { AdminAnalytics } from './components/admin/pages/AdminAnalytics';

import { AdminProducts } from './components/admin/pages/AdminProducts';
import { AdminSettings } from './components/admin/pages/AdminSettings';
import { AdminCustomers } from './components/admin/pages/AdminCustomers';

import { AdminDiscounts } from './components/admin/pages/AdminDiscounts';

const AppLayout: React.FC = () => {
  const { viewMode } = useCollection();

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen relative font-body selection:bg-[var(--border-main)] selection:text-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Global Background Layer */}
      {!isAdmin && <GlobalBackground />}

      {/* Global Preloader */}
      {!isAdmin && <Preloader />}

      {/* Global Header Navigation Bar */}
      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>
        
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/app/checkout" element={<CheckoutPage />} />
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

      {/* Dynamic Search Modal */}
      {!isAdmin && <SearchModal />}

      {/* Quick View Product Modal */}
      {!isAdmin && <ProductModal />}

      {/* Cart Drawer */}
      {!isAdmin && <CartDrawer />}

      {/* Checkout Handoff Overlay */}
      {!isAdmin && <CheckoutHandoff />}

      {/* Contact Say Hello Modal */}
      {!isAdmin && <SayHelloModal />}
      
      {/* Live Order Tracker */}
      {!isAdmin && <OrderTrackerOverlay />}
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

