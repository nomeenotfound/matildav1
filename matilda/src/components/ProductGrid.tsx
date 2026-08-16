import React, { useState, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import { Product } from '../types';
import { ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { collection, openProductModal, products, categories, openBrand } = useCollection();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pCol = (p.collection || 'women').toLowerCase();
      const targetCol = (collection || 'women').toLowerCase();
      const matchesCollection = pCol === targetCol || pCol === 'both' || pCol === 'all' || targetCol === 'all';

      const pCat = (p.category || '').toLowerCase().trim();
      const actCat = (activeCategory || 'all').toLowerCase().trim();
      const selectedCatObj = categories.find(c => c.slug?.toLowerCase() === actCat || c.id?.toLowerCase() === actCat || c.name?.toLowerCase() === actCat);
      
      const matchesCategory = actCat === 'all' || pCat === actCat || (
        selectedCatObj && (
          pCat === selectedCatObj.slug?.toLowerCase() || 
          pCat === selectedCatObj.name?.toLowerCase() || 
          pCat === selectedCatObj.id?.toLowerCase()
        )
      );

      return matchesCollection && matchesCategory;
    });
  }, [products, collection, activeCategory, categories]);

  // Dynamic filter tabs based on categories list + 'all'
  const filterTabs = useMemo(() => [
    { id: 'all', name: 'All Items', slug: 'all' },
    ...categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  ], [categories]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Refined Collection Header */}
      <div className="w-full bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border-main)]/10 pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-8 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--border-maroon)]/5 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={openBrand}
            className="group flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--border-maroon)] transition-colors mb-6 text-xs uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>back</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-6xl font-display font-bold lowercase tracking-tighter text-[var(--text-dominant)]">
                {collection === 'women' ? "women's edit" : "men's edit"}
              </h1>
              <p className="mt-3 text-[15px] font-normal not-italic text-[var(--text-muted)] max-w-md">
                {collection === 'women' 
                  ? 'something for the girlies ;)' 
                  : 'something for the guys ;)'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold lowercase">
              <span>{filteredProducts.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 w-full bg-[var(--bg-primary)]/60 backdrop-blur-md border-b border-[var(--border-main)]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-dominant)] font-bold text-xs uppercase tracking-widest sm:hidden">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </div>
          
          {/* Mobile Scrollable Option Picker (Native Select) */}
          <div className="sm:hidden w-full max-w-[200px] relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-main)]/20 rounded-md px-3 py-2 text-xs font-semibold lowercase text-[var(--text-dominant)] focus:outline-none appearance-none"
            >
              {filterTabs.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name.toLowerCase()}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Desktop Filter Tabs */}
          <div className="hidden sm:flex items-center gap-6 overflow-x-auto no-scrollbar">
            {filterTabs.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative pb-1 text-sm transition-all duration-300 whitespace-nowrap ${
                  activeCategory === cat.slug
                    ? 'text-[var(--border-maroon)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                <span className="lowercase">{cat.name.toLowerCase()}</span>
                {activeCategory === cat.slug && (
                  <motion.div 
                    layoutId="activeFilter"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--border-maroon)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section id="shop" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${collection}-${activeCategory}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onOpenModal={() => openProductModal(product)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--card-bg)] border border-[var(--border-main)]/10 flex items-center justify-center mb-4 text-[var(--border-maroon)]/50">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-lg font-display font-bold lowercase text-[var(--text-dominant)] mb-2">no pieces found</p>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6">
              Our curated collection in this category is currently empty. Explore our other selections.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="bg-[var(--border-maroon)] text-white px-8 py-3 rounded-full lowercase text-sm font-semibold hover:bg-[var(--text-dominant)] transition-colors shadow-sm"
            >
              explore all
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  index: number;
  onOpenModal: () => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  index,
  onOpenModal,
}) => {
  const { addToCart, setIsCartOpen } = useCollection();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  // Framer Motion 3D tilt calculations
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 250, damping: 20 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = rectRef.current;
    if (!rect) {
      rect = e.currentTarget.getBoundingClientRect();
      rectRef.current = rect;
    }
    if (rect.width > 0 && rect.height > 0) {
      x.set((e.clientX - rect.left) / rect.width);
      y.set((e.clientY - rect.top) / rect.height);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rectRef.current = null;
    x.set(0.5);
    y.set(0.5);
  };

  const isOutOfStock = (product.variants && product.variants.length > 0)
    ? product.variants.every(v => (v.stock !== undefined ? v.stock <= 0 : !v.inStock))
    : (product.stock_count !== undefined ? product.stock_count <= 0 : false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      onOpenModal();
      return;
    }
    const inStockVariant = product.variants.find(v => (v.stock !== undefined ? v.stock > 0 : v.inStock)) || product.variants[0];
    if (inStockVariant) {
      addToCart(product, inStockVariant);
      setIsCartOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpenModal}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer flex flex-col h-full p-2.5 sm:p-4 rounded-[20px] sm:rounded-3xl bg-[var(--bg-primary)]/40 backdrop-blur-md border border-[var(--border-main)]/10 hover:border-[var(--border-maroon)]/40 hover:bg-[var(--bg-primary)]/60 transition-all duration-300 [perspective:1000px]"
    >
      {/* Image Container with precise aspect ratio and subtle framer-motion tilt */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-[14px] sm:rounded-2xl bg-[var(--card-inner)] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-300"
      >
        {/* Main Product Image */}
        <img
          src={product.mainImage}
          alt={product.title}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            isHovered && product.lifestyleImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          loading="lazy"
        />

        {/* Hover Lifestyle Image */}
        {product.lifestyleImage && (
          <img
            src={product.lifestyleImage}
            alt={`${product.title} lifestyle`}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            loading="lazy"
          />
        )}

        {/* Badges */}
        {isOutOfStock ? (
          <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-sm text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md border border-red-500/20 z-10">
            out of stock
          </div>
        ) : product.isFeatured ? (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-black z-10">
            Featured
          </div>
        ) : null}

        {/* Quick Add Action Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ease-out transform z-10 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg ${
              isOutOfStock
                ? 'bg-neutral-800/90 text-neutral-400 cursor-not-allowed border border-neutral-700'
                : 'bg-white/95 backdrop-blur-md text-black hover:bg-[var(--border-maroon)] hover:text-white'
            }`}
          >
            <span>{isOutOfStock ? 'Out of Stock' : 'Quick Add'}</span>
          </button>
        </div>
      </motion.div>

      {/* Meta Information */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h3 className="text-[var(--text-dominant)] font-display font-medium text-xs sm:text-sm md:text-base leading-snug break-words">
            {product.title}
          </h3>
          <span className="text-[var(--text-dominant)] font-medium text-sm sm:text-base shrink-0">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-micro mt-1">
            {product.category}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

