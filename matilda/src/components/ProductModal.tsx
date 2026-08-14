import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import { ProductVariant } from '../types';
import { ShoppingBag, X, Check, Zap, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductModal: React.FC = () => {
  const { selectedProduct, closeProductModal, addToCart, setIsCartOpen, triggerCheckoutHandoff } = useCollection();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.variants.length > 0) {
        setSelectedVariant(selectedProduct.variants[0]);
      }
      setActiveImageIndex(0);
      setShowFullDetails(false);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  // Build full array of available images for the scroll arrows carousel
  const images = [
    selectedProduct.mainImage,
    selectedProduct.lifestyleImage,
    ...(selectedProduct.galleryImages || []),
  ].filter(Boolean) as string[];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/50">
        {/* Modal Backdrop overlay click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProductModal}
          className="absolute inset-0"
        />

        {/* Modal Content Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-main)]/30 rounded-3xl shadow-2xl flex flex-col md:grid md:grid-cols-2 overflow-hidden"
        >
          {/* Close Button top-right */}
          <button
            onClick={closeProductModal}
            className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center text-[var(--text-dominant)] hover:bg-[var(--border-maroon)] hover:text-white transition-all shadow-md"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Pane: Image Gallery with Scroll Navigation Arrows - Strictly 1:1 aspect ratio */}
          <div className="relative aspect-square w-full max-w-full bg-[var(--card-inner)]/50 p-3 sm:p-4 flex flex-col items-center justify-center select-none overflow-hidden mx-auto">
            <div className="relative w-full h-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-[var(--border-main)]/20 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex] || selectedProduct.mainImage}
                  alt={`${selectedProduct.title} - Image ${activeImageIndex + 1}`}
                  initial={{ opacity: 0.4, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full aspect-square object-cover"
                />
              </AnimatePresence>

              {/* Material Badge */}
              <div className="absolute top-3 left-3 bg-[var(--bg-primary)]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[var(--border-maroon)] shadow-xs border border-[var(--border-main)]/20">
                {selectedProduct.material}
              </div>

              {/* Left & Right Scroll Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--bg-primary)]/80 hover:bg-[var(--border-maroon)] text-[var(--text-dominant)] hover:text-white backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-90"
                    title="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--bg-primary)]/80 hover:bg-[var(--border-maroon)] text-[var(--text-dominant)] hover:text-white backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-90"
                    title="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Thumbnail Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Streamlined Product Info & Sticky Action Bar */}
          <div className="flex flex-col justify-between max-h-[calc(90vh-16rem)] md:max-h-[90vh] overflow-hidden bg-[var(--bg-primary)]">
            {/* Scrollable Information Section */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex justify-between items-start text-xs pr-8">
                <div>
                  <span className="text-[var(--border-maroon)] font-matilda text-xs font-bold uppercase tracking-wider block">
                    {selectedProduct.category}
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-dominant)] mt-0.5 lowercase">
                    {selectedProduct.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl font-extrabold text-[var(--text-dominant)] block">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">In Stock</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--text-muted)] leading-relaxed border-l-2 border-[var(--border-maroon)]/80 pl-3 lowercase">
                {selectedProduct.description}
              </p>

              {/* Spec Details Accordion / Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--border-maroon)] hover:underline lowercase"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{showFullDetails ? 'hide craft specifications' : 'view craft specifications'}</span>
                </button>

                {showFullDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2.5 p-3 rounded-xl bg-[var(--card-inner)]/60 border border-[var(--border-main)]/20 space-y-1.5 text-xs"
                  >
                    {selectedProduct.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[var(--text-primary)] lowercase text-[11px]">
                        <Check className="w-3.5 h-3.5 text-[var(--border-maroon)] shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* ALWAYS VISIBLE / STICKY ACTION BAR AT BOTTOM - Add to Bag & Buy Now Buttons */}
            <div className="p-4 sm:p-5 border-t border-[var(--border-main)]/30 bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-lg space-y-3 shrink-0">
              {/* Variant / Sizing Options */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[var(--text-dominant)] lowercase">select option:</span>
                    <span className="text-[var(--text-muted)] lowercase font-medium">{selectedVariant?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {selectedProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1 rounded-full text-xs lowercase transition-all duration-200 font-medium ${
                          selectedVariant?.id === v.id
                            ? 'bg-[var(--border-maroon)] text-white font-semibold shadow-xs'
                            : 'bg-[var(--card-bg)] border border-[var(--border-main)] text-[var(--text-primary)] hover:border-[var(--border-maroon)]'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Dual Call-to-Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    if (selectedVariant) {
                      addToCart(selectedProduct, selectedVariant);
                      closeProductModal();
                      setIsCartOpen(true);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-inner)] text-[var(--text-dominant)] border border-[var(--border-main)]/50 text-xs lowercase font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4 text-[var(--border-maroon)]" />
                  <span>add to bag</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedVariant) {
                      addToCart(selectedProduct, selectedVariant);
                      closeProductModal();
                      setIsCartOpen(false);
                      navigate('/app/checkout');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[var(--border-maroon)] text-white text-xs lowercase font-bold hover:bg-[var(--text-dominant)] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  <span>buy now</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

