'use client';

import React, { useState, useEffect } from 'react';
import {
  GenerateRequest,
  GenerateResponse,
  HistoryItem,
} from '@/lib/types';
import TopicForm from '@/components/TopicForm';
import ResultCard from '@/components/ResultCard';
import ScriptView from '@/components/ScriptView';
import HistoryList from '@/components/HistoryList';
import ClapperLoader from '@/components/ClapperLoader';
import AuroraBackground from '@/components/AuroraBackground';
import HeroTitle from '@/components/HeroTitle';
import Toast from '@/components/Toast';
import SettingsModal from '@/components/SettingsModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { fireViralConfetti } from '@/lib/confetti';
import {
  Sparkles,
  Flame,
  RefreshCw,
  Copy,
  Check,
  Video,
  Hash,
  FileText,
  AlertCircle,
  History as HistoryIcon,
  Key,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'scriptkaro_history_v1';
const CUSTOM_KEY_STORAGE = 'scriptkaro_custom_gemini_key';

export default function HomePage() {
  const [formData, setFormData] = useState<GenerateRequest>({
    topic: '',
    language: 'hinglish',
    length: 60,
    tone: 'hype',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [currentRequest, setCurrentRequest] = useState<GenerateRequest | null>(null);
  const [error, setError] = useState<{ message: string; details?: string; code?: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Load history & custom key status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 10));
        }
      }
      const customKey = localStorage.getItem(CUSTOM_KEY_STORAGE);
      setHasCustomKey(Boolean(customKey));
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (req: GenerateRequest, res: GenerateResponse) => {
    try {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        request: req,
        response: res,
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.request.topic !== req.topic);
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      setActiveHistoryId(newItem.id);
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (activeHistoryId === id) {
      setActiveHistoryId(undefined);
    }
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setActiveHistoryId(undefined);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.response);
    setFormData(item.request);
    setCurrentRequest(item.request);
    setActiveHistoryId(item.id);
    setError(null);
    showToast('Loaded script from history!');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleGenerate = async (reqToUse?: GenerateRequest) => {
    // Prevent double clicks or empty requests
    if (loading) return;

    const activeReq = reqToUse || formData;
    if (!activeReq.topic.trim()) {
      setError({ message: 'Please enter a topic before generating a script.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const customKey = localStorage.getItem(CUSTOM_KEY_STORAGE)?.trim();
      if (customKey) {
        headers['x-custom-gemini-key'] = customKey;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(activeReq),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({
          message: data.error || 'Failed to generate script',
          details: data.details,
          code: data.code,
        });
        setLoading(false);
        return;
      }

      setResult(data);
      setCurrentRequest(activeReq);
      saveToHistory(activeReq, data);

      // Fire celebratory confetti on script generation success!
      fireViralConfetti();

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Generate error:', err);
      let details = err.message;
      if (err.message?.includes('GEMINI_API_KEY')) {
        details = 'Your GEMINI_API_KEY is not configured. Please paste your API key in .env.local file.';
      }
      setError({
        message: err.message || 'Script generation failed',
        details,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const handleRegenerate = () => {
    if (loading) return;
    if (currentRequest) {
      handleGenerate(currentRequest);
    } else {
      handleGenerate();
    }
  };

  // Compile full script text for 1-click clipboard copy
  const getFullPackageText = (): string => {
    if (!result) return '';
    let text = `🔥 TOPIC: ${currentRequest?.topic || formData.topic}\n`;
    text += `⏱️ DURATION: ${currentRequest?.length || formData.length}s | TONE: ${currentRequest?.tone || formData.tone}\n\n`;

    text += `=== 🎯 3 SCROLL-STOPPING HOOKS (0-3s) ===\n`;
    result.hooks.forEach((h, i) => {
      text += `Hook ${i + 1}: ${h}\n`;
    });
    text += `\n`;

    text += `=== 🎬 FULL SCENE-WISE SCRIPT ===\n`;
    result.script.forEach((scene, i) => {
      text += `[Scene ${i + 1} | ${scene.time}]\n`;
      text += `Spoken: "${scene.line}"\n`;
      if (scene.visual) {
        text += `Visual: ${scene.visual}\n`;
      }
      text += `\n`;
    });

    text += `=== 📝 CAPTION ===\n${result.caption}\n\n`;
    text += `=== #️⃣ HASHTAGS ===\n${result.hashtags.join(' ')}\n\n`;
    text += `=== 🖼️ COVER TEXT ===\n${result.coverText}\n`;

    return text;
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(getFullPackageText());
      setCopiedAll(true);
      fireViralConfetti();
      showToast('Copied full viral package to clipboard! 🔥');
      setTimeout(() => setCopiedAll(false), 2200);
    } catch (err) {
      console.error('Failed to copy full package', err);
    }
  };

  const handleCopySingleHook = async (hookText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hookText);
      setCopiedHookIndex(index);
      showToast(`Copied Hook Option ${index + 1}!`);
      setTimeout(() => setCopiedHookIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy hook', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-[100dvh] bg-[#0A0A0D] text-gray-100 flex flex-col selection:bg-[#FF7A1A]/30 selection:text-white w-full overflow-x-clip relative">
        {/* Animated Aurora Background */}
        <AuroraBackground />

        {/* Floating Toast Notification */}
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

        {/* Custom API Key Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={(key) => {
            setHasCustomKey(Boolean(key));
            showToast(key ? 'Custom Gemini Key Saved!' : 'Custom Key Removed');
          }}
        />

        {/* Top Navbar */}
        <header
          role="banner"
          className="site-header w-full border-b border-white/[0.06] -webkit-backdrop-filter backdrop-blur-md sticky top-0 z-30 bg-[#0A0A0D]/85 pt-[env(safe-area-inset-top,0px)]"
        >
          <div className="max-w-4xl 3xl:max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A1A] to-[#E65100] flex items-center justify-center shadow-orange-glow shrink-0">
                <Flame className="w-5 h-5 text-black fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    Script<span className="text-[#FF7A1A]">Karo</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FF7A1A]/20 text-[#FF7A1A] border border-[#FF7A1A]/30">
                    Gemini Flash
                  </span>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                aria-label="Settings: Custom Gemini API Key"
                className={`min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                  hasCustomKey
                    ? 'bg-[#FF7A1A]/15 text-[#FF7A1A] border border-[#FF7A1A]/35 shadow-sm'
                    : 'bg-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                <Key className="w-4 h-4 text-[#FF7A1A] shrink-0" />
                <span className="hidden xs:inline">{hasCustomKey ? 'Custom Key' : 'API Key'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                aria-expanded={showHistory}
                aria-label={`Saved scripts, ${history.length} items`}
                className={`min-h-[44px] flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                  showHistory || history.length > 0
                    ? 'bg-white/[0.06] text-gray-200 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HistoryIcon className="w-4 h-4 text-[#FF7A1A] shrink-0" />
                <span className="hidden xs:inline">Saved</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF7A1A]/20 text-[#FF7A1A] text-[10px] font-bold">
                  {history.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          className="flex-1 max-w-4xl 3xl:max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8"
        >
          {/* Animated Hero Title with Word-by-Word Reveal */}
          <HeroTitle />

          {/* Quick Platform Badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-gray-400 font-medium flex-wrap pt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF7A1A]" />
              Instagram Reels
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              YouTube Shorts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              100% Free
            </span>
          </div>

          {/* History Drawer */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <HistoryList
                items={history}
                onSelect={handleSelectHistoryItem}
                onDelete={deleteHistoryItem}
                onClearAll={clearAllHistory}
                activeId={activeHistoryId}
              />
            </motion.div>
          )}

          {/* Input Form Card with Glassmorphism */}
          <div className="glass-panel rounded-2xl p-4 xs:p-5 sm:p-7 border border-white/[0.08] shadow-glass relative w-full overflow-hidden">
            <TopicForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>

          {/* Error Alert Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-2xl bg-red-950/40 border border-red-500/40 p-4 sm:p-5 text-red-200 flex items-start gap-3 w-full shadow-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm flex-1 min-w-0">
                <p className="font-semibold text-white break-words">{error.message}</p>
                {error.details && <p className="text-xs text-red-300 leading-relaxed break-words">{error.details}</p>}

                {error.message?.includes('GEMINI_API_KEY') && (
                  <div className="mt-3 p-3 rounded-lg bg-black/50 border border-red-500/20 text-xs text-gray-300 space-y-1.5">
                    <p className="font-semibold text-white">How to fix this in 1 minute:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-300">
                      <li>Get your free Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#FF7A1A] underline">Google AI Studio</a>.</li>
                      <li>Open <code className="bg-white/10 px-1 py-0.5 rounded text-white">.env.local</code> in this project folder.</li>
                      <li>Paste: <code className="bg-white/10 px-1 py-0.5 rounded text-white">GEMINI_API_KEY=your_key_here</code></li>
                      <li>Restart the server and try again!</li>
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Animated Film-Reel / Clapperboard Loader */}
          {loading && <ClapperLoader />}

          {/* Results Section with Staggered Spring Cards */}
          {result && !loading && (
            <motion.div
              id="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5 sm:space-y-6 pt-2 w-full"
            >
              {/* Results Action Bar */}
              <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-[#FF7A1A]/35 shadow-orange-glow w-full">
                <div className="min-w-0 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Script Ready Hai! 🔥
                    </h2>
                    {result.provider && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF7A1A]/15 text-[#FF7A1A] border border-[#FF7A1A]/30 flex items-center gap-1">
                        <span>⚡ Provider:</span>
                        <span className="font-extrabold capitalize">{result.provider}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">
                    Topic: <span className="text-white font-medium">&ldquo;{currentRequest?.topic || formData.topic}&rdquo;</span>
                  </p>
                </div>

                {/* Action Buttons: 44px Touch Targets */}
                <div className="flex flex-col xs:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] text-white border border-white/[0.1] transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none"
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className={`w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                      copiedAll
                        ? 'bg-emerald-500 text-black'
                        : 'bg-[#FF7A1A] hover:bg-[#ff8933] text-black shadow-orange-glow'
                    }`}
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Copied Everything!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0" />
                        <span>Copy Full Package</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 1: 3 Hook Options */}
              <ResultCard
                title="3 Scroll-Stopping Hooks"
                badge="First 3 Seconds"
                icon={<Flame className="w-4 h-4" />}
                copyText={result.hooks.map((h, i) => `Hook ${i + 1}: ${h}`).join('\n\n')}
                copyLabel="Copy All Hooks"
                onCopySuccess={(t) => showToast(`Copied ${t}!`)}
              >
                <p className="text-xs sm:text-sm text-gray-400 mb-3.5">
                  Select any one of these hooks to record your opening 0-3 seconds:
                </p>
                <div className="space-y-3">
                  {result.hooks.map((hook, index) => {
                    const hookType = index === 0 ? 'Curiosity & FOMO' : index === 1 ? 'Pain Point' : 'Mindblown Claim';
                    const isCopied = copiedHookIndex === index;

                    return (
                      <div
                        key={index}
                        className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FF7A1A]/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF7A1A]/15 text-[#FF7A1A]">
                              Option {index + 1} • {hookType}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed break-words">
                            &ldquo;{hook}&rdquo;
                          </p>
                        </div>

                        {/* 44px Touch Target for Individual Hook */}
                        <button
                          type="button"
                          onClick={() => handleCopySingleHook(hook, index)}
                          aria-label={`Copy hook option ${index + 1}`}
                          className={`min-h-[44px] min-w-[44px] text-xs sm:text-sm px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 self-end sm:self-auto flex items-center justify-center cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35'
                              : 'bg-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
                          }`}
                        >
                          {isCopied ? 'Copied!' : 'Copy Hook'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ResultCard>

              {/* CARD 2: Scene-wise Script */}
              <ResultCard
                title="Full Reel Script (Scene-wise)"
                badge={`${currentRequest?.length || formData.length} Seconds`}
                icon={<Video className="w-4 h-4" />}
                copyText={result.script
                  .map(
                    (s, i) =>
                      `[${s.time}] (Scene ${i + 1})\nNarration: ${s.line}\nVisual: ${s.visual}`
                  )
                  .join('\n\n')}
                copyLabel="Copy Script"
                onCopySuccess={(t) => showToast(`Copied ${t}!`)}
              >
                <ScriptView
                  scenes={result.script}
                  onCopySuccess={(label) => showToast(`Copied ${label}!`)}
                />
              </ResultCard>

              {/* CARD 3: Caption */}
              <ResultCard
                title="Ready-to-Paste Caption"
                badge="Instagram & Shorts"
                icon={<FileText className="w-4 h-4" />}
                copyText={result.caption}
                copyLabel="Copy Caption"
                onCopySuccess={(t) => showToast(`Copied ${t}!`)}
              >
                <div className="rounded-xl bg-white/[0.03] p-4 sm:p-4.5 border border-white/[0.06]">
                  <p className="text-sm sm:text-base text-gray-200 whitespace-pre-line leading-relaxed font-normal break-words">
                    {result.caption}
                  </p>
                </div>
              </ResultCard>

              {/* CARD 4: Hashtags */}
              <ResultCard
                title="Viral Hashtags"
                badge={`${result.hashtags.length} Tags`}
                icon={<Hash className="w-4 h-4" />}
                copyText={result.hashtags.join(' ')}
                copyLabel="Copy Hashtags"
                onCopySuccess={(t) => showToast(`Copied ${t}!`)}
              >
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="min-h-[36px] flex items-center text-xs sm:text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-[#FF7A1A] hover:bg-[#FF7A1A]/15 border border-white/[0.06] hover:border-[#FF7A1A]/30 transition-all font-mono font-medium break-all select-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </ResultCard>

              {/* CARD 5: Thumbnail / Cover Text */}
              <ResultCard
                title="Cover / Thumbnail Text"
                badge="Max 5 Words"
                icon={<Sparkles className="w-4 h-4" />}
                copyText={result.coverText}
                copyLabel="Copy Cover Text"
                onCopySuccess={(t) => showToast(`Copied ${t}!`)}
              >
                <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-black/80 to-[#18120e] border border-[#FF7A1A]/35 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FF7A1A] mb-1.5">
                    High-CTR Cover Headline
                  </span>
                  <span className="fluid-card-title sm:text-2xl font-black text-white tracking-wide uppercase break-words px-2">
                    &ldquo;{result.coverText}&rdquo;
                  </span>
                  <p className="text-xs text-gray-400 mt-2 max-w-sm">
                    Reel cover image ya first frame ke center mein yeh bold text lagao.
                  </p>
                </div>
              </ResultCard>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="w-full border-t border-white/[0.06] py-6 sm:py-8 px-4 text-xs text-gray-400 mt-12 bg-[#08080A] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="max-w-4xl 3xl:max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-200">ScriptKaro</span>
                <span>—</span>
                <span>Topic do, viral reel script lo.</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-gray-400 flex-wrap justify-center">
                <span>Built for Indian Creators</span>
                <span>•</span>
                <span>PWA Ready</span>
                <span>•</span>
                <span>Gemini Flash</span>
              </div>
            </div>

            {/* Privacy & AI Disclaimer */}
            <div className="pt-3 border-t border-white/[0.04] text-[11px] text-gray-400 text-center sm:text-left leading-relaxed">
              <p>
                <span className="font-semibold text-gray-300">Privacy & AI Notice:</span> Your topics are processed securely in real-time to generate video ideas. We do not store personal data or sell your topics. Custom API keys are saved exclusively in your browser&apos;s localStorage and never logged on our servers. All scripts are generated by AI (Google Gemini / Groq / OpenRouter) and should be reviewed before publishing.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
