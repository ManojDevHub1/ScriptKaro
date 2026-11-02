'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none bg-[#0A0A0D]"
    >
      {/* Mesh Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Orange Glow Orb 1 (Top Center) */}
      <motion.div
        animate={{
          x: ['-50%', '-48%', '-52%', '-50%'],
          y: [0, 20, -15, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[450px] sm:w-[850px] sm:h-[550px] rounded-full bg-gradient-to-b from-[#FF7A1A]/20 via-[#FF4D00]/10 to-transparent blur-[110px] will-change-transform"
      />

      {/* Floating Secondary Ember Orb 2 (Top Right) */}
      <motion.div
        animate={{
          x: [0, -35, 20, 0],
          y: [0, 40, -20, 0],
          scale: [0.9, 1.05, 0.92, 0.9],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-[10%] right-[-15%] sm:right-[-5%] w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] rounded-full bg-gradient-to-tr from-[#FF7A1A]/15 via-[#FF3300]/08 to-transparent blur-[130px] will-change-transform"
      />

      {/* Subtle Bottom Ambient Light */}
      <motion.div
        animate={{
          opacity: [0.12, 0.22, 0.14, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[400px] rounded-full bg-[#FF7A1A]/10 blur-[140px] will-change-transform"
      />

      {/* Grain / Noise Filter */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
