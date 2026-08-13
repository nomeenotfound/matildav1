import React, { useState } from 'react';
import { useCollection } from '../context/CollectionContext';
import { Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openShop, openBrand, setIsSayHelloOpen, toggleManagement, viewMode } = useCollection();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer className="relative z-10 w-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500 pt-10 sm:pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top Section: Manifesto & Newsletter - Only shown on brand story view, hidden on collection pages */}
        {viewMode === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-[var(--border-main)]/20">
            {/* Brand Manifesto */}
            <div className="lg:col-span-6 space-y-2">
              <span className="text-xs text-[var(--border-maroon)] lowercase tracking-wider block font-bold">
                manifesto
              </span>
              <p className="font-serif-italic italic text-xl sm:text-2xl text-[var(--text-dominant)] leading-snug font-normal lowercase">
                "home should feel warm and real. we don't make anything we wouldn't keep in our own rooms."
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3 bg-[var(--card-bg)] p-5 sm:p-6 rounded-2xl border border-[var(--border-main)] shadow-xs">
              <span className="text-xs font-bold text-[var(--text-dominant)] lowercase tracking-wider block">
                sign up for our letters?
              </span>
              <p className="text-xs text-[var(--text-muted)] lowercase">
                no spam ever, we promise
              </p>

              {subscribed ? (
                <div className="border border-[var(--border-maroon)] p-3 rounded-xl text-xs bg-[var(--tag-bg)] text-[var(--border-maroon)] font-bold lowercase">
                  you are on our list now. talk soon.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 text-xs">
                  <input
                    type="email"
                    required
                    placeholder="your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-main)] px-4 py-2 rounded-full text-xs focus:outline-none focus:border-[var(--border-maroon)] text-[var(--text-primary)] placeholder-[var(--text-muted)] shadow-xs lowercase font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-[var(--border-maroon)] text-white px-5 py-2 rounded-full lowercase font-bold hover:bg-[var(--text-dominant)] transition-all text-xs flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>join</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Watermark Title Footer */}
        <div className="text-center pt-6">
          <h2 className="font-matilda text-3xl sm:text-5xl font-normal lowercase tracking-normal text-[var(--border-maroon)] opacity-30 select-none">
            matilda
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--text-muted)] mt-4 gap-2 lowercase font-medium">
            <span>© 2026 Duha Aijaz Pandith. all rights reserved</span>
            <button
              onClick={toggleManagement}
              className="px-2.5 py-1 rounded bg-[var(--card-bg)] border border-[var(--border-main)] hover:border-[var(--border-maroon)] hover:text-[var(--border-maroon)] transition-all font-mono text-[11px] font-bold tracking-tight text-[var(--text-dominant)] flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Open DAPMAT Management Panel (Shortcut: type 'DAPMAT')"
            >
              <span>[ DAPMAT Panel ]</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};


