import React, { useState } from 'react';
import {
  BrainCircuit,
  Target,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Compass,
  Quote,
} from 'lucide-react';
import { ContentIntelligence } from '../types';

interface ContentIntelligenceCardProps {
  intelligence: ContentIntelligence;
  onCopy: (text: string, label: string) => void;
}

export const ContentIntelligenceCard: React.FC<ContentIntelligenceCardProps> = ({
  intelligence,
  onCopy,
}) => {
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [copiedCore, setCopiedCore] = useState(false);

  const handleCopyHook = (hook: string, idx: number) => {
    onCopy(hook, `Hook #${idx + 1}`);
    setCopiedHookIdx(idx);
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  const handleCopyCore = () => {
    onCopy(intelligence.coreMessage, 'Core Message');
    setCopiedCore(true);
    setTimeout(() => setCopiedCore(false), 2000);
  };

  return (
    <div
      id="content-intelligence-card"
      className="rounded-2xl bg-zinc-900/90 border border-indigo-500/30 p-5 sm:p-6 shadow-xl shadow-black/40 relative overflow-hidden"
    >
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Content Intelligence
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Source Analysis
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Underlying thesis, strategic distribution angle, and hook anatomy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Core Idea & Best Angle */}
        <div className="lg:col-span-5 space-y-4">
          {/* Core Idea */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 relative group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Core Idea
              </span>
              <button
                id="copy-core-message-btn"
                onClick={handleCopyCore}
                className="opacity-80 hover:opacity-100 p-1 text-zinc-400 hover:text-white transition-opacity"
                title="Copy Core Idea"
              >
                {copiedCore ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-sm font-semibold text-zinc-100 leading-snug">
              "{intelligence.coreMessage}"
            </p>
          </div>

          {/* Best Angle */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-3.5 h-3.5" /> Best Angle for Distribution
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {intelligence.bestAngle}
            </p>
          </div>

          {/* Content Opportunities */}
          {intelligence.contentOpportunities && intelligence.contentOpportunities.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5" /> Content Opportunities
              </span>
              <ul className="space-y-1.5">
                {intelligence.contentOpportunities.map((opp, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-purple-400 font-bold mt-0.5">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Potential Hooks (5 Hooks) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 5 Extracted / Generated Hooks
              </span>
              <span className="text-[11px] text-zinc-400">Click any hook to copy</span>
            </div>

            <div className="space-y-2 flex-1">
              {intelligence.potentialHooks.map((hook, idx) => {
                const isCopied = copiedHookIdx === idx;
                return (
                  <div
                    key={idx}
                    id={`intelligence-hook-${idx}`}
                    onClick={() => handleCopyHook(hook, idx)}
                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-2.5 pr-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 mt-0.5 shrink-0">
                        0{idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-zinc-200 group-hover:text-white font-medium leading-snug">
                        {hook}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`p-1.5 rounded-md shrink-0 transition-colors ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-800'
                      }`}
                      aria-label={`Copy hook ${idx + 1}`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
