import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Layers,
} from 'lucide-react';
import { LinkedInContent } from '../../types';

interface LinkedInViewProps {
  content: LinkedInContent;
  onUpdateContent: (updated: LinkedInContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  onOpenVoiceTuner?: () => void;
  isRegenerating?: boolean;
}

export const LinkedInView: React.FC<LinkedInViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  onOpenVoiceTuner,
  isRegenerating = false,
}) => {
  // Primary post is variations[0] by default
  const primaryVariation = content.variations[0] || {
    title: 'Primary Publish-Ready Post',
    angle: 'Direct founder reflection and principles',
    content: 'No content available.',
  };

  const [activeAngleIdx, setActiveAngleIdx] = useState(0);
  const activeVariation = content.variations[activeAngleIdx] || primaryVariation;

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(activeVariation.content);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showSupportingTools, setShowSupportingTools] = useState(false);

  // Sync draft when switching angle
  const handleSelectAngle = (idx: number) => {
    setActiveAngleIdx(idx);
    setDraftContent(content.variations[idx]?.content || '');
    setIsEditing(false);
  };

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = () => {
    const updated = [...content.variations];
    updated[activeAngleIdx] = {
      ...updated[activeAngleIdx],
      content: draftContent,
    };
    onUpdateContent({
      ...content,
      variations: updated,
    });
    setIsEditing(false);
  };

  // Swap an alternative hook into the active post
  const handleSwapHook = (hookText: string) => {
    const paragraphs = activeVariation.content.split('\n\n');
    const rest = paragraphs.slice(1).join('\n\n');
    const newContent = rest ? `${hookText}\n\n${rest}` : hookText;
    setDraftContent(newContent);
    const updated = [...content.variations];
    updated[activeAngleIdx] = {
      ...updated[activeAngleIdx],
      content: newContent,
    };
    onUpdateContent({
      ...content,
      variations: updated,
    });
  };

  // Fallback 2 alternative hooks if not explicitly provided
  const alternativeHooks =
    content.alternativeHooks && content.alternativeHooks.length > 0
      ? content.alternativeHooks.slice(0, 2)
      : [
          'The hardest lesson we learned early on was this:',
          'Most advice on this problem focuses on the wrong variable.',
        ];

  return (
    <div id="linkedin-platform-view" className="space-y-4">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0a66c2] flex items-center justify-center font-bold text-white text-xs">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f0f2f5]">LinkedIn Post Package</h3>
              <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-emerald-400 border border-[#262b30]">
                Publish-Ready
              </span>
            </div>
            <p className="text-xs text-[#9ba3af] mt-0.5">
              1 Complete Post · 2 Alternative Hooks · Mobile-Optimized Paragraphs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="linkedin-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {onOpenVoiceTuner && (
            <button
              id="linkedin-tune-voice-btn"
              onClick={onOpenVoiceTuner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              title="Tune voice feedback"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tune Voice</span>
            </button>
          )}

          <button
            id="linkedin-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RESULT: COMPLETE PUBLISH-READY POST */}
      <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262b30]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af]">
                {activeAngleIdx === 0 ? 'Primary Publish-Ready Post' : `Alternative Angle: ${activeVariation.title}`}
              </span>
            </div>
            <p className="text-[11px] text-[#9ba3af] mt-0.5">
              {activeVariation.angle || 'Clear argument, logical progression, natural whitespace.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="linkedin-edit-toggle-btn"
              onClick={() => {
                setDraftContent(activeVariation.content);
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>

            <button
              id="linkedin-copy-active-btn"
              onClick={() => handleCopy(activeVariation.content, 'LinkedIn Post', `var-${activeAngleIdx}`)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              {copiedId === `var-${activeAngleIdx}` ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Post</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={12}
              className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-4 text-sm text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed resize-y"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9ba3af] hover:text-[#f0f2f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Save Post
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] text-[#f0f2f5] text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30">
            {activeVariation.content}
          </div>
        )}
      </div>

      {/* OPTIONAL SUPPORTING TOOLS: ACCORDION (SECONDARY BY DEFAULT) */}
      <div className="rounded-xl bg-[#1d2125] border border-[#262b30] overflow-hidden">
        <button
          onClick={() => setShowSupportingTools(!showSupportingTools)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Optional Supporting Tools (2 Alternative Hooks & Other Angles)</span>
          </div>
          {showSupportingTools ? (
            <ChevronUp className="w-4 h-4 text-[#9ba3af]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#9ba3af]" />
          )}
        </button>

        {showSupportingTools && (
          <div className="p-4 pt-0 border-t border-[#262b30] space-y-4 text-xs">
            {/* 2 Alternative Opening Hooks */}
            <div className="space-y-2 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                2 Alternative Opening Hooks
              </span>
              <p className="text-[11px] text-[#9ba3af]">
                Test a different opening hook before publishing. Click &quot;Swap Hook&quot; to apply it directly to the post above.
              </p>

              <div className="space-y-2 pt-1">
                {alternativeHooks.map((hook, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 rounded-lg bg-[#16191c] border border-[#262b30] gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-emerald-400 font-bold mt-0.5">#{idx + 1}</span>
                      <p className="text-[#f0f2f5] font-medium leading-relaxed">{hook}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSwapHook(hook)}
                        className="px-2.5 py-1 rounded text-[10px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
                        title="Swap as the opening line of the post"
                      >
                        Swap Hook
                      </button>
                      <button
                        onClick={() => handleCopy(hook, `Opening Hook #${idx + 1}`, `li-hook-${idx}`)}
                        className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
                        title="Copy hook"
                      >
                        {copiedId === `li-hook-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Variations/Angles */}
            {content.variations.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-[#262b30]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                  Other Angles Available
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {content.variations.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAngle(idx)}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        activeAngleIdx === idx
                          ? 'bg-[#22272b] border-emerald-500/50 text-[#f0f2f5]'
                          : 'bg-[#16191c] border-[#262b30] text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#1d2125]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-[#f0f2f5]">{v.title}</span>
                        {idx === 0 && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9ba3af] line-clamp-2">{v.angle}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
