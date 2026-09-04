import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCollection } from '../context/CollectionContext';
import { ShoppingBag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGoogleFirestore } from '../lib/googleDatabase';
import { doc, getDoc } from 'firebase/firestore';
import { OrderStatusPanel } from './OrderStatusPanel';

export const Navbar: React.FC = () => {
  const {
    openBrand,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
  } = useCollection();
  
  const location = useLocation();
  const isCheckout = location.pathname === '/app/checkout' || 
    location.pathname === '/checkout' || 
    location.pathname.startsWith('/order-confirmation') || 
    location.pathname.startsWith('/order-success') || 
    location.pathname.startsWith('/order');

  const [saleActive, setSaleActive] = useState(false);
  const [saleText, setSaleText] = useState('');

  useEffect(() => {
    const loadStoreSettings = async () => {
      // 1. Try Express Settings API
      try {
        const res = await fetch('/api/store/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings.sale_active === 'true' || settings.sale_active === true) {
            setSaleActive(true);
            setSaleText(settings.sale_text || 'GLOBAL SALE ACTIVE');
            return;
          }
        }
      } catch (e) {}

      // 2. Try Google Firestore
      try {
        const db = getGoogleFirestore();
        if (db) {
          const snap = await getDoc(doc(db, 'store_settings', 'sale'));
          if (snap.exists()) {
            const data = snap.data();
            if (data?.sale_active === 'true' || data?.sale_active === true) {
              setSaleActive(true);
              setSaleText(data.sale_text || 'GLOBAL SALE ACTIVE');
              return;
            }
          }
        }
      } catch (e) {}

      // 3. Try LocalStorage
      try {
        const localSettings = localStorage.getItem('matilda_store_settings');
        if (localSettings) {
          const d = JSON.parse(localSettings);
          if (d.sale_active === 'true' || d.sale_active === true) {
            setSaleActive(true);
            setSaleText(d.sale_text || 'GLOBAL SALE ACTIVE');
          }
        }
      } catch (e) {}
    };

    loadStoreSettings();
  }, []);

  return (
    <>
      {/* Global Sale Banner */}
      <AnimatePresence>
        {saleActive && !isCheckout && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sticky top-0 left-0 right-0 w-full bg-[var(--border-maroon)] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest py-2 px-4 text-center z-30 shadow-sm pointer-events-auto"
          >
            {saleText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header, Floating Desktop Buttons */}
      <header className={`sticky md:fixed ${saleActive && !isCheckout ? 'md:top-8' : 'top-0'} left-0 right-0 z-40 w-full transition-all duration-300 md:p-6 pointer-events-none`}>
        <div className="w-full h-14 sm:h-16 md:h-auto backdrop-blur-xl bg-[var(--bg-primary)]/50 md:backdrop-blur-none md:bg-transparent border-b border-[var(--border-main)]/10 md:border-none shadow-[0_4px_30px_rgba(0,0,0,0.03)] md:shadow-none flex items-center justify-between px-3 sm:px-6 md:px-0 gap-2 pointer-events-auto">
          
          {/* Left Section: Brand Logo (mobile) & Really Small Order Panel (top-left of page) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={openBrand}
              className="font-matilda text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--border-maroon)] hover:opacity-90 transition-opacity cursor-pointer md:hidden mr-1"
            >
              matilda
            </motion.button>
            {!isCheckout && <OrderStatusPanel />}
          </div>

          {/* Right Section: Search & Bag */}
          {!isCheckout && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-full bg-[var(--card-bg)]/80 border border-[var(--border-main)]/30 hover:border-[var(--border-maroon)]/50 text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
                title="Search products"
              >
                <Search className="w-3.5 h-3.5 text-[var(--border-maroon)]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--border-maroon)] text-white text-xs font-bold hover:bg-[var(--text-dominant)] transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="lowercase">bag ({cartCount})</span>
              </motion.button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

