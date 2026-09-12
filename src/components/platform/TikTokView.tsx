import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Video,
  Play,
  Clock,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { TikTokContent, TikTokScript } from '../../types';

interface TikTokViewProps {
  content: TikTokContent;
  onUpdateContent: (updated: TikTokContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  isRegenerating?: boolean;
}

export const TikTokView: React.FC<TikTokViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  isRegenerating = false,
}) => {
  const [activeScriptIdx, setActiveScriptIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit drafts
  const [draftHook, setDraftHook] = useState('');
  const [draftSpoken, setDraftSpoken] = useState('');
  const [draftCta, setDraftCta] = useState('');

  const activeScript = content.scripts[activeScriptIdx] || content.scripts[0];

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (script: TikTokScript, idx: number) => {
    setDraftHook(script.hook);
    setDraftSpoken(script.spokenScript);
    setDraftCta(script.callToAction);
    setEditingIdx(idx);
  };

  const handleSaveEdit = (idx: number) => {
    const updatedScripts = [...content.scripts];
    updatedScripts[idx] = {
      ...updatedScripts[idx],
      hook: draftHook,
      spokenScript: draftSpoken,
      callToAction: draftCta,
    };
    onUpdateContent({
      ...content,
      scripts: updatedScripts,
    });
    setEditingIdx(null);
  };

  const formatFullScriptForCopy = (script: TikTokScript) => {
    return `[HOOK (0-3s)]\n${script.hook}\n\n[SPOKEN SCRIPT]\n${script.spokenScript}\n\n[ON-SCREEN TEXT CUES]\n${script.onScreenText.map((t) => `• ${t}`).join('\n')}\n\n[CALL TO ACTION]\n${script.callToAction}`;
  };

  return (
    <div id="tiktok-platform-view" className="space-y-6">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-400 flex items-center justify-center font-bold text-black text-xs">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">TikTok & Short-Form Video Scripts</h3>
            <p className="text-xs text-zinc-400">
              3 High-Retention Scripts • 3s Curiosity Hook • On-Screen Cues • Natural CTAs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="tiktok-copy-active-btn"
            onClick={() =>
              handleCopy(
                formatFullScriptForCopy(activeScript),
                `TikTok Script: ${activeScript.title}`,
                `script-${activeScriptIdx}`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {copiedId === `script-${activeScriptIdx}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Full Script</span>
          </button>

          <button
            id="tiktok-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Regenerate Scripts</span>
          </button>

          <button
            id="tiktok-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>
        </div>
      </div>

      {/* Script Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {content.scripts.map((script, idx) => (
          <button
            key={idx}
            id={`tiktok-script-tab-${idx}`}
            onClick={() => {
              setActiveScriptIdx(idx);
              setEditingIdx(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeScriptIdx === idx
                ? 'bg-zinc-800 text-white border border-rose-500/40 shadow-sm'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800/80'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 text-[10px] flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <span>{script.title}</span>
            {script.estimatedDuration && (
              <span className="text-[10px] text-zinc-400 font-mono">({script.estimatedDuration})</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Script Card */}
      {activeScript && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Script Details */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">{activeScript.title}</h4>
                  {activeScript.estimatedDuration && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {activeScript.estimatedDuration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="edit-tiktok-active-btn"
                    onClick={() => {
                      if (editingIdx === activeScriptIdx) {
                        handleSaveEdit(activeScriptIdx);
                      } else {
                        handleStartEdit(activeScript, activeScriptIdx);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title={editingIdx === activeScriptIdx ? 'Save' : 'Edit Script'}
                  >
                    {editingIdx === activeScriptIdx ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    id="copy-tiktok-active-btn"
                    onClick={() =>
                      handleCopy(
                        formatFullScriptForCopy(activeScript),
                        activeScript.title,
                        `script-${activeScriptIdx}`
                      )
                    }
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Copy full script"
                  >
                    {copiedId === `script-${activeScriptIdx}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hook Section (0-3s) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-950 border border-rose-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> First 3 Seconds Hook (Visual & Spoken)
                  </span>
                  <button
                    onClick={() => handleCopy(activeScript.hook, 'Video Hook', 'hook-copy')}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                {editingIdx === activeScriptIdx ? (
                  <input
                    value={draftHook}
                    onChange={(e) => setDraftHook(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 font-semibold focus:outline-hidden focus:border-rose-500"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-bold text-zinc-100 leading-snug">
                    "{activeScript.hook}"
                  </p>
                )}
              </div>

              {/* Spoken Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Spoken Voiceover / Dialogue
                  </span>
                  <button
                    onClick={() => handleCopy(activeScript.spokenScript, 'Spoken Voiceover', 'spoken-copy')}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {editingIdx === activeScriptIdx ? (
                  <textarea
                    value={draftSpoken}
                    onChange={(e) => setDraftSpoken(e.target.value)}
                    rows={8}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-3.5 text-xs sm:text-sm text-zinc-100 leading-relaxed font-sans focus:outline-hidden focus:border-indigo-500 resize-y"
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
                    {activeScript.spokenScript}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                  Verbal Call to Action
                </span>
                {editingIdx === activeScriptIdx ? (
                  <input
                    value={draftCta}
                    onChange={(e) => setDraftCta(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                    {activeScript.callToAction}
                  </p>
                )}
              </div>

              {editingIdx === activeScriptIdx && (
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingIdx(null)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(activeScriptIdx)}
                    className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: On-Screen Text Suggestions & Teleprompter Card */}
          <div className="lg:col-span-4 space-y-4">
            {/* On-screen text suggestions */}
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> On-Screen Text Overlays
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add these captions on screen during video editing to maximize silent retention:
              </p>

              <div className="space-y-2">
                {activeScript.onScreenText.map((cue, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs font-medium text-cyan-200"
                  >
                    <span>{cue}</span>
                    <button
                      onClick={() => handleCopy(cue, 'Text Overlay Cue', `cue-${i}`)}
                      className="p-1 text-zinc-500 hover:text-white"
                      title="Copy Overlay"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teleprompter quick card */}
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
                Recording Pacing Guide
              </span>
              <ul className="text-xs text-zinc-400 space-y-1.5">
                <li>• Hook: Deliver with zero hesitation in first 2.5s.</li>
                <li>• Cuts: Jump cut every 4-6 seconds to maintain tempo.</li>
                <li>• Tone: Conversational, eye-contact with lens.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
