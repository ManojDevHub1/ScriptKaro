'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#14141A]/95 text-white border border-[#FF7A1A]/40 shadow-2xl backdrop-blur-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF7A1A] to-[#FF4D00] flex items-center justify-center text-black font-bold shrink-0">
            <Flame className="w-4 h-4 fill-current" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{message}</span>
            </p>
            <p className="text-xs text-gray-400">Ready to record your viral reel!</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
