import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Instagram,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Hash,
  Share2,
} from 'lucide-react';
import { InstagramContent, InstagramCaption, CarouselSlide } from '../../types';

interface InstagramViewProps {
  content: InstagramContent;
  onUpdateContent: (updated: InstagramContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  isRegenerating?: boolean;
}

export const InstagramView: React.FC<InstagramViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  isRegenerating = false,
}) => {
  const [activeTab, setActiveTab] = useState<'carousel' | 'captions' | 'hooks'>('carousel');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit states for captions
  const [editingCaptionIdx, setEditingCaptionIdx] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCaption = (idx: number) => {
    const updatedCaptions = [...content.captions];
    updatedCaptions[idx] = {
      ...updatedCaptions[idx],
      caption: captionDraft,
    };
    onUpdateContent({
      ...content,
      captions: updatedCaptions,
    });
    setEditingCaptionIdx(null);
  };

  const handleCopyCarouselOutline = () => {
    const outline = content.carousel.slides
      .map(
        (s) =>
          `[SLIDE ${s.slideNumber}: ${s.headline}]\n${s.bodyText}\n(Visual note: ${s.visualNote})`
      )
      .join('\n\n---\n\n');
    handleCopy(outline, 'Full Carousel Outline', 'carousel-full');
  };

  return (
    <div id="instagram-platform-view" className="space-y-6">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
            <Instagram className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Instagram Content Suite</h3>
            <p className="text-xs text-zinc-400">
              1 Visual Carousel Outline • 2 Captions with Hashtags • 5 Cover Hook Ideas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="instagram-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Regenerate IG</span>
          </button>

          <button
            id="instagram-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <button
          id="ig-tab-carousel"
          onClick={() => setActiveTab('carousel')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'carousel'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Carousel Outline ({content.carousel.slides.length} Slides)</span>
        </button>

        <button
          id="ig-tab-captions"
          onClick={() => setActiveTab('captions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'captions'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-rose-400" />
          <span>2 Captions & Tags</span>
        </button>

        <button
          id="ig-tab-hooks"
          onClick={() => setActiveTab('hooks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'hooks'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>5 Cover Hook Ideas</span>
        </button>
      </div>

      {/* 1. Carousel View */}
      {activeTab === 'carousel' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{content.carousel.topic}</h4>
              <p className="text-xs text-zinc-400">
                Visual slide-by-slide guide for Canva, Figma, or designers.
              </p>
            </div>

            <button
              id="copy-carousel-all-btn"
              onClick={handleCopyCarouselOutline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              {copiedId === 'carousel-full' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy All Slides</span>
            </button>
          </div>

          {/* Interactive Slide Viewer & Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.carousel.slides.map((slide, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === content.carousel.slides.length - 1;
              return (
                <div
                  key={idx}
                  id={`ig-slide-card-${idx}`}
                  className="rounded-xl bg-zinc-900/85 border border-zinc-800 hover:border-zinc-700/90 p-4 flex flex-col justify-between transition-all group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 flex items-center justify-center">
                          {slide.slideNumber}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                          {isFirst ? 'Cover Slide' : isLast ? 'CTA Slide' : `Slide ${slide.slideNumber}`}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            `[Slide ${slide.slideNumber}]\n${slide.headline}\n${slide.bodyText}\nNote: ${slide.visualNote}`,
                            `Slide #${slide.slideNumber}`,
                            `slide-${idx}`
                          )
                        }
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Copy Slide"
                      >
                        {copiedId === `slide-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <h5 className="text-sm font-bold text-zinc-100 mb-2 leading-snug">
                      {slide.headline}
                    </h5>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line mb-3">
                      {slide.bodyText}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono font-semibold uppercase text-zinc-400 block mb-0.5">
                      Visual Note
                    </span>
                    <p className="text-[11px] text-zinc-400 italic leading-tight">
                      {slide.visualNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Captions View */}
      {activeTab === 'captions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.captions.map((cap, idx) => {
            const isEditing = editingCaptionIdx === idx;
            return (
              <div
                key={idx}
                id={`ig-caption-card-${idx}`}
                className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Caption Option {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (isEditing) {
                            handleSaveCaption(idx);
                          } else {
                            setCaptionDraft(cap.caption);
                            setEditingCaptionIdx(idx);
                          }
                        }}
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title={isEditing ? 'Save' : 'Edit'}
                      >
                        {isEditing ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Edit3 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleCopy(
                            `${isEditing ? captionDraft : cap.caption}\n\n${cap.suggestedHashtags.join(' ')}`,
                            `Instagram Caption ${idx + 1}`,
                            `caption-${idx}`
                          )
                        }
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Copy Caption"
                      >
                        {copiedId === `caption-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        rows={10}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-700 p-3 text-xs text-zinc-100 font-sans leading-relaxed focus:outline-hidden focus:border-rose-500 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingCaptionIdx(null)}
                          className="px-2 py-1 text-xs text-zinc-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveCaption(idx)}
                          className="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                      {cap.caption}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-indigo-400" /> Recommended Hashtags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cap.suggestedHashtags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Cover Hook Ideas */}
      {activeTab === 'hooks' && (
        <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-5">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white">5 High-CTR Cover Hook Ideas</h4>
            <p className="text-xs text-zinc-400">
              Tested formats for your primary Instagram cover image, Reel thumbnail, or Story slide.
            </p>
          </div>

          <div className="space-y-3">
            {content.hookIdeas.map((hook, idx) => (
              <div
                key={idx}
                id={`ig-hook-${idx}`}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-white">
                    {hook}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(hook, `Cover Hook #${idx + 1}`, `hook-ig-${idx}`)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                  title="Copy Hook"
                >
                  {copiedId === `hook-ig-${idx}` ? (
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
  );
};
