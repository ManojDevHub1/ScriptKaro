'use client';

import React, { useState, MouseEvent } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireMicroConfetti } from '@/lib/confetti';
import SpotlightCard from './SpotlightCard';

interface ResultCardProps {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  copyText: string;
  copyLabel?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  onCopySuccess?: (label: string) => void;
}

export default function ResultCard({
  title,
  badge,
  icon,
  copyText,
  copyLabel = 'Copy',
  children,
  className = '',
  footer,
  onCopySuccess,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);

      // Micro confetti burst at cursor location
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      fireMicroConfetti(x, y);

      if (onCopySuccess) {
        onCopySuccess(title);
      }

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 180 }}
      className="w-full"
    >
      <SpotlightCard className={`p-4 xs:p-5 sm:p-6 w-full ${className}`}>
        {/* Header */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-[#FF7A1A]/10 border border-[#FF7A1A]/20 flex items-center justify-center text-[#FF7A1A] shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="fluid-card-title font-semibold text-white tracking-tight break-words">
                  {title}
                </h3>
                {badge && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FF7A1A]/15 text-[#FF7A1A] border border-[#FF7A1A]/30 shrink-0">
                    {badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Morphing Copy Button */}
          <motion.button
            type="button"
            onClick={handleCopy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            aria-label={copied ? `${title} copied to clipboard` : `Copy ${title}`}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none select-none ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-white/[0.06] text-gray-200 hover:bg-[#FF7A1A]/15 hover:text-[#FF7A1A] border border-white/[0.1] hover:border-[#FF7A1A]/30'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{copyLabel}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Content */}
        <div className="relative z-10 text-gray-200 w-full overflow-hidden">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-4 pt-3 border-t border-white/[0.06] relative z-10">{footer}</div>}
      </SpotlightCard>
    </motion.div>
  );
}
