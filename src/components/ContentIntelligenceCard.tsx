import React, { useState } from 'react';
import {
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { ContentIntelligence } from '../types';

interface ContentIntelligenceCardProps {
  intelligence: ContentIntelligence;
  onCopy: (text: string, label: string) => void;
  defaultExpanded?: boolean;
}

export const ContentIntelligenceCard: React.FC<ContentIntelligenceCardProps> = ({
  intelligence,
  onCopy,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="content-intelligence-card"
      className="rounded-xl bg-[#1d2125] border border-[#262b30] overflow-hidden transition-all"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <span className="font-bold text-[#f0f2f5]">Content Insights & Spin-Off Ideas</span>
            <span className="text-[11px] text-[#9ba3af] font-normal ml-2">
              (Optional topic suggestions & evidence notes)
            </span>
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#9ba3af]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#9ba3af]" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-[#262b30] space-y-4 text-xs">
          {/* Core Takeaway & Angle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="p-3.5 rounded-lg bg-[#16191c] border border-[#262b30] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ba3af]">
                  Core Takeaway
                </span>
                <button
                  onClick={() => handleCopy(intelligence.coreMessage, 'Core Takeaway', 'core')}
                  className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5]"
                  title="Copy takeaway"
                >
                  {copiedId === 'core' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#f0f2f5] leading-relaxed font-medium">
                {intelligence.coreMessage}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#16191c] border border-[#262b30] space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                Recommended Angle
              </span>
              <p className="text-xs text-[#cbd2d9] leading-relaxed">
                {intelligence.bestAngle}
              </p>
            </div>
          </div>

          {/* Spin-off Content Ideas */}
          {intelligence.contentOpportunities && intelligence.contentOpportunities.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                Spin-Off Topic Ideas (For Future Posts)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intelligence.contentOpportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-2.5 rounded-lg bg-[#16191c] border border-[#262b30] gap-2"
                  >
                    <p className="text-[#cbd2d9] text-[11px] leading-relaxed">{opp}</p>
                    <button
                      onClick={() => handleCopy(opp, `Spin-off #${idx + 1}`, `opp-${idx}`)}
                      className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] shrink-0"
                    >
                      {copiedId === `opp-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence & Proof Suggestions */}
          {intelligence.missingContextNotes && intelligence.missingContextNotes.length > 0 && (
            <div className="p-3 rounded-lg bg-[#16191c] border border-[#262b30] flex items-start gap-2.5 text-[11px] text-[#cbd2d9]">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#f0f2f5] font-semibold block mb-0.5">
                  Evidence & Proof Note:
                </strong>
                {intelligence.missingContextNotes.join(' ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
