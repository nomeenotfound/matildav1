import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import { Product } from '../types';
import { ShoppingBag, Eye, ArrowLeft } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { collection, openProductModal, products, categories, openBrand } = useCollection();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoaded(false);

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoaded(true);
          })
          .catch(() => {
            setUseIframeFallback(true);
          });
      }
    } else {
      setUseIframeFallback(true);
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [collection]);

  const filteredProducts = products.filter((p) => {
    const matchesCollection = p.collection === collection || p.collection === 'both';
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesCollection && matchesCategory;
  });

  // Dynamic filter tabs based on categories list + 'all'
  const filterTabs = [
    { id: 'all', name: 'All Items', slug: 'all' },
    ...categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  ];

  return (
    <div className="relative w-full min-h-screen">
      {/* Ambient Video Background Loop for Both Collection Pages */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        {!useIframeFallback ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setIsLoaded(true)}
            onError={() => setUseIframeFallback(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto opacity-30 object-cover pointer-events-none select-none scale-105"
          >
            <source
              src="https://cdn.jumpshare.com/preview/ho_z3wnokDSZ2ziv_7U4Fsc8kZnSWKiKXQLHV2QzyHnU_y0hmVLj7TXR8y3sGNqHDh8jR8HE6sTmQV-WVsd-QWnGnRaI4qm8zgO4kjoDGpYwku66NYa0TIrnqcJjxU8Vn4Pg7DWc5l9n2z5Y6purEG6yjbN-I2pg_cnoHs_AmgI.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <iframe
            id="js_collection_video_iframe"
            src="https://jumpshare.com/embed/amgavbNZhiAwzQ2pQ9ci?autoplay=1&muted=1&loop=1"
            title="Ambient Collection Loop"
            onLoad={() => {
              setTimeout(() => setIsLoaded(true), 300);
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] max-w-none max-h-none opacity-25 object-cover pointer-events-none select-none"
            style={{ border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        )}

        {/* Light Overlay & Film Grain */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/85 via-[var(--bg-primary)]/75 to-[var(--bg-primary)]/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 film-grain opacity-30" />

        {/* Soft Ambient Blur Delay Reveal on Collection Change / Load */}
        <motion.div
          key={`bg-blur-${collection}`}
          initial={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          animate={{
            opacity: isLoaded ? 0 : 1,
            backdropFilter: isLoaded ? 'blur(0px)' : 'blur(20px)',
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-[var(--bg-primary)]/80 pointer-events-none z-10"
        />
      </div>

      <section id="shop" className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-8 py-6 sm:py-12">
        {/* Floating Back Button */}
        <button
          onClick={openBrand}
          className="absolute top-4 sm:top-6 left-3 sm:left-8 z-50 p-2 sm:p-2.5 rounded-full bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-main)]/30 shadow-2xs hover:border-[var(--border-maroon)]/50 text-[var(--text-primary)] transition-all active:scale-95"
          title="Back to home"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--border-maroon)]" />
        </button>

        {/* Streamlined, Spacious Collection Masthead */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12 gap-4 sm:gap-6"
        >
          {/* Header Title & Item Count */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-2xl sm:text-5xl font-matilda lowercase tracking-tight text-[var(--text-dominant)]">
              {collection === 'women' ? "women's collection" : "men's collection"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] lowercase font-serif italic max-w-md mx-auto px-2">
              {collection === 'women' ? 'something for the girlies ;)' : 'for the guys'}
            </p>
          </div>

          {/* Mobile Scrollable Option Picker (Native Select) */}
          <div className="sm:hidden w-full max-w-[240px] mx-auto mt-1 relative">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border-main)]/50 rounded-full px-4 py-2.5 text-xs font-semibold lowercase text-[var(--text-dominant)] focus:outline-none appearance-none text-center shadow-xs"
            >
              {filterTabs.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name.toLowerCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Cohesive Floating Glass Filter Bar (Category Pills) - Desktop Only */}
          <div className="hidden sm:flex w-full max-w-full overflow-x-auto no-scrollbar py-1 justify-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-2 p-1.5 bg-[var(--card-bg)]/90 backdrop-blur-md rounded-full shadow-2xs border border-[var(--border-main)]/30 mx-auto">
              {filterTabs.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-5 py-2 rounded-full lowercase transition-all duration-200 text-xs font-semibold whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? 'bg-[var(--border-maroon)] text-white shadow-2xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/60'
                  }`}
                >
                  {cat.name.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Spacious, Uncrowded Animated Grid Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${collection}-${activeCategory}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 lg:gap-10"
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
          <div className="text-center py-20 rounded-3xl bg-[var(--bg-primary)]/70 backdrop-blur-md p-8 border border-[var(--border-main)]/30">
            <p className="text-sm font-bold lowercase mb-2 text-[var(--text-dominant)]">no items found in this category</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Try selecting another filter or viewing all items in the store.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="bg-[var(--border-maroon)] text-white px-6 py-2.5 rounded-full lowercase text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              view all items
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

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  onOpenModal,
}) => {
  const { addToCart, setIsCartOpen } = useCollection();
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants.length > 0) {
      addToCart(product, product.variants[0]);
      setIsCartOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpenModal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col justify-between p-2.5 sm:p-4 rounded-[20px] sm:rounded-3xl bg-[var(--bg-primary)]/60 backdrop-blur-md border border-[var(--border-main)]/30 hover:border-[var(--border-maroon)]/60 hover:bg-[var(--bg-primary)]/90 transition-all duration-300 shadow-xs hover:shadow-lg"
    >
      {/* Product Image Frame - Enforces strictly 1:1 square aspect ratio for all images */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[14px] sm:rounded-2xl bg-[var(--card-inner)]/80 mb-2.5 sm:mb-3 border border-[var(--border-main)]/10">
        {/* Main Product Image */}
        <img
          src={product.mainImage}
          alt={product.title}
          className={`absolute inset-0 w-full h-full aspect-square object-cover transition-all duration-500 ${
            isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          loading="lazy"
        />

        {/* Hover Lifestyle Image */}
        <img
          src={product.lifestyleImage || product.mainImage}
          alt={`${product.title} lifestyle`}
          className={`absolute inset-0 w-full h-full aspect-square object-cover transition-all duration-500 ${
            isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          loading="lazy"
        />

        {/* Category Pill Tag */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[var(--bg-primary)]/85 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold lowercase text-[var(--border-maroon)] shadow-xs border border-[var(--border-main)]/20">
          {product.category}
        </div>

        {/* Quick View / Quick Add Overlay Buttons */}
        <div
          className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1.5 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-95 sm:opacity-0 translate-y-0 sm:translate-y-2'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[var(--border-maroon)] text-white text-[10px] sm:text-[11px] font-semibold shadow-md hover:bg-[var(--text-dominant)] active:scale-95 transition-all"
            title="Quick add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="lowercase hidden sm:inline">quick add</span>
          </button>
        </div>
      </div>

      {/* Product Name, Material & Price beneath image */}
      <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
          <h3 className="text-[var(--text-dominant)] group-hover:text-[var(--border-maroon)] transition-colors font-medium text-[11px] sm:text-sm lowercase line-clamp-1">
            {product.title.toLowerCase()}
          </h3>
          <span className="text-[var(--border-maroon)] font-bold shrink-0 text-[11px] sm:text-sm">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] lowercase font-serif italic truncate mt-0.5 sm:mt-0">
          {product.material}
        </p>
      </div>
    </motion.div>
  );
};

