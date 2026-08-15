import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from '../context/CollectionContext';

export const Preloader: React.FC = () => {
  const { isLoading } = useCollection();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 backdrop-blur-2xl bg-[var(--bg-primary)]/40 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
};

