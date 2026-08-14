import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

export const GlobalBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { viewMode } = useCollection();
  
  const { scrollY } = useScroll();
  // Fade out the background between 100px and 800px of scroll
  const homeOpacity = useTransform(scrollY, [100, 800], [1, 0]);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [viewMode]);

  return (
    <motion.div 
      style={{ opacity: viewMode === 'brand' ? homeOpacity : 1 }}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[var(--bg-primary)] transition-colors duration-700"
    >
      <iframe
        id="js_video_iframe"
        src="https://go.screenpal.com/player/cOj2idnvg46?ff=1&title=0&controls=0&a=1&m=1&bg=transparent&share=1&download=1&embed=1&cl=1"
        title="Ambient Global Loop"
        onLoad={() => setIsLoaded(true)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] max-w-none max-h-none opacity-60 blur-[120px] saturate-150 object-cover pointer-events-none select-none"
        style={{ border: 'none' }}
        allow="autoplay; fullscreen *; picture-in-picture"
      />
      
      {/* Glassy Overlay Layer for Extra Diffusion */}
      <div className="absolute inset-0 backdrop-blur-[60px] bg-[var(--bg-primary)]/30" />

      {/* Seamless Soft Gradient Layer Dissolving into Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--border-maroon)]/5 via-[var(--bg-primary)]/40 to-[var(--bg-primary)] mix-blend-overlay" />
      <div className="absolute inset-0 film-grain opacity-40" />
      
      {/* Soft Ambient Blur Delay Reveal Layer on Main Page Switch */}
      <motion.div
        initial={{ opacity: 1, backdropFilter: 'blur(24px)' }}
        animate={{
          opacity: isLoaded ? 0 : 1,
          backdropFilter: isLoaded ? 'blur(0px)' : 'blur(24px)',
        }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-[var(--bg-primary)]/80 pointer-events-none z-10"
      />
    </motion.div>
  );
};
