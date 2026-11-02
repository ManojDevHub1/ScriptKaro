'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HeroTitleProps {
  badgeText?: string;
}

export default function HeroTitle({ badgeText = 'AI Reel Scriptwriter for Indian Creators' }: HeroTitleProps) {
  const line1 = 'Topic do, viral reel script lo.';
  const line2 = '60 seconds mein.';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(6px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 18,
        stiffness: 140,
      },
    },
  };

  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto select-none">
      {/* Pill Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A1A]/10 border border-[#FF7A1A]/35 text-xs font-semibold text-[#FF7A1A] shadow-sm mb-1"
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin-slow" />
        <span>{badgeText}</span>
      </motion.div>

      {/* Main Animated Headline */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="fluid-hero font-extrabold text-white tracking-tight flex flex-col items-center justify-center gap-1"
      >
        <span className="flex flex-wrap items-center justify-center gap-x-2.5">
          {line1.split(' ').map((word, i) => (
            <motion.span key={i} variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          ))}
        </span>

        <span className="flex flex-wrap items-center justify-center gap-x-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A1A] via-[#FFA154] to-[#FF4D00]">
          {line2.split(' ').map((word, i) => (
            <motion.span key={i} variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="fluid-subhero text-gray-400 max-w-2xl mx-auto px-2"
      >
        Ready-to-record Roman Hinglish scripts, scroll-stopping 3-second hooks, scene-wise camera directions & hashtags.
      </motion.p>
    </div>
  );
}
