import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

export const GlobalBackground: React.FC = () => {
  const { viewMode, collection } = useCollection();
  const { scrollY } = useScroll();
  // Smooth, gradual scroll fade into content without any abrupt cutoffs
  const homeOpacity = useTransform(scrollY, [150, 950], [1, 0]);

  return (
    <motion.div 
      style={{ opacity: viewMode === 'brand' ? homeOpacity : 1 }}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[var(--bg-primary)] transition-colors duration-700"
    >
      {/* Animated Gradient Orbs & Continuous Atmospheric Flow */}
      <div className="absolute inset-0 w-full h-full opacity-75 transition-opacity duration-700">
        {/* Orb 1: Primary Warm Maroon / Deep Ruby Accent */}
        <motion.div
          animate={{
            x: ['-10%', '15%', '-5%', '-10%'],
            y: ['-10%', '10%', '20%', '-10%'],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[90px] sm:blur-[140px] pointer-events-none mix-blend-multiply transform-gpu will-change-transform ${
            collection === 'men' ? 'bg-[#7A1228]/18' : 'bg-[#7A1228]/20'
          }`}
        />

        {/* Orb 2: Secondary Warm Gold / Amber Accent */}
        <motion.div
          animate={{
            x: ['10%', '-15%', '10%', '10%'],
            y: ['15%', '-10%', '-15%', '15%'],
            scale: [1.1, 0.9, 1.2, 1.1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -bottom-1/4 -right-1/4 w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none mix-blend-multiply transform-gpu will-change-transform ${
            collection === 'men' ? 'bg-[#B88A4E]/15' : 'bg-[#B88A4E]/18'
          }`}
        />

        {/* Orb 3: Central Soft Ambient Shift */}
        <motion.div
          animate={{
            x: ['-15%', '10%', '-10%', '-15%'],
            y: ['10%', '-20%', '10%', '10%'],
            scale: [0.95, 1.2, 1, 0.95],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-1/3 left-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none mix-blend-soft-light transform-gpu will-change-transform ${
            collection === 'men' ? 'bg-[#8C1C33]/12' : 'bg-[#8C1C33]/15'
          }`}
        />
      </div>

      {/* Subtle Ambient Tints and Delicate Film Grain */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]/40 backdrop-blur-[1px]" />
      <div className="absolute inset-0 film-grain opacity-15" />
    </motion.div>
  );
};
