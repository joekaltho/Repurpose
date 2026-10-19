import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { GroundingFlag, SourceGroundingReport, Platform } from '../types';

interface SourceGroundingCardProps {
  report?: SourceGroundingReport;
  onSelectPlatformTab?: (platform: Platform) => void;
}

export const SourceGroundingCard: React.FC<SourceGroundingCardProps> = ({
  report,
  onSelectPlatformTab,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedFlags, setDismissedFlags] = useState<string[]>([]);

  if (!report) {
    return null;
  }

  const activeFlags = report.flags.filter((f) => !dismissedFlags.includes(f.claim));
  const isGrounded = activeFlags.length === 0;

  const handleDismiss = (claim: string) => {
    setDismissedFlags((prev) => [...prev, claim]);
  };

  return (
    <div
      id="source-grounding-card"
      className={`rounded-xl border transition-all p-3.5 sm:p-4 ${
        isGrounded
          ? 'bg-[#1d2125] border-emerald-500/25'
          : 'bg-[#1d2125] border-amber-500/35'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isGrounded
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/15 border border-amber-500/25 text-amber-400'
            }`}
          >
            {isGrounded ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#f0f2f5] flex items-center gap-1.5">
                <span>Factual Integrity & Source Grounding</span>
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  isGrounded
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                }`}
              >
                {isGrounded ? '100% Grounded' : `${activeFlags.length} Claims to Review`}
              </span>
            </div>

            <p className="text-[11px] text-[#9ba3af] mt-0.5">
              {isGrounded
                ? 'Zero invented numbers, metrics, or customer stories detected. Derived 100% from your notes.'
                : 'Potential unsupported numbers or anecdotes detected that were not in your source notes.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGrounded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Details' : 'Review Flags'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {isGrounded && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Grounded in source notes</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded flagged items list */}
      {(!isGrounded || isExpanded) && activeFlags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#262b30] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Items requiring founder confirmation before distribution:</span>
          </div>

          <div className="space-y-2">
            {activeFlags.map((flag, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#16191c] border border-[#262b30] text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      &quot;{flag.claim}&quot;
                    </span>
                    {flag.platform && flag.platform !== 'general' && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#22272b] text-[#cbd2d9] border border-[#2e343b]">
                        Platform: {flag.platform}
                      </span>
                    )}
                  </div>
                  <p className="text-[#cbd2d9] text-[11px] leading-relaxed">{flag.reason}</p>
                </div>

                <div className="flex items-center gap-2">
                  {flag.platform && flag.platform !== 'general' && onSelectPlatformTab && (
                    <button
                      onClick={() => onSelectPlatformTab(flag.platform as Platform)}
                      className="px-2.5 py-1 rounded-lg bg-[#22272b] hover:bg-[#282e34] text-[#cbd2d9] hover:text-[#f0f2f5] border border-[#2e343b] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Jump to {flag.platform}
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(flag.claim)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    I verify this is true
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#9ba3af] pt-1">
            <strong className="text-[#cbd2d9]">Note:</strong> Repurpose separates creative formatting from real-world facts. You can edit any post in the tabs to supply exact metrics.
          </p>
        </div>
      )}
    </div>
  );
};
