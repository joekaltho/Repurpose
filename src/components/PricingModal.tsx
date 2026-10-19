import React, { useState } from 'react';
import {
  Coins,
  X,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Layers,
  Info,
  Clock,
} from 'lucide-react';
import { CreditAccount } from '../types';
import { CREDIT_CONFIG, DEFAULT_FREE_ALLOWANCE } from '../config/credits';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditAccount: CreditAccount;
  onUpdateAccount?: (updated: CreditAccount) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  creditAccount,
  onNotify,
}) => {
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [founderNotes, setFounderNotes] = useState('');
  const [publishingFrequency, setPublishingFrequency] = useState('2-3 times per week');

  if (!isOpen) return null;

  const isLowCredits = creditAccount.balance < 8;

  const handleSendQuotaRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    onNotify(
      'success',
      'Quota increase request received! Our team will contact you shortly.'
    );
  };

  return (
    <div
      id="upgrade-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="upgrade-modal"
        className="w-full max-w-2xl rounded-2xl bg-[#1d2125] border border-[#2e343b] p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-[#cbd2d9]"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#262b30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f0f2f5] tracking-tight">
                Credits & Capacity
              </h2>
              <p className="text-xs text-[#9ba3af] mt-0.5">
                Understand your allowance, operation costs, and options for sustained usage.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance & Allowance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#16191c] border border-[#262b30]">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#9ba3af] uppercase tracking-wider block">
              Remaining Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono tabular-nums ${isLowCredits ? 'text-amber-400' : 'text-[#f0f2f5]'}`}>
                {creditAccount.balance}
              </span>
              <span className="text-xs text-[#9ba3af] font-medium">credits</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#9ba3af] uppercase tracking-wider block">
              Free Allowance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#f0f2f5] font-mono tabular-nums">
                {creditAccount.freeAllowance || DEFAULT_FREE_ALLOWANCE}
              </span>
              <span className="text-xs text-[#9ba3af] font-medium">initial credits</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#9ba3af] uppercase tracking-wider block">
              Total Credits Used
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#cbd2d9] font-mono tabular-nums">
                {creditAccount.totalUsed || 0}
              </span>
              <span className="text-xs text-[#9ba3af] font-medium">credits</span>
            </div>
          </div>
        </div>

        {/* Transparent Operation Cost Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#cbd2d9]">
              Configured Operation Costs
            </h3>
            <span className="text-[11px] text-[#9ba3af]">
              Only charged when generation succeeds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#16191c] border border-[#262b30] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#f0f2f5]">Single Platform Repurpose</p>
                <p className="text-[11px] text-[#9ba3af]">e.g., Instagram carousel + captions only</p>
              </div>
              <span className="font-mono font-semibold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                4 credits
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#16191c] border border-[#262b30] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#f0f2f5]">Full 4-Platform Suite</p>
                <p className="text-[11px] text-[#9ba3af]">X + LinkedIn + TikTok + Instagram</p>
              </div>
              <span className="font-mono font-semibold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                13 credits
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#16191c] border border-[#262b30] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#f0f2f5]">Single Platform Regenerate</p>
                <p className="text-[11px] text-[#9ba3af]">Re-run one platform with new voice feedback</p>
              </div>
              <span className="font-mono font-semibold text-[#cbd2d9] px-2.5 py-1 rounded-lg bg-[#22272b] border border-[#2e343b]">
                {CREDIT_CONFIG.REGENERATE_SINGLE_PLATFORM} credits
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#16191c] border border-[#262b30] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#f0f2f5]">Voice Fingerprint Analysis</p>
                <p className="text-[11px] text-[#9ba3af]">Deep Gemini extraction from writing samples</p>
              </div>
              <span className="font-mono font-semibold text-[#cbd2d9] px-2.5 py-1 rounded-lg bg-[#22272b] border border-[#2e343b]">
                {CREDIT_CONFIG.VOICE_FINGERPRINT_ANALYSIS} credits
              </span>
            </div>
          </div>
        </div>

        {/* Why Upgrade - Honest Value Proposition */}
        <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#cbd2d9] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Why founders upgrade to higher capacity</span>
          </h3>

          <ul className="text-xs text-[#cbd2d9] space-y-2">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#f0f2f5] font-semibold">Sustained Weekly Publishing:</strong> Repurpose multiple product updates, technical postmortems, and founder lessons every week without monthly credit interruptions.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#f0f2f5] font-semibold">Full Multi-Platform Workflows:</strong> Generate platform-native distributions across all platforms simultaneously instead of choosing one.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#f0f2f5] font-semibold">Long-Term Voice Memory:</strong> Continuous accumulation of learned feedback rules tailored to your company&apos;s growing brand.
              </span>
            </li>
          </ul>
        </div>

        {/* Guaranteed Draft Accessibility Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9]">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#f0f2f5] font-semibold">Your content is always safe:</strong> Even if your generation allowance is exhausted, you retain unlimited access to view, edit, search, and export all your existing drafts, templates, and library items.
          </span>
        </div>

        {/* Upgrade / Quota Request Form */}
        <div className="pt-2 border-t border-[#262b30]">
          {requestSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1.5">
              <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Quota Request Received</span>
              </p>
              <p className="text-xs text-[#9ba3af]">
                We&apos;ll contact you with custom capacity options tailored to your publishing frequency.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendQuotaRequest} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#f0f2f5]">
                  Request Higher Quota / Plan Upgrade
                </span>
                <span className="text-[11px] text-[#9ba3af]">Direct founder support</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#cbd2d9] block mb-1">
                    Expected Publishing Frequency
                  </label>
                  <select
                    value={publishingFrequency}
                    onChange={(e) => setPublishingFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="1 time per week">1 time per week (Light)</option>
                    <option value="2-3 times per week">2-3 times per week (Active Founder)</option>
                    <option value="Daily / High-Frequency">Daily / High-Frequency (Scaling Brand)</option>
                    <option value="Agency / Multiple Startups">Agency / Multiple Startups</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#cbd2d9] block mb-1">
                    Tell us about your startup & audience
                  </label>
                  <input
                    type="text"
                    value={founderNotes}
                    onChange={(e) => setFounderNotes(e.target.value)}
                    placeholder="e.g. B2B DevTools, publishing engineering breakdowns"
                    className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] placeholder-[#9ba3af] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] bg-[#22272b] hover:bg-[#282e34] border border-[#2e343b] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Quota Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
