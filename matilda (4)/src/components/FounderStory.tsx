import React from 'react';
import { motion } from 'motion/react';

export const FounderStory: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Founder Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-5"
          >
            <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden border border-[var(--border-main)] shadow-xl bg-[var(--card-bg)]">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
                alt="Matilda, Founder & Metalsmith"
                className="w-full h-full object-cover grayscale contrast-105 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-[var(--bg-primary)]/90 backdrop-blur-md border border-[var(--border-main)] p-3 rounded-xl text-xs flex justify-between items-center shadow-xs">
                <span className="font-display font-bold lowercase tracking-normal text-[var(--text-dominant)]">
                  matilda v.
                </span>
                <span className="text-[10px] text-[var(--border-maroon)] lowercase font-semibold">
                  founder & metalsmith
                </span>
              </div>
            </div>
          </motion.div>

          {/* Story Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-7 space-y-5"
          >
            <span className="text-xs lowercase tracking-wider text-[var(--border-maroon)] font-bold block">
              founder
            </span>

            <h2 className="text-xs sm:text-sm font-bold lowercase tracking-wider text-[var(--text-dominant)]">
              the studio
            </h2>

            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal lowercase">
              started in a quiet mountain workshop with a single anvil and a hand-turned wheel, matilda began crafting jewelry and homeware to escape mass-produced noise. every metal piece is forged directly from solid sterling silver or warm recycled gold, and every garment is cut from natural unbleached textiles.
            </p>

            <blockquote className="font-serif-italic text-lg sm:text-xl border-l-2 border-[var(--border-maroon)] pl-4 text-[var(--accent-script)] italic leading-relaxed lowercase">
              "i wanted to make things that didn't feel artificial or temporary. objects that carry the calm energy of cold mornings, quiet tea, and honest work."
            </blockquote>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <span className="px-3 py-1 rounded-full border border-[var(--border-main)] bg-[var(--card-bg)] text-[var(--text-dominant)] font-semibold lowercase">
                handcrafted in the valley
              </span>
              <span className="text-[var(--text-muted)] lowercase">est. 2021</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
