import React, { useState } from 'react';
import {
  Sparkles,
  Link2,
  FileText,
  Mic,
  RotateCw,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Sliders,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  Platform,
  ContentStyle,
  InputType,
  RepurposedOutput,
  TemplatePrompt,
} from '../types';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { ContentIntelligenceCard } from './ContentIntelligenceCard';
import { PlatformTabs } from './PlatformTabs';

interface CreateViewProps {
  currentOutput: RepurposedOutput | null;
  onUpdateOutput: (output: RepurposedOutput) => void;
  onSaveToLibrary: (output: RepurposedOutput) => void;
  onCopyText: (text: string, label: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  initialTemplate?: TemplatePrompt | null;
}

export const CreateView: React.FC<CreateViewProps> = ({
  currentOutput,
  onUpdateOutput,
  onSaveToLibrary,
  onCopyText,
  onNotify,
  initialTemplate,
}) => {
  // Input configuration
  const [inputType, setInputType] = useState<InputType>('text');
  const [sourceContent, setSourceContent] = useState<string>(
    initialTemplate?.sampleInput || ''
  );
  const [urlInput, setUrlInput] = useState<string>('');
  const [isExtractingUrl, setIsExtractingUrl] = useState<boolean>(false);

  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'x',
    'linkedin',
    'tiktok',
    'instagram',
  ]);

  // Style selection
  const [style, setStyle] = useState<ContentStyle>(
    initialTemplate?.suggestedStyle || 'Founder'
  );

  // Audience & Tone controls
  const [targetAudience, setTargetAudience] = useState<string>(
    initialTemplate?.suggestedAudience || 'Founders, builders, and ambitious professionals'
  );
  const [desiredTone, setDesiredTone] = useState<string>(
    initialTemplate?.suggestedTone || 'Insightful, direct, no-fluff'
  );
  const [callToAction, setCallToAction] = useState<string>(
    'Share your perspective below or follow for more'
  );
  const [preserveVoice, setPreserveVoice] = useState<boolean>(true);

  // UI state
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>('x');

  const stylesList: ContentStyle[] = [
    'Founder',
    'Educational',
    'Storytelling',
    'Personal',
    'Bold / Contrarian',
    'Professional',
    'Casual',
  ];

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) {
        onNotify('info', 'Please keep at least one platform selected.');
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSelectAllPlatforms = () => {
    setSelectedPlatforms(['x', 'linkedin', 'tiktok', 'instagram']);
  };

  // Load sample content
  const handleLoadSample = (sample: TemplatePrompt) => {
    setSourceContent(sample.sampleInput);
    setStyle(sample.suggestedStyle);
    setDesiredTone(sample.suggestedTone);
    setTargetAudience(sample.suggestedAudience);
    setInputType('text');
    onNotify('info', `Loaded template: ${sample.title}`);
  };

  // URL extraction
  const handleExtractUrl = async () => {
    if (!urlInput.trim()) {
      onNotify('error', 'Please enter a valid URL.');
      return;
    }

    setIsExtractingUrl(true);
    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract content from URL');
      }

      setSourceContent(data.text);
      setInputType('text');
      onNotify('success', `Extracted content from: ${data.title || urlInput}`);
    } catch (err: any) {
      console.error(err);
      onNotify('error', err.message || 'URL extraction failed. Please paste text directly.');
    } finally {
      setIsExtractingUrl(false);
    }
  };

  // Repurpose generation
  const handleRepurpose = async (regeneratePlatform?: Platform) => {
    if (!sourceContent || sourceContent.trim().length < 25) {
      onNotify('error', 'Please provide at least a couple of sentences of source content.');
      return;
    }

    setIsGenerating(true);
    const steps = [
      'Extracting core message & arguments...',
      'Synthesizing potential hooks & contrarian angles...',
      'Constructing platform-native drafts...',
      'Formatting and polishing output...',
    ];

    let stepIdx = 0;
    setGenerationStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 1400);

    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent,
          inputType,
          platforms: selectedPlatforms,
          style,
          targetAudience,
          desiredTone,
          callToAction,
          preserveVoice,
          regeneratePlatform,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to repurpose content');
      }

      onUpdateOutput(data);
      // Ensure active tab is within selected platforms
      if (!selectedPlatforms.includes(activePlatformTab)) {
        setActivePlatformTab(selectedPlatforms[0] || 'x');
      }
      onNotify('success', 'Content repurposed successfully across platforms!');
    } catch (err: any) {
      console.error('Repurpose error:', err);
      onNotify('error', err.message || 'Error repurposing content.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div id="create-view-container" className="space-y-8 max-w-6xl mx-auto">
      {/* Hero / Header Section */}
      <div className="relative rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 overflow-hidden shadow-2xl shadow-black/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Turn One Idea Into a Week of Content</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            What are you creating today?
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            Paste raw thoughts, an essay draft, a YouTube transcript, or an article URL. Repurpose analyzes your core ideas and reconstructs platform-native content with zero generic AI clichés.
          </p>

          {/* Quick sample chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Try a sample:</span>
            {SAMPLE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleLoadSample(tpl)}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors font-medium flex items-center gap-1"
              >
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Input Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              id="input-tab-text"
              type="button"
              onClick={() => setInputType('text')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                inputType === 'text'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paste Text</span>
            </button>

            <button
              id="input-tab-url"
              type="button"
              onClick={() => setInputType('url')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                inputType === 'url'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste URL</span>
            </button>

            <button
              id="input-tab-transcript"
              type="button"
              onClick={() => setInputType('transcript')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                inputType === 'transcript'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Paste Transcript</span>
            </button>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            {sourceContent.trim() ? `${sourceContent.trim().split(/\s+/).length} words` : '0 words'}
          </div>
        </div>

        {/* URL Input Form (if in URL mode) */}
        {inputType === 'url' && (
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Article or Webpage URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="url-source-input"
                  type="url"
                  placeholder="https://example.com/blog/my-article-or-post"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
              <button
                id="extract-url-btn"
                type="button"
                onClick={handleExtractUrl}
                disabled={isExtractingUrl}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isExtractingUrl ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <span>Extract Content</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Repurpose will fetch the article text and strip headers/ads so you can review and repurpose it below.
            </p>
          </div>
        )}

        {/* Main Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>
              {inputType === 'transcript'
                ? 'Podcast / Video Transcript'
                : inputType === 'url'
                ? 'Extracted Article Content'
                : 'Your Source Content (Notes, Essay, Bullet Points)'}
            </span>
            {sourceContent && (
              <button
                onClick={() => setSourceContent('')}
                className="text-[11px] text-zinc-400 hover:text-rose-400 font-medium lowercase"
              >
                Clear text
              </button>
            )}
          </label>

          <textarea
            id="source-content-textarea"
            rows={7}
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder={
              inputType === 'transcript'
                ? 'Paste raw transcript text here (timestamps will be cleaned automatically)...'
                : 'Write or paste your core thoughts, customer story, contrarian take, or framework...'
            }
            className="w-full rounded-2xl bg-zinc-950/80 border border-zinc-800 p-4 sm:p-5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 font-sans leading-relaxed resize-y transition-colors"
          />
        </div>

        {/* Platform Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Target Platforms ({selectedPlatforms.length} Selected)
            </label>
            <button
              type="button"
              onClick={handleSelectAllPlatforms}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'x' as Platform, name: 'X (Twitter)', icon: '𝕏', desc: '1 Thread, 1 Post, 5 Hooks' },
              { id: 'linkedin' as Platform, name: 'LinkedIn', icon: 'in', desc: '3 Post Variations' },
              { id: 'tiktok' as Platform, name: 'TikTok / Reels', icon: '▶', desc: '3 Video Scripts' },
              { id: 'instagram' as Platform, name: 'Instagram', icon: '📸', desc: '1 Carousel, 2 Captions' },
            ].map((item) => {
              const isSelected = selectedPlatforms.includes(item.id);
              return (
                <div
                  key={item.id}
                  id={`platform-select-${item.id}`}
                  onClick={() => togglePlatform(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-800/90 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-zinc-950/60 border-zinc-800/80 opacity-60 hover:opacity-100 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold text-xs text-white font-mono">
                      {item.icon}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-zinc-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Style Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Content Style / Archetype
          </label>
          <div className="flex flex-wrap gap-2">
            {stylesList.map((s) => (
              <button
                key={s}
                id={`style-select-${s.toLowerCase().replace(/[^a-z]/g, '-')}`}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  style === s
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                    : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Audience & Tone Controls Accordion */}
        <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/90 overflow-hidden">
          <button
            type="button"
            id="toggle-advanced-controls"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audience, Tone & Voice Controls</span>
              <span className="text-[10px] font-normal text-zinc-400">
                ({targetAudience.slice(0, 24)}... • {desiredTone.slice(0, 20)}...)
              </span>
            </div>
            {showAdvancedControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedControls && (
            <div className="p-5 pt-1 border-t border-zinc-800/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Early-stage SaaS founders, tech operators"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    Desired Tone
                  </label>
                  <input
                    type="text"
                    value={desiredTone}
                    onChange={(e) => setDesiredTone(e.target.value)}
                    placeholder="e.g. Direct, punchy, conversational, no-fluff"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Preferred Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="e.g. Follow for weekly teardowns or drop your questions below"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2.5 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Preserve Voice Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">
                    Preserve Original Voice & Anecdotes
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Prioritize the exact stories, metrics, and conversational cadence over standardized templates.
                  </span>
                </div>
                <button
                  type="button"
                  id="toggle-preserve-voice"
                  onClick={() => setPreserveVoice(!preserveVoice)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preserveVoice ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      preserveVoice ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            id="repurpose-content-btn"
            type="button"
            onClick={() => handleRepurpose()}
            disabled={isGenerating || !sourceContent.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>{generationStep || 'REPURPOSING CONTENT...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>REPURPOSE CONTENT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Results Section */}
      {currentOutput && (
        <div id="repurpose-results-section" className="space-y-8 pt-4">
          {/* Section anchor banner */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Repurposed Content</h2>
              <p className="text-xs text-zinc-400">
                Native content ready for distribution across {currentOutput.platforms.length} platforms.
              </p>
            </div>

            <button
              id="save-all-to-library-btn"
              onClick={() => onSaveToLibrary(currentOutput)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Save Batch to Library</span>
            </button>
          </div>

          {/* 1. Content Intelligence Section */}
          {currentOutput.intelligence && (
            <ContentIntelligenceCard
              intelligence={currentOutput.intelligence}
              onCopy={onCopyText}
            />
          )}

          {/* 2. Platform Tabs & Content Views */}
          <PlatformTabs
            output={currentOutput}
            activePlatform={activePlatformTab}
            onSelectPlatform={setActivePlatformTab}
            onUpdateOutput={onUpdateOutput}
            onCopyText={onCopyText}
            onRegeneratePlatform={(p) => handleRepurpose(p)}
            onSaveToLibrary={() => onSaveToLibrary(currentOutput)}
            onGenerateMore={() => handleRepurpose()}
            isRegenerating={isGenerating}
          />
        </div>
      )}
    </div>
  );
};
