import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  MessageSquare,
  Sparkles,
  Share2,
  CheckCheck,
  Hash,
} from 'lucide-react';
import { XContent } from '../../types';

interface XViewProps {
  content: XContent;
  onUpdateContent: (updated: XContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  isRegenerating?: boolean;
}

export const XView: React.FC<XViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  isRegenerating = false,
}) => {
  // Editing states
  const [editingStandalone, setEditingStandalone] = useState(false);
  const [standaloneDraft, setStandaloneDraft] = useState(content.standalonePost);

  const [editingThreadIdx, setEditingThreadIdx] = useState<number | null>(null);
  const [threadDraft, setThreadDraft] = useState<string>('');

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, sectionId: string) => {
    onCopy(text, label);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveStandalone = () => {
    onUpdateContent({
      ...content,
      standalonePost: standaloneDraft,
    });
    setEditingStandalone(false);
  };

  const handleSaveThreadItem = (idx: number) => {
    const updatedThread = [...content.thread];
    updatedThread[idx] = threadDraft;
    onUpdateContent({
      ...content,
      thread: updatedThread,
    });
    setEditingThreadIdx(null);
  };

  const handleCopyFullThread = () => {
    const fullText = content.thread.join('\n\n---\n\n');
    handleCopy(fullText, 'Complete X Thread', 'full-thread');
  };

  return (
    <div id="x-platform-view" className="space-y-6">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black border border-zinc-700 flex items-center justify-center font-bold text-white text-xs">
            𝕏
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">X Content Suite</h3>
            <p className="text-xs text-zinc-400">
              5 Hooks • 1 Standalone Post • 1 Cohesive Thread • 3 Alternative Closings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="x-copy-all-btn"
            onClick={handleCopyFullThread}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {copiedSection === 'full-thread' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Full Thread</span>
          </button>

          <button
            id="x-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Regenerate X</span>
          </button>

          <button
            id="x-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: 5 Hook options & Closing lines */}
        <div className="lg:col-span-5 space-y-6">
          {/* 5 Hooks */}
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 5 Hook Options
              </span>
              <span className="text-[11px] text-zinc-400">First line test</span>
            </div>

            <div className="space-y-2">
              {content.hooks.map((hook, idx) => (
                <div
                  key={idx}
                  id={`x-hook-${idx}`}
                  className="group flex items-start justify-between p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
                >
                  <div className="flex items-start gap-2.5 pr-2">
                    <span className="font-mono text-zinc-400 font-bold mt-0.5">#{idx + 1}</span>
                    <p className="text-zinc-200 font-medium leading-relaxed">{hook}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(hook, `X Hook #${idx + 1}`, `hook-${idx}`)}
                    className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                    title="Copy Hook"
                  >
                    {copiedSection === `hook-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Alternative Closing lines */}
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> 3 Alternative Closings
              </span>
              <span className="text-[11px] text-zinc-400">CTA variations</span>
            </div>

            <div className="space-y-2">
              {content.closingLines.map((closing, idx) => (
                <div
                  key={idx}
                  id={`x-closing-${idx}`}
                  className="group flex items-start justify-between p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
                >
                  <p className="text-zinc-200 font-medium leading-relaxed pr-2">{closing}</p>
                  <button
                    onClick={() => handleCopy(closing, `Closing Line #${idx + 1}`, `closing-${idx}`)}
                    className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                    title="Copy Closing Line"
                  >
                    {copiedSection === `closing-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Standalone Post */}
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Standalone Post
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  ({(editingStandalone ? standaloneDraft : content.standalonePost).length} chars)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="edit-standalone-btn"
                  onClick={() => {
                    if (editingStandalone) {
                      handleSaveStandalone();
                    } else {
                      setStandaloneDraft(content.standalonePost);
                      setEditingStandalone(true);
                    }
                  }}
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title={editingStandalone ? 'Save changes' : 'Edit text'}
                >
                  {editingStandalone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Edit3 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  id="copy-standalone-btn"
                  onClick={() =>
                    handleCopy(
                      editingStandalone ? standaloneDraft : content.standalonePost,
                      'X Standalone Post',
                      'standalone'
                    )
                  }
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Copy Post"
                >
                  {copiedSection === 'standalone' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {editingStandalone ? (
              <div className="space-y-2">
                <textarea
                  id="standalone-draft-textarea"
                  value={standaloneDraft}
                  onChange={(e) => setStandaloneDraft(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-700 p-3 text-xs text-zinc-100 focus:outline-hidden focus:border-indigo-500 font-sans resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingStandalone(false)}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStandalone}
                    className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                  >
                    Save Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                {content.standalonePost}
              </div>
            )}
          </div>
        </div>

        {/* Right column: The Cohesive Thread */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h4 className="text-sm font-bold text-white">Full Thread Breakdown</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {content.thread.length} Tweets
                </span>
              </div>
              <button
                id="copy-thread-header-btn"
                onClick={handleCopyFullThread}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copiedSection === 'full-thread' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Tweets</span>
                  </>
                )}
              </button>
            </div>

            {/* Thread chain items */}
            <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:bg-zinc-800/90 before:pointer-events-none">
              {content.thread.map((tweet, idx) => {
                const isEditing = editingThreadIdx === idx;
                return (
                  <div
                    key={idx}
                    id={`x-thread-item-${idx}`}
                    className="relative pl-9 group"
                  >
                    {/* Tweet counter bullet */}
                    <div className="absolute left-1.5 top-3 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono font-bold text-indigo-300 flex items-center justify-center z-10">
                      {idx + 1}
                    </div>

                    <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/90 group-hover:border-zinc-700/80 p-3.5 sm:p-4 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-900">
                        <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                          Tweet {idx + 1} of {content.thread.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (isEditing) {
                                handleSaveThreadItem(idx);
                              } else {
                                setThreadDraft(tweet);
                                setEditingThreadIdx(idx);
                              }
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title={isEditing ? 'Save' : 'Edit tweet'}
                          >
                            {isEditing ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Edit3 className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(tweet, `Tweet ${idx + 1}`, `tweet-${idx}`)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Copy single tweet"
                          >
                            {copiedSection === `tweet-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={threadDraft}
                            onChange={(e) => setThreadDraft(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-100 focus:outline-hidden focus:border-indigo-500 font-sans resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingThreadIdx(null)}
                              className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveThreadItem(idx)}
                              className="px-2.5 py-0.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                          {tweet}
                        </p>
                      )}
                    </div>
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
