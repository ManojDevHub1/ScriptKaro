'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Flame } from 'lucide-react';

const CREATOR_TIPS = [
  'Pehle 3 second mein hook nahi diya toh 80% viewers scroll kar denge!',
  'Reels ke pehle frame mein movement ya visual shock retention 2x karta hai.',
  'Hinglish script natural lagti hai—robot jaise mat padho, dost se baat karo.',
  'Captions zaroor daalo, 70%+ log mute pe reels scroll karte hain.',
  'Cover text 5 words se chhota rakho taaki explore feed mein saaf dikhe.',
];

export default function Loader() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-3xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500"
    >
      {/* Main Status Header */}
      <div className="glass-panel-glow rounded-2xl p-5 sm:p-8 text-center relative overflow-hidden">
        {/* Animated Background Shimmer */}
        <div className="absolute inset-0 animate-shimmer opacity-25 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Spinner Icon */}
          <div className="relative mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#FF7A1A] to-[#FF4D00] flex items-center justify-center text-white shadow-orange-glow animate-pulse">
              <Flame className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce text-black fill-current" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-[#FF7A1A]/40 animate-ping pointer-events-none opacity-30" />
          </div>

          <h3 className="fluid-card-title font-bold text-white tracking-tight flex items-center gap-2 flex-wrap justify-center">
            <span>Script likh raha hoon...</span>
            <Sparkles className="w-5 h-5 text-[#FF7A1A] animate-spin shrink-0" />
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md">
            Gemini Flash viral hooks & scene timestamps generate kar raha hai.
          </p>

          {/* Dynamic Creator Tip */}
          <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#FF7A1A] max-w-xl text-left sm:text-center">
            <span className="font-bold uppercase tracking-wider text-[10px] text-white/80 shrink-0">
              Creator Tip:
            </span>
            <span className="text-gray-300 font-medium italic transition-all duration-300">
              &ldquo;{CREATOR_TIPS[tipIndex]}&rdquo;
            </span>
          </div>
        </div>
      </div>

      {/* Shimmer skeleton cards to simulate upcoming result cards */}
      <div className="space-y-4">
        {/* Skeleton Card 1: Hooks */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-white/[0.08] rounded-md animate-shimmer" />
            <div className="h-8 w-20 bg-white/[0.08] rounded-lg animate-shimmer" />
          </div>
          <div className="h-12 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
          <div className="h-12 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
        </div>

        {/* Skeleton Card 2: Scene Script */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-44 bg-white/[0.08] rounded-md animate-shimmer" />
            <div className="h-8 w-24 bg-white/[0.08] rounded-lg animate-shimmer" />
          </div>
          <div className="h-20 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
          <div className="h-20 w-full bg-white/[0.04] rounded-xl animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
