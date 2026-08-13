import React from 'react';
import { motion } from 'motion/react';
import { useCollection } from '../context/CollectionContext';
import { ShoppingBag, ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const { openShop, cartCount, setIsCartOpen, setIsSearchOpen } = useCollection();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [useIframeFallback, setUseIframeFallback] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
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
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-between px-6 sm:px-10 py-8 sm:py-12 overflow-hidden transition-colors duration-500 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Background Video Loop with Ambient Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto opacity-45 object-cover pointer-events-none select-none scale-105"
          >
            <source
              src="https://cdn.jumpshare.com/preview/ho_z3wnokDSZ2ziv_7U4Fsc8kZnSWKiKXQLHV2QzyHnU_y0hmVLj7TXR8y3sGNqHDh8jR8HE6sTmQV-WVsd-QWnGnRaI4qm8zgO4kjoDGpYwku66NYa0TIrnqcJjxU8Vn4Pg7DWc5l9n2z5Y6purEG6yjbN-I2pg_cnoHs_AmgI.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <iframe
            id="js_video_iframe"
            src="https://jumpshare.com/embed/amgavbNZhiAwzQ2pQ9ci?autoplay=1&muted=1&loop=1"
            title="Ambient Hero Loop"
            onLoad={() => {
              setTimeout(() => setIsLoaded(true), 300);
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] max-w-none max-h-none opacity-40 object-cover pointer-events-none select-none"
            style={{ border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        )}

        {/* Seamless Soft Gradient Layer Dissolving into Canvas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--border-maroon)]/10 via-[var(--bg-primary)]/20 to-[var(--bg-primary)] backdrop-blur-[1px]" />
        <div className="absolute inset-0 film-grain opacity-30" />

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
      </div>

      {/* Main Center Title & Gender Selection */}
      <div className="relative z-20 my-auto text-center py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-block max-w-4xl"
        >
          <h1
            className="font-matilda font-normal lowercase tracking-tight text-[var(--border-maroon)] leading-[0.88] select-none text-center text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[170px] max-w-full"
          >
            matilda
          </h1>
        </motion.div>

        {/* Clean, minimal women & men collection buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 sm:mt-14 flex items-center justify-center"
        >
          <div className="flex items-center gap-3 bg-[var(--card-bg)]/90 backdrop-blur-md p-1 rounded-full border border-[var(--border-main)] shadow-xs hover:border-[var(--border-maroon)]/50 transition-all">
            <button
              onClick={() => openShop('women')}
              className="px-6 py-2 rounded-full text-xs font-medium lowercase tracking-wide bg-[var(--border-maroon)] text-white hover:bg-[var(--text-dominant)] transition-all"
            >
              women
            </button>
            <button
              onClick={() => openShop('men')}
              className="px-6 py-2 rounded-full text-xs font-medium lowercase tracking-wide bg-[var(--border-maroon)] text-white hover:bg-[var(--text-dominant)] transition-all"
            >
              men
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


