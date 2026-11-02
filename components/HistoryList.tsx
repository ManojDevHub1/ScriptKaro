'use client';

import React from 'react';
import { HistoryItem } from '@/lib/types';
import { History, Trash2, ArrowUpRight, Clock } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryList({
  items,
  onSelect,
  onDelete,
  onClearAll,
  activeId,
}: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-5 sm:p-6 text-center border border-white/[0.08]">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-2 text-gray-500">
          <History className="w-6 h-6" />
        </div>
        <p className="text-sm sm:text-base font-semibold text-gray-200">No saved scripts yet</p>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Generate your first script and it will be saved here automatically (last 10).
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Script History"
      className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] space-y-3 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF7A1A] shrink-0" />
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            Script History
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-gray-300 font-medium">
            {items.length}/10
          </span>
        </div>

        {/* 44px Touch Target for Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-[44px] px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 active:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          title="Clear all saved scripts"
          aria-label="Clear all saved scripts"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* List with max height for mobile landscape and phone screens */}
      <div className="space-y-2 max-h-[50vh] sm:max-h-[380px] overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(item);
                }
              }}
              aria-label={`Load script for ${item.request.topic}`}
              className={`group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all border min-h-[54px] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#FF7A1A] focus-visible:outline-none ${
                isActive
                  ? 'bg-[#FF7A1A]/10 border-[#FF7A1A]/40 shadow-sm'
                  : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.09]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[#FF7A1A] transition-colors">
                  {item.request.topic}
                </p>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-300">
                    {item.request.length}s
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF7A1A]/15 text-[#FF7A1A]">
                    {item.request.language}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* 44x44px Touch Targets for Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  aria-label={`Delete ${item.request.topic} from history`}
                  className="min-h-[44px] min-w-[44px] rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/[0.05] active:bg-red-500/15 transition-all flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="min-h-[44px] min-w-[36px] flex items-center justify-center text-gray-400 group-hover:text-[#FF7A1A] transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
