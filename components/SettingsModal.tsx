'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, Shield, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'scriptkaro_custom_gemini_key';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setKeyInput(stored);
        setHasExistingKey(true);
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setHasExistingKey(true);
      setSavedSuccess(true);
      onSave(trimmed);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKeyInput('');
    setHasExistingKey(false);
    onSave('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl glass-panel p-5 sm:p-6 border border-white/[0.1] shadow-2xl z-10 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF7A1A]/15 border border-[#FF7A1A]/30 flex items-center justify-center text-[#FF7A1A]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Custom Gemini Key
                  </h3>
                  <p className="text-[11px] text-gray-400">Optional Personal API Key</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="custom-key-input" className="block text-xs font-semibold text-gray-300">
                  Google Gemini API Key
                </label>
                <input
                  id="custom-key-input"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy... or AQ.Ab8..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 font-mono min-h-[44px] focus:ring-0"
                />
              </div>

              {/* Privacy Guarantee Note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-300">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-white">100% Client-Side Privacy:</strong> Yeh key sirf aapke browser ke{' '}
                  <code className="text-[#FF7A1A]">localStorage</code> mein save hoti hai. Server par kabhi log ya save nahi hoti.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!keyInput.trim()}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FF7A1A] hover:bg-[#ff8933] disabled:opacity-50 text-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-orange-glow cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Key Saved!</span>
                    </>
                  ) : (
                    <span>Save Key</span>
                  )}
                </button>

                {hasExistingKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Get key link */}
              <div className="text-center pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#FF7A1A] transition-colors"
                >
                  <span>Free Gemini Key create karein Google AI Studio par</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
