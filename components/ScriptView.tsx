'use client';

import React, { useState, MouseEvent } from 'react';
import { ScriptScene } from '@/lib/types';
import { Clock, Video, Copy, Check, MessageSquare, Play, Pause, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fireMicroConfetti } from '@/lib/confetti';

interface ScriptViewProps {
  scenes: ScriptScene[];
  onCopySuccess?: (label: string) => void;
}

export default function ScriptView({ scenes, onCopySuccess }: ScriptViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [teleprompterMode, setTeleprompterMode] = useState(false);

  const copySceneLine = async (e: MouseEvent<HTMLButtonElement>, line: string, index: number) => {
    try {
      await navigator.clipboard.writeText(line);
      setCopiedIndex(index);

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      fireMicroConfetti(x, y);

      if (onCopySuccess) {
        onCopySuccess(`Scene ${index + 1} Line`);
      }

      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy scene line', err);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Teleprompter Toggle Bar */}
      <div className="flex items-center justify-between pb-1 gap-2">
        <span className="text-xs text-gray-400 font-medium">
          🎬 {scenes.length} Scenes Breakdown
        </span>

        <button
          type="button"
          onClick={() => setTeleprompterMode((prev) => !prev)}
          className={`min-h-[38px] text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            teleprompterMode
              ? 'bg-[#FF7A1A] text-black font-bold shadow-orange-glow'
              : 'bg-white/[0.05] text-gray-300 hover:text-white border border-white/[0.08]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{teleprompterMode ? 'Normal View' : 'Teleprompter Mode'}</span>
        </button>
      </div>

      {/* Teleprompter View Mode */}
      {teleprompterMode ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-6 sm:p-8 bg-black/90 border border-[#FF7A1A]/40 shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-widest text-[#FF7A1A] font-bold">
              Teleprompter Record Mode
            </span>
            <span className="text-xs text-gray-400">Read line-by-line while recording</span>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {scenes.map((scene, i) => (
              <div key={i} className="space-y-1.5 pb-4 border-b border-white/[0.04]">
                <div className="text-xs text-[#FF7A1A] font-bold font-mono">
                  [{scene.time}] Scene {i + 1}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {scene.line}
                </p>
                {scene.visual && (
                  <p className="text-xs text-gray-400 italic">
                    Camera: {scene.visual}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Standard Storyboard View with Staggered Spring Animation */
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="space-y-3.5 w-full"
        >
          {scenes.map((scene, index) => {
            const isHook = index === 0;
            const isCopied = copiedIndex === index;

            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } },
                }}
                className={`rounded-xl p-3.5 sm:p-4 transition-all duration-200 border break-words ${
                  isHook
                    ? 'bg-[#FF7A1A]/[0.05] border-[#FF7A1A]/35 hover:border-[#FF7A1A]/50'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]'
                }`}
              >
                {/* Scene Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#161622] text-[#FF7A1A] border border-[#FF7A1A]/25">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{scene.time}</span>
                    </span>

                    <span className="text-xs text-gray-400 font-semibold">
                      Scene {index + 1}
                    </span>

                    {isHook && (
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#FF7A1A] text-black">
                        HOOK (0-3s)
                      </span>
                    )}
                  </div>

                  {/* 44px Touch Target for Copying Line */}
                  <button
                    type="button"
                    onClick={(e) => copySceneLine(e, scene.line, index)}
                    aria-label={`Copy dialogue line for scene ${index + 1}`}
                    className={`min-h-[44px] px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 rounded-lg transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                      isCopied
                        ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                        : 'text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06]'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>Copy Line</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Narration / Spoken Dialogue */}
                <div className="mb-3 pl-3 sm:pl-3.5 border-l-2 border-[#FF7A1A]/70">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#FF7A1A] shrink-0" />
                    <span>Voiceover / Spoken Dialogue</span>
                  </div>
                  <p className="text-sm sm:text-base text-white font-medium leading-relaxed break-words">
                    &ldquo;{scene.line}&rdquo;
                  </p>
                </div>

                {/* Visual Direction / Camera Cue */}
                {scene.visual && (
                  <div className="flex items-start gap-2.5 bg-[#0E0E14]/80 rounded-lg p-2.5 sm:p-3 border border-white/[0.05]">
                    <Video className="w-4 h-4 text-[#FF7A1A] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-xs text-gray-300 leading-relaxed break-words flex-1">
                      <span className="font-semibold text-gray-200">Visual Cue: </span>
                      {scene.visual}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
