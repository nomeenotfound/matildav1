import React from 'react';
import { useCollection } from '../context/CollectionContext';
import { ShoppingBag, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    openBrand,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
  } = useCollection();

  return (
    <>
      {/* Mobile Header, Floating Desktop Buttons */}
      <header className="sticky md:fixed top-0 left-0 right-0 md:left-auto z-40 w-full md:w-auto transition-all duration-300 md:p-6 pointer-events-none md:pointer-events-auto">
        <div className="w-full h-14 sm:h-16 md:h-auto backdrop-blur-xl bg-[var(--bg-primary)]/50 md:backdrop-blur-none md:bg-transparent border-b border-[var(--border-main)]/10 md:border-none shadow-[0_4px_30px_rgba(0,0,0,0.03)] md:shadow-none flex items-center justify-between md:justify-end px-3 sm:px-6 md:px-0 gap-2 pointer-events-auto">
          
          {/* Left Aligned Brand Logo - Hidden on Desktop */}
          <div className="flex items-center justify-start flex-1 md:hidden">
            <button
              onClick={openBrand}
              className="font-matilda text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--border-maroon)] hover:opacity-90 transition-opacity"
            >
              matilda
            </button>
          </div>

          {/* Right Section: Search & Bag */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-full bg-[var(--card-bg)]/80 border border-[var(--border-main)]/30 hover:border-[var(--border-maroon)]/50 text-[var(--text-primary)] transition-all shadow-2xs active:scale-95"
              title="Search products"
            >
              <Search className="w-3.5 h-3.5 text-[var(--border-maroon)]" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--border-maroon)] text-white text-xs font-bold hover:bg-[var(--text-dominant)] active:scale-95 transition-all shadow-2xs shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="lowercase">bag ({cartCount})</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
