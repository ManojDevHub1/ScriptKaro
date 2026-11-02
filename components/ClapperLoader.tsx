'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clapperboard, Film } from 'lucide-react';

const LOADING_STEPS = [
  { title: 'Hook soch raha hoon...', desc: 'Pehle 3 second ka scroll-stopping hook design ho raha hai' },
  { title: 'Script likh raha hoon...', desc: 'Punchy Roman Hinglish dialogues & voiceover create ho rahe hain' },
  { title: 'Scene timestamps calculate ho rahe hain...', desc: 'Exact 30s/60s/90s duration pacing set ho rahi hai' },
  { title: 'Visual camera cues polish ho rahe hain...', desc: 'B-roll, zooms aur on-screen text overlays tayyar ho rahe hain' },
  { title: 'Hashtags & cover text pack kar raha hoon...', desc: 'High-CTR thumbnail text aur trending tags final ho rahe hain' },
];

export default function ClapperLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const currentStep = LOADING_STEPS[stepIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 select-none"
    >
      {/* Film Clapper Animated Card */}
      <div className="relative rounded-3xl glass-panel-glow p-6 sm:p-8 text-center overflow-hidden border border-[#FF7A1A]/35 shadow-orange-glow">
        {/* Ambient Shimmer */}
        <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Clapper / Film Reel Icon */}
          <div className="relative mb-5">
            {/* Spinning Film Reel Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-[#FF7A1A] flex items-center justify-center opacity-85 shadow-orange-glow"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#161622] border-2 border-[#FF7A1A]/40 flex items-center justify-center">
                <Film className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF7A1A]" />
              </div>
            </motion.div>

            {/* Glowing Accent Badge */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#FF7A1A] flex items-center justify-center text-black font-bold shadow-md"
            >
              <Clapperboard className="w-4 h-4 fill-current" />
            </motion.div>
          </div>

          {/* Animated Message Transition */}
          <div className="min-h-[70px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-1.5"
              >
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                  <span>{currentStep.title}</span>
                  <Sparkles className="w-5 h-5 text-[#FF7A1A] animate-spin" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-md mx-auto">
                  {currentStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5 mt-5">
            {LOADING_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex
                    ? 'w-6 bg-[#FF7A1A]'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Shimmer Skeleton Previews */}
      <div className="space-y-3.5">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-white/[0.08] rounded-md animate-shimmer" />
            <div className="h-8 w-20 bg-white/[0.08] rounded-lg animate-shimmer" />
          </div>
          <div className="h-12 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
          <div className="h-12 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
