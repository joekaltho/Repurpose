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
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import { XContent } from '../../types';

interface XViewProps {
  content: XContent;
  onUpdateContent: (updated: XContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  onOpenVoiceTuner?: () => void;
  isRegenerating?: boolean;
}

export const XView: React.FC<XViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  onOpenVoiceTuner,
  isRegenerating = false,
}) => {
  // Editing states
  const [editingStandalone, setEditingStandalone] = useState(false);
  const [standaloneDraft, setStandaloneDraft] = useState(content.standalonePost);

  const [editingThreadIdx, setEditingThreadIdx] = useState<number | null>(null);
  const [threadDraft, setThreadDraft] = useState<string>('');

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showSupportingTools, setShowSupportingTools] = useState(false);

  // Active view mode between Standalone Post & Full Thread
  const [postFormat, setPostFormat] = useState<'standalone' | 'thread'>('standalone');

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

  // Replace hook into standalone post
  const handleApplyHookToStandalone = (hookText: string) => {
    const lines = content.standalonePost.split('\n\n');
    const rest = lines.slice(1).join('\n\n');
    const updated = rest ? `${hookText}\n\n${rest}` : hookText;
    setStandaloneDraft(updated);
    onUpdateContent({
      ...content,
      standalonePost: updated,
    });
  };

  // Limit hooks to 3 genuinely different options as requested
  const threeHooks = content.hooks ? content.hooks.slice(0, 3) : [];

  return (
    <div id="x-platform-view" className="space-y-4">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#16191c] border border-[#2e343b] flex items-center justify-center font-bold text-[#f0f2f5] text-xs">
            𝕏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f0f2f5]">X / Twitter Package</h3>
              <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-emerald-400 border border-[#262b30]">
                Publish-Ready
              </span>
            </div>
            <p className="text-xs text-[#9ba3af] mt-0.5">
              1 Complete Post · 1 Coherent Thread ({content.thread?.length || 5} tweets) · 3 Hook Options
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center rounded-lg bg-[#16191c] border border-[#262b30] p-0.5 text-xs">
            <button
              onClick={() => setPostFormat('standalone')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                postFormat === 'standalone'
                  ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                  : 'text-[#9ba3af] hover:text-[#f0f2f5]'
              }`}
            >
              Standalone Post
            </button>
            <button
              onClick={() => setPostFormat('thread')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                postFormat === 'thread'
                  ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                  : 'text-[#9ba3af] hover:text-[#f0f2f5]'
              }`}
            >
              Thread ({content.thread?.length || 5})
            </button>
          </div>

          <button
            id="x-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {onOpenVoiceTuner && (
            <button
              id="x-tune-voice-btn"
              onClick={onOpenVoiceTuner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              title="Give feedback to tune your voice"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tune Voice</span>
            </button>
          )}

          <button
            id="x-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RESULT 1: STANDALONE POST */}
      {postFormat === 'standalone' && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262b30]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af] flex items-center gap-1.5">
                Primary Post Output
              </span>
              <p className="text-[11px] text-[#9ba3af] mt-0.5">
                Complete, high-signal single post ready to copy and publish.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md ${
                  content.standalonePost.length > 280
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                    : 'bg-[#16191c] text-[#9ba3af] border border-[#262b30]'
                }`}
              >
                {content.standalonePost.length}/280
              </span>

              <button
                id="edit-x-standalone-btn"
                onClick={() => {
                  setStandaloneDraft(content.standalonePost);
                  setEditingStandalone(!editingStandalone);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editingStandalone ? 'Cancel' : 'Edit'}</span>
              </button>

              <button
                id="copy-x-standalone-btn"
                onClick={() => handleCopy(content.standalonePost, 'X Post', 'standalone')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              >
                {copiedSection === 'standalone' ? (
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

          {editingStandalone ? (
            <div className="space-y-3">
              <textarea
                value={standaloneDraft}
                onChange={(e) => setStandaloneDraft(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-4 text-sm text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed resize-y"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingStandalone(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9ba3af] hover:text-[#f0f2f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStandalone}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] text-[#f0f2f5] text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30">
              {content.standalonePost}
            </div>
          )}
        </div>
      )}

      {/* PRIMARY RESULT 2: COMPLETE THREAD */}
      {postFormat === 'thread' && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262b30]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af] flex items-center gap-1.5">
                Complete Thread Output ({content.thread?.length || 0} Tweets)
              </span>
              <p className="text-[11px] text-[#9ba3af] mt-0.5">
                Cohesive argument with clear beginning, useful middle points, and closing CTA.
              </p>
            </div>

            <button
              id="copy-x-entire-thread-btn"
              onClick={handleCopyFullThread}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              {copiedSection === 'full-thread' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Thread Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Entire Thread</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {content.thread?.map((tweet, idx) => (
              <div
                key={idx}
                id={`x-thread-tweet-${idx}`}
                className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[#22272b]">
                  <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                    Tweet {idx + 1} of {content.thread.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#9ba3af] font-mono">
                      {tweet.length} chars
                    </span>
                    <button
                      onClick={() => {
                        if (editingThreadIdx === idx) {
                          setEditingThreadIdx(null);
                        } else {
                          setThreadDraft(tweet);
                          setEditingThreadIdx(idx);
                        }
                      }}
                      className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
                      title="Edit this tweet"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopy(tweet, `Tweet #${idx + 1}`, `tweet-${idx}`)}
                      className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
                      title="Copy Tweet"
                    >
                      {copiedSection === `tweet-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {editingThreadIdx === idx ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={threadDraft}
                      onChange={(e) => setThreadDraft(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg bg-[#111315] border border-[#2e343b] p-3 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingThreadIdx(null)}
                        className="px-2.5 py-1 text-[11px] text-[#9ba3af] hover:text-[#f0f2f5]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveThreadItem(idx)}
                        className="px-3 py-1 rounded text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
                      >
                        Save Tweet
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#f0f2f5] leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {tweet}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPTIONAL SUPPORTING TOOLS: ACCORDION (SECONDARY BY DEFAULT) */}
      <div className="rounded-xl bg-[#1d2125] border border-[#262b30] overflow-hidden">
        <button
          onClick={() => setShowSupportingTools(!showSupportingTools)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Optional Supporting Tools (3 Alternative Hooks & Closings)</span>
          </div>
          {showSupportingTools ? (
            <ChevronUp className="w-4 h-4 text-[#9ba3af]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#9ba3af]" />
          )}
        </button>

        {showSupportingTools && (
          <div className="p-4 pt-0 border-t border-[#262b30] space-y-4 text-xs">
            {/* 3 Hooks */}
            <div className="space-y-2 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                3 Alternative Opening Hooks
              </span>
              <p className="text-[11px] text-[#9ba3af]">
                Genuinely distinct opening angles derived from your notes. Click to test as the post opening.
              </p>

              <div className="space-y-2 pt-1">
                {threeHooks.map((hook, idx) => (
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
                        onClick={() => handleApplyHookToStandalone(hook)}
                        className="px-2 py-1 rounded text-[10px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
                        title="Use as opening line of standalone post"
                      >
                        Apply Hook
                      </button>
                      <button
                        onClick={() => handleCopy(hook, `Hook #${idx + 1}`, `hook-${idx}`)}
                        className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
                        title="Copy hook text"
                      >
                        {copiedSection === `hook-${idx}` ? (
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

            {/* Alternative Closings */}
            {content.closingLines && content.closingLines.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#262b30]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                  Alternative Ending Lines & CTAs
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {content.closingLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#16191c] border border-[#262b30] text-xs"
                    >
                      <p className="text-[#cbd2d9] italic">{line}</p>
                      <button
                        onClick={() => handleCopy(line, `Closing #${idx + 1}`, `close-${idx}`)}
                        className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors shrink-0"
                      >
                        {copiedSection === `close-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
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
