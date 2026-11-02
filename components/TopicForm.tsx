'use client';

import React, { KeyboardEvent, useEffect, useState } from 'react';
import { GenerateRequest, LanguageOption, LengthOption, ToneOption } from '@/lib/types';
import { Sparkles, Flame, Clock, Languages, Smile } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { motion } from 'framer-motion';

interface TopicFormProps {
  formData: GenerateRequest;
  onChange: (updated: GenerateRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const EXAMPLE_TOPICS = [
  'OpenJarvis free AI assistant',
  '5 AI tools every student must use',
  'ChatGPT vs DeepSeek: Kaun jeeta?',
  'Secret trick to edit Reels in 5 mins',
  'Canva se daily ₹1000 kaise kamaye',
];

const PLACEHOLDER_TOPICS = [
  'OpenJarvis free AI assistant...',
  '5 AI tools every student must use...',
  'ChatGPT vs DeepSeek: Kaun jeeta?...',
  'Secret trick to edit Reels in 5 mins...',
  'Canva se daily ₹1000 kaise kamaye...',
];

export default function TopicForm({ formData, onChange, onSubmit, loading }: TopicFormProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect for the placeholder
  useEffect(() => {
    // If the user has typed something, don't waste CPU cycles typing placeholders
    if (formData.topic) return;

    const currentFullText = PLACEHOLDER_TOPICS[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < currentFullText.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentFullText.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, 55);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentFullText.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 30);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TOPICS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex, formData.topic]);

  const setField = <K extends keyof GenerateRequest>(key: K, value: GenerateRequest[K]) => {
    onChange({ ...formData, [key]: value });
  };

  const handleExampleClick = (example: string) => {
    onChange({ ...formData, topic: example });
  };

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter submits
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!loading && formData.topic.trim()) {
        onSubmit(e as any);
      }
    }
  };

  const isButtonDisabled = loading || !formData.topic.trim() || formData.topic.trim().length < 3;

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5 sm:space-y-6">
      {/* Topic Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="topic-input" className="block text-sm sm:text-base font-semibold text-gray-200">
            Reel Topic / Idea <span className="text-[#FF7A1A]">*</span>
          </label>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-gray-400 border border-white/[0.1]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-gray-400 border border-white/[0.1]">Enter</kbd>
            <span className="text-gray-500">to generate</span>
          </span>
        </div>

        <div className="relative">
          <textarea
            id="topic-input"
            rows={3}
            value={formData.topic}
            onChange={(e) => setField('topic', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              formData.topic ? '' : displayedPlaceholder ? `Jaise: ${displayedPlaceholder}` : 'Jaise: OpenJarvis free AI assistant...'
            }
            className="w-full glass-input rounded-xl px-4 py-3 sm:py-3.5 text-base text-white placeholder-gray-500 resize-none focus:ring-0 leading-relaxed min-h-[96px] break-words"
            disabled={loading}
            maxLength={200}
            required
            aria-label="Reel topic or idea"
          />
          <div className="absolute right-3 bottom-3 text-[11px] text-gray-500 font-mono pointer-events-none select-none">
            {formData.topic.length}/200
          </div>
        </div>

        {/* Quick Example Chips with Hover / Tap Scale */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A] shrink-0" />
            <span>Click an example for instant ideas:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {EXAMPLE_TOPICS.map((topic, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleExampleClick(topic)}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="min-h-[38px] text-xs px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-[#FF7A1A]/15 active:bg-[#FF7A1A]/25 text-gray-300 hover:text-[#FF7A1A] border border-white/[0.08] hover:border-[#FF7A1A]/35 transition-all text-left flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none cursor-pointer"
              >
                <span>{topic}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional Key Facts Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="key-facts-input" className="block text-xs sm:text-sm font-medium text-gray-300">
            Key Facts <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] text-gray-500 font-mono select-none">
            {(formData.keyFacts || '').length}/500
          </span>
        </div>

        <div className="relative">
          <textarea
            id="key-facts-input"
            rows={2}
            value={formData.keyFacts || ''}
            onChange={(e) => setField('keyFacts', e.target.value)}
            placeholder="Real facts about your topic, e.g. what the tool does, price, link"
            className="w-full glass-input rounded-xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-500 resize-none focus:ring-0 leading-relaxed min-h-[68px] break-words"
            disabled={loading}
            maxLength={500}
            aria-label="Key facts about your topic"
          />
        </div>
      </div>

      {/* Options Grid: Responsive 1 col on mobile, 3 cols on tablet & desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Language Option */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#FF7A1A]" />
            Language
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            {(
              [
                { id: 'hinglish', label: 'Hinglish' },
                { id: 'hindi', label: 'Hindi' },
                { id: 'english', label: 'English' },
              ] as { id: LanguageOption; label: string }[]
            ).map((opt) => {
              const active = formData.language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setField('language', opt.id)}
                  disabled={loading}
                  aria-pressed={active}
                  className={`min-h-[44px] px-2 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                    active
                      ? 'bg-[#FF7A1A] text-black shadow-sm font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Option */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FF7A1A]" />
            Duration
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            {(
              [
                { val: 30, label: '30s' },
                { val: 60, label: '60s' },
                { val: 90, label: '90s' },
              ] as { val: LengthOption; label: string }[]
            ).map((opt) => {
              const active = formData.length === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setField('length', opt.val)}
                  disabled={loading}
                  aria-pressed={active}
                  className={`min-h-[44px] px-2 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                    active
                      ? 'bg-[#FF7A1A] text-black shadow-sm font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Option */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-[#FF7A1A]" />
            Tone
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            {(
              [
                { id: 'hype', label: '🔥 Hype' },
                { id: 'funny', label: '😂 Funny' },
                { id: 'informative', label: '💡 Info' },
              ] as { id: ToneOption; label: string }[]
            ).map((opt) => {
              const active = formData.tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setField('tone', opt.id)}
                  disabled={loading}
                  aria-pressed={active}
                  className={`min-h-[44px] px-2 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                    active
                      ? 'bg-[#FF7A1A] text-black shadow-sm font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Magnetic Hover Generate Button */}
      <MagneticButton
        type="submit"
        disabled={isButtonDisabled}
        className="w-full min-h-[54px] sm:min-h-[58px] py-3.5 px-6 font-extrabold text-base sm:text-lg text-black bg-[#FF7A1A] hover:bg-[#ff8933] disabled:opacity-50 disabled:cursor-not-allowed shadow-orange-glow hover:shadow-orange-glow-lg transition-all"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin shrink-0" />
            <span>Viral Script Tayyar Ho Rahi Hai...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5">
            <Flame className="w-5 h-5 fill-current text-black group-hover:scale-110 transition-transform shrink-0" />
            <span>Generate Viral Script ({formData.length}s)</span>
          </div>
        )}
      </MagneticButton>
    </form>
  );
}
