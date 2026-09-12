import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Linkedin,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { LinkedInContent, LinkedInVariation } from '../../types';

interface LinkedInViewProps {
  content: LinkedInContent;
  onUpdateContent: (updated: LinkedInContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  isRegenerating?: boolean;
}

export const LinkedInView: React.FC<LinkedInViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  isRegenerating = false,
}) => {
  const [activeVariationIdx, setActiveVariationIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeVariation = content.variations[activeVariationIdx] || content.variations[0];

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveEdit = (idx: number) => {
    const updatedVariations = [...content.variations];
    updatedVariations[idx] = {
      ...updatedVariations[idx],
      content: editDraft,
    };
    onUpdateContent({
      ...content,
      variations: updatedVariations,
    });
    setEditingIdx(null);
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div id="linkedin-platform-view" className="space-y-6">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0a66c2] flex items-center justify-center font-bold text-white text-xs">
            in
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">LinkedIn Content Suite</h3>
            <p className="text-xs text-zinc-400">
              3 Distinct Post Angles • High-Signal Whitespace • Hook Before "...see more"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="linkedin-copy-active-btn"
            onClick={() =>
              handleCopy(
                activeVariation.content,
                `LinkedIn Post: ${activeVariation.title}`,
                `var-${activeVariationIdx}`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {copiedId === `var-${activeVariationIdx}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Active Post</span>
          </button>

          <button
            id="linkedin-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Regenerate LinkedIn</span>
          </button>

          <button
            id="linkedin-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>
        </div>
      </div>

      {/* Variation Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {content.variations.map((variation, idx) => (
          <button
            key={idx}
            id={`linkedin-variation-tab-${idx}`}
            onClick={() => {
              setActiveVariationIdx(idx);
              setEditingIdx(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeVariationIdx === idx
                ? 'bg-zinc-800 text-white border border-indigo-500/40 shadow-sm'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800/80'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-700 text-[10px] flex items-center justify-center font-bold">
              {idx + 1}
            </span>
            <span>{variation.title}</span>
          </button>
        ))}
      </div>

      {/* Active Variation Reader & Editor */}
      {activeVariation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main post view */}
          <div className="lg:col-span-8">
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div>
                  <h4 className="text-sm font-bold text-white">{activeVariation.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{activeVariation.angle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {calculateWordCount(
                      editingIdx === activeVariationIdx ? editDraft : activeVariation.content
                    )}{' '}
                    words
                  </span>
                  <button
                    id="edit-linkedin-active-btn"
                    onClick={() => {
                      if (editingIdx === activeVariationIdx) {
                        handleSaveEdit(activeVariationIdx);
                      } else {
                        setEditDraft(activeVariation.content);
                        setEditingIdx(activeVariationIdx);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title={editingIdx === activeVariationIdx ? 'Save' : 'Edit Post'}
                  >
                    {editingIdx === activeVariationIdx ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    id="copy-linkedin-active-icon-btn"
                    onClick={() =>
                      handleCopy(
                        editingIdx === activeVariationIdx ? editDraft : activeVariation.content,
                        activeVariation.title,
                        `var-${activeVariationIdx}`
                      )
                    }
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Copy Post"
                  >
                    {copiedId === `var-${activeVariationIdx}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {editingIdx === activeVariationIdx ? (
                <div className="space-y-3">
                  <textarea
                    id="linkedin-edit-textarea"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={14}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500 font-sans leading-relaxed resize-y"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(activeVariationIdx)}
                      className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 font-sans text-sm text-zinc-200 leading-relaxed whitespace-pre-line select-text">
                  {activeVariation.content}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Feed Preview Simulation & Anatomy */}
          <div className="lg:col-span-4 space-y-4">
            {/* Feed Hook Inspector */}
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Mobile Feed Fold Check
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                LinkedIn truncates after ~140 characters. Here is what users see in feed before clicking "...see more":
              </p>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 text-xs text-zinc-300 font-medium">
                <p className="line-clamp-2">
                  {activeVariation.content.split('\n')[0]}
                </p>
                <span className="text-[#0a66c2] font-semibold text-[11px] mt-1 inline-block">
                  ...see more
                </span>
              </div>
            </div>

            {/* Quick Actions List for all variations */}
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 block">
                All Variations at a Glance
              </span>

              <div className="space-y-2">
                {content.variations.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveVariationIdx(i)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      activeVariationIdx === i
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-semibold">{v.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(v.content, v.title, `var-mini-${i}`);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                      title="Quick Copy"
                    >
                      {copiedId === `var-mini-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
