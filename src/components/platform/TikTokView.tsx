import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Video,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { TikTokContent, TikTokScript } from '../../types';

interface TikTokViewProps {
  content: TikTokContent;
  onUpdateContent: (updated: TikTokContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  onOpenVoiceTuner?: () => void;
  isRegenerating?: boolean;
}

export const TikTokView: React.FC<TikTokViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  onOpenVoiceTuner,
  isRegenerating = false,
}) => {
  const [activeScriptIdx, setActiveScriptIdx] = useState(0);
  const primaryScript: TikTokScript = content.scripts[activeScriptIdx] || {
    title: 'Primary Spoken Script',
    hook: 'Stop approaching this the conventional way. Here is why.',
    spokenScript: 'Here is what works in practice...',
    onScreenText: ['Point 1', 'Point 2'],
    callToAction: 'Follow for more founder breakdowns.',
    estimatedDuration: '35 seconds',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draftSpokenScript, setDraftSpokenScript] = useState(primaryScript.spokenScript);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showSupportingTools, setShowSupportingTools] = useState(false);

  const handleSelectScript = (idx: number) => {
    setActiveScriptIdx(idx);
    setDraftSpokenScript(content.scripts[idx]?.spokenScript || '');
    setIsEditing(false);
  };

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = () => {
    const updated = [...content.scripts];
    updated[activeScriptIdx] = {
      ...updated[activeScriptIdx],
      spokenScript: draftSpokenScript,
    };
    onUpdateContent({
      ...content,
      scripts: updated,
    });
    setIsEditing(false);
  };

  return (
    <div id="tiktok-platform-view" className="space-y-4">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-400 text-xs">
            ▶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f0f2f5]">TikTok & Reels Script</h3>
              <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-emerald-400 border border-[#262b30]">
                Speakable On-Camera
              </span>
            </div>
            <p className="text-xs text-[#9ba3af] mt-0.5">
              1 Complete Spoken Script · Natural Conversational Cadence · Visual Overlays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="tiktok-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {onOpenVoiceTuner && (
            <button
              id="tiktok-tune-voice-btn"
              onClick={onOpenVoiceTuner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              title="Tune voice feedback"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tune Voice</span>
            </button>
          )}

          <button
            id="tiktok-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RESULT: 1 COMPLETE VIDEO SCRIPT */}
      <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262b30]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af]">
              {primaryScript.title || 'Complete Video Script'}
            </span>
            {primaryScript.estimatedDuration && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#cbd2d9] bg-[#16191c] px-2 py-0.5 rounded-md border border-[#262b30]">
                <Clock className="w-3 h-3 text-emerald-400" />
                {primaryScript.estimatedDuration}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="tiktok-edit-btn"
              onClick={() => {
                setDraftSpokenScript(primaryScript.spokenScript);
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Script'}</span>
            </button>

            <button
              id="tiktok-copy-script-btn"
              onClick={() => handleCopy(primaryScript.spokenScript, 'Spoken Script', 'spoken-script')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              {copiedId === 'spoken-script' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Script Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Spoken Body */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draftSpokenScript}
              onChange={(e) => setDraftSpokenScript(e.target.value)}
              rows={10}
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
                Save Script
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] text-[#f0f2f5] text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30">
            {primaryScript.spokenScript}
          </div>
        )}

        {/* Separate On-Screen Text / Visual Suggestions */}
        {primaryScript.onScreenText && primaryScript.onScreenText.length > 0 && (
          <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>On-Screen Text Cues (Visual Overlays)</span>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    primaryScript.onScreenText.join('\n'),
                    'On-Screen Cues',
                    'onscreen-text'
                  )
                }
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {copiedId === 'onscreen-text' ? 'Copied' : 'Copy All Cues'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryScript.onScreenText.map((cue, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#22272b] border border-[#2e343b] text-xs text-[#cbd2d9] font-mono"
                >
                  {idx + 1}. {cue}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OPTIONAL SUPPORTING TOOLS: SCRIPT VARIATIONS ACCORDION */}
      {content.scripts.length > 1 && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] overflow-hidden">
          <button
            onClick={() => setShowSupportingTools(!showSupportingTools)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Alternative Script Formats ({content.scripts.length - 1} more available)</span>
            </div>
            {showSupportingTools ? (
              <ChevronUp className="w-4 h-4 text-[#9ba3af]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9ba3af]" />
            )}
          </button>

          {showSupportingTools && (
            <div className="p-4 pt-0 border-t border-[#262b30] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3">
              {content.scripts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectScript(idx)}
                  className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                    activeScriptIdx === idx
                      ? 'bg-[#22272b] border-emerald-500/50 text-[#f0f2f5]'
                      : 'bg-[#16191c] border-[#262b30] text-[#9ba3af] hover:text-[#f0f2f5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#f0f2f5]">{s.title}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{s.estimatedDuration}</span>
                  </div>
                  <p className="text-[11px] text-[#cbd2d9] italic line-clamp-2">&quot;{s.hook}&quot;</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
