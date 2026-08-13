/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CollectionProvider, useCollection } from './context/CollectionContext';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { AboutUs } from './components/AboutUs';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutHandoff } from './components/CheckoutHandoff';
import { SayHelloModal } from './components/SayHelloModal';
import { SearchModal } from './components/SearchModal';
import { ManagementPanel } from './components/ManagementPanel';

const AppLayout: React.FC = () => {
  const { viewMode } = useCollection();

  return (
    <div className="min-h-screen relative font-body selection:bg-[var(--border-main)] selection:text-[var(--bg-primary)]">
      {/* Global Preloader */}
      <Preloader />

      {/* Global Header Navigation Bar */}
      <Navbar />

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

      {/* DAPMAT Management Panel (Triggered by typing 'DAPMAT' or footer button) */}
      <ManagementPanel />

      {/* Dynamic Search Modal */}
      <SearchModal />

      {/* Quick View Product Modal */}
      <ProductModal />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Handoff Overlay */}
      <CheckoutHandoff />

      {/* Contact Say Hello Modal */}
      <SayHelloModal />
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

