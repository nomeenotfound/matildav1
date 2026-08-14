import React from 'react';
import { motion } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

export const Hero: React.FC = () => {
  const { openShop } = useCollection();

  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-between px-6 sm:px-10 py-8 sm:py-12 overflow-hidden bg-transparent">
      {/* Main Center Title & Gender Selection */}
      <div className="relative z-20 my-auto text-center py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative inline-block max-w-4xl"
        >
          <h1 className="font-matilda font-normal lowercase tracking-tight text-[var(--border-maroon)] leading-[0.88] select-none text-center text-6xl sm:text-8xl md:text-9xl lg:text-[150px] xl:text-[170px] max-w-full drop-shadow-sm">
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
              className="px-6 py-2 rounded-full text-xs font-medium lowercase tracking-wide bg-[var(--border-maroon)] text-white hover:bg-[var(--text-dominant)] transition-all cursor-pointer"
            >
              women
            </button>
            <button
              onClick={() => openShop('men')}
              className="px-6 py-2 rounded-full text-xs font-medium lowercase tracking-wide bg-[var(--border-maroon)] text-white hover:bg-[var(--text-dominant)] transition-all cursor-pointer"
            >
              men
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};



