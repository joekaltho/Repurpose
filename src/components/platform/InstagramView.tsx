import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCw,
  Save,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Hash,
} from 'lucide-react';
import { InstagramContent, CarouselSlide } from '../../types';

interface InstagramViewProps {
  content: InstagramContent;
  onUpdateContent: (updated: InstagramContent) => void;
  onCopy: (text: string, label: string) => void;
  onRegenerate: () => void;
  onSaveToLibrary: () => void;
  onOpenVoiceTuner?: () => void;
  isRegenerating?: boolean;
}

export const InstagramView: React.FC<InstagramViewProps> = ({
  content,
  onUpdateContent,
  onCopy,
  onRegenerate,
  onSaveToLibrary,
  onOpenVoiceTuner,
  isRegenerating = false,
}) => {
  const primaryCaption = content.captions[0] || {
    caption: 'Caption content...',
    callToAction: 'Save this post.',
    suggestedHashtags: ['#buildinpublic', '#founders'],
  };

  const [activeFormat, setActiveFormat] = useState<'caption' | 'carousel'>('caption');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [draftCaption, setDraftCaption] = useState(primaryCaption.caption);

  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [draftSlideHeadline, setDraftSlideHeadline] = useState('');
  const [draftSlideBody, setDraftSlideBody] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSupportingTools, setShowSupportingTools] = useState(false);

  const slides = content.carousel?.slides || [];
  const currentSlide: CarouselSlide = slides[activeSlideIdx] || {
    slideNumber: 1,
    headline: 'Slide Topic',
    bodyText: 'Slide detail...',
    visualNote: 'Dark background.',
  };

  const handleCopy = (text: string, label: string, id: string) => {
    onCopy(text, label);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCaption = () => {
    const updated = [...content.captions];
    updated[0] = {
      ...updated[0],
      caption: draftCaption,
    };
    onUpdateContent({
      ...content,
      captions: updated,
    });
    setIsEditingCaption(false);
  };

  const handleSaveSlide = () => {
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIdx] = {
      ...currentSlide,
      headline: draftSlideHeadline,
      bodyText: draftSlideBody,
    };
    onUpdateContent({
      ...content,
      carousel: {
        ...content.carousel,
        slides: updatedSlides,
      },
    });
    setIsEditingSlide(false);
  };

  const handleCopyFullCarousel = () => {
    const text = slides
      .map(
        (s) =>
          `[Slide ${s.slideNumber}: ${s.headline}]\n${s.bodyText}\n(Visual Note: ${s.visualNote})`
      )
      .join('\n\n---\n\n');
    handleCopy(text, 'Full Carousel Outline', 'full-carousel');
  };

  return (
    <div id="instagram-platform-view" className="space-y-4">
      {/* Platform Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
            📸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f0f2f5]">Instagram Package</h3>
              <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-emerald-400 border border-[#262b30]">
                Publish-Ready
              </span>
            </div>
            <p className="text-xs text-[#9ba3af] mt-0.5">
              1 Complete Caption · {slides.length}-Slide Educational Carousel · Targeted Hashtags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center rounded-lg bg-[#16191c] border border-[#262b30] p-0.5 text-xs">
            <button
              onClick={() => setActiveFormat('caption')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFormat === 'caption'
                  ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                  : 'text-[#9ba3af] hover:text-[#f0f2f5]'
              }`}
            >
              Caption
            </button>
            <button
              onClick={() => setActiveFormat('carousel')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeFormat === 'carousel'
                  ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                  : 'text-[#9ba3af] hover:text-[#f0f2f5]'
              }`}
            >
              Carousel ({slides.length} slides)
            </button>
          </div>

          <button
            id="instagram-save-btn"
            onClick={onSaveToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {onOpenVoiceTuner && (
            <button
              id="instagram-tune-voice-btn"
              onClick={onOpenVoiceTuner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              title="Tune voice feedback"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tune Voice</span>
            </button>
          )}

          <button
            id="instagram-regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RESULT 1: COMPLETE CAPTION */}
      {activeFormat === 'caption' && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262b30]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af]">
                Primary Caption Output
              </span>
              <p className="text-[11px] text-[#9ba3af] mt-0.5">
                Formatted with linebreaks, bullet points, and CTA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="edit-instagram-caption-btn"
                onClick={() => {
                  setDraftCaption(primaryCaption.caption);
                  setIsEditingCaption(!isEditingCaption);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingCaption ? 'Cancel' : 'Edit'}</span>
              </button>

              <button
                id="copy-instagram-caption-btn"
                onClick={() => handleCopy(primaryCaption.caption, 'Instagram Caption', 'caption')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              >
                {copiedId === 'caption' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isEditingCaption ? (
            <div className="space-y-3">
              <textarea
                value={draftCaption}
                onChange={(e) => setDraftCaption(e.target.value)}
                rows={10}
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-4 text-sm text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed resize-y"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingCaption(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9ba3af] hover:text-[#f0f2f5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCaption}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
                >
                  Save Caption
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#16191c] border border-[#262b30] text-[#f0f2f5] text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-500/30">
              {primaryCaption.caption}
            </div>
          )}

          {/* Hashtags */}
          {primaryCaption.suggestedHashtags && primaryCaption.suggestedHashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#262b30]">
              <span className="text-[11px] font-semibold text-[#9ba3af] mr-2">Hashtags:</span>
              {primaryCaption.suggestedHashtags.map((h, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9] font-mono"
                >
                  {h.startsWith('#') ? h : `#${h}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRIMARY RESULT 2: SUBSTANTIVE CAROUSEL */}
      {activeFormat === 'carousel' && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262b30]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9ba3af]">
                Carousel Package: {content.carousel?.topic || 'Slide Breakdown'}
              </span>
              <p className="text-[11px] text-[#9ba3af] mt-0.5">
                Every slide contributes substantive content to the argument.
              </p>
            </div>

            <button
              onClick={handleCopyFullCarousel}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              {copiedId === 'full-carousel' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>All Slides Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Slides</span>
                </>
              )}
            </button>
          </div>

          {/* Carousel Slide Navigator */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#16191c] border border-[#262b30]">
            <button
              disabled={activeSlideIdx === 0}
              onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSlideIdx(idx);
                    setIsEditingSlide(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeSlideIdx === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#22272b] text-[#9ba3af] hover:text-[#f0f2f5]'
                  }`}
                >
                  Slide {s.slideNumber || idx + 1}
                </button>
              ))}
            </div>

            <button
              disabled={activeSlideIdx === slides.length - 1}
              onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
              className="p-1.5 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active Slide Canvas */}
          <div className="p-6 rounded-xl bg-[#16191c] border border-[#262b30] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22272b]">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">
                Slide {currentSlide.slideNumber} of {slides.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDraftSlideHeadline(currentSlide.headline);
                    setDraftSlideBody(currentSlide.bodyText);
                    setIsEditingSlide(!isEditingSlide);
                  }}
                  className="flex items-center gap-1 text-xs text-[#9ba3af] hover:text-[#f0f2f5] cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingSlide ? 'Cancel' : 'Edit'}</span>
                </button>

                <button
                  onClick={() =>
                    handleCopy(
                      `${currentSlide.headline}\n\n${currentSlide.bodyText}`,
                      `Slide ${currentSlide.slideNumber}`,
                      `slide-${activeSlideIdx}`
                    )
                  }
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  {copiedId === `slide-${activeSlideIdx}` ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Slide</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isEditingSlide ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-[#9ba3af] block mb-1">
                    Slide Headline
                  </label>
                  <input
                    type="text"
                    value={draftSlideHeadline}
                    onChange={(e) => setDraftSlideHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111315] border border-[#2e343b] text-sm text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#9ba3af] block mb-1">
                    Slide Body Text (Substantive content)
                  </label>
                  <textarea
                    value={draftSlideBody}
                    onChange={(e) => setDraftSlideBody(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-[#111315] border border-[#2e343b] text-sm text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingSlide(false)}
                    className="px-3 py-1.5 text-xs text-[#9ba3af] hover:text-[#f0f2f5]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSlide}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
                  >
                    Save Slide
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-bold text-[#f0f2f5] tracking-tight">
                  {currentSlide.headline}
                </h4>
                <p className="text-sm text-[#cbd2d9] leading-relaxed whitespace-pre-wrap font-sans">
                  {currentSlide.bodyText}
                </p>
                {currentSlide.visualNote && (
                  <div className="p-3 rounded-lg bg-[#111315] border border-[#22272b] text-[11px] text-[#9ba3af]">
                    <strong className="text-[#cbd2d9] font-medium">Design / Visual Note: </strong>
                    {currentSlide.visualNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OPTIONAL SUPPORTING TOOLS: COVER HOOK IDEAS */}
      {content.hookIdeas && content.hookIdeas.length > 0 && (
        <div className="rounded-xl bg-[#1d2125] border border-[#262b30] overflow-hidden">
          <button
            onClick={() => setShowSupportingTools(!showSupportingTools)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Optional Supporting Tools (Carousel Cover Hook Ideas)</span>
            </div>
            {showSupportingTools ? (
              <ChevronUp className="w-4 h-4 text-[#9ba3af]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#9ba3af]" />
            )}
          </button>

          {showSupportingTools && (
            <div className="p-4 pt-0 border-t border-[#262b30] space-y-2 text-xs pt-3">
              {content.hookIdeas.map((hook, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#16191c] border border-[#262b30]"
                >
                  <p className="text-[#f0f2f5] font-medium">{hook}</p>
                  <button
                    onClick={() => handleCopy(hook, `Cover Hook #${idx + 1}`, `ig-hook-${idx}`)}
                    className="p-1 rounded text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors"
                  >
                    {copiedId === `ig-hook-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
