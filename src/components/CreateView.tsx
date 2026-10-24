import React, { useState, useEffect } from 'react';
import { validateContentGrounding } from '../utils/sourceGrounding';
import {
  Sparkles,
  Link2,
  FileText,
  RotateCw,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  BookOpen,
  UserCheck,
  Coins,
  BrainCircuit,
  ShieldCheck,
  Save,
  Download,
  Copy,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  Platform,
  ContentStyle,
  ContentGoal,
  InputType,
  RepurposedOutput,
  TemplatePrompt,
  VoiceProfile,
} from '../types';
import { calculateRepurposeCost, CREDIT_CONFIG } from '../config/credits';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { ContentIntelligenceCard } from './ContentIntelligenceCard';
import { SourceGroundingCard } from './SourceGroundingCard';
import { PlatformTabs } from './PlatformTabs';
import { VoiceFeedbackModal } from './VoiceFeedbackModal';
import {
  checkCreditAffordability,
  recordCompletedDeduction,
  addLearnedAdjustment,
} from '../utils/storage';

interface CreateViewProps {
  currentOutput: RepurposedOutput | null;
  onUpdateOutput: (output: RepurposedOutput) => void;
  onSaveToLibrary: (output: RepurposedOutput) => void;
  onCopyText: (text: string, label: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  initialTemplate?: TemplatePrompt | null;
  activeVoiceProfile: VoiceProfile;
  allVoiceProfiles: VoiceProfile[];
  onSelectVoiceProfile: (id: string) => void;
  onOpenVoiceProfileTab: () => void;
  onOpenPricingModal: () => void;
  creditBalance: number;
  onRefreshCredits: () => void;
  onUpdateVoiceProfile: (updated: VoiceProfile) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({
  currentOutput,
  onUpdateOutput,
  onSaveToLibrary,
  onCopyText,
  onNotify,
  initialTemplate,
  activeVoiceProfile,
  allVoiceProfiles,
  onSelectVoiceProfile,
  onOpenVoiceProfileTab,
  onOpenPricingModal,
  creditBalance,
  onRefreshCredits,
  onUpdateVoiceProfile,
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

  // Style & Goal selection
  const [style, setStyle] = useState<ContentStyle>(
    initialTemplate?.suggestedStyle || activeVoiceProfile.preferredStyles?.[0] || 'Founder'
  );
  const [contentGoal, setContentGoal] = useState<ContentGoal>(
    initialTemplate?.suggestedGoal || activeVoiceProfile.primaryGoal || 'Build in public'
  );

  // Advanced Audience & Tone controls (secondary)
  const [targetAudience, setTargetAudience] = useState<string>(
    initialTemplate?.suggestedAudience ||
      activeVoiceProfile.targetAudience ||
      'Technical founders, engineers, and startup CEOs'
  );
  const [desiredTone, setDesiredTone] = useState<string>(
    initialTemplate?.suggestedTone ||
      activeVoiceProfile.toneCharacteristics?.join(', ') ||
      'Pragmatic, sharp, high signal, zero fluff'
  );
  const [callToAction, setCallToAction] = useState<string>(
    'Drop your perspective in the replies or follow for more'
  );
  const [preserveVoice, setPreserveVoice] = useState<boolean>(true);

  // UI state
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>('x');

  // Voice feedback modal state
  const [isVoiceFeedbackOpen, setIsVoiceFeedbackOpen] = useState(false);
  const [voiceFeedbackPlatform, setVoiceFeedbackPlatform] = useState<Platform>('x');

  // Sync with template when selected externally
  useEffect(() => {
    if (initialTemplate) {
      setSourceContent(initialTemplate.sampleInput);
      setStyle(initialTemplate.suggestedStyle);
      setDesiredTone(initialTemplate.suggestedTone);
      setTargetAudience(initialTemplate.suggestedAudience);
      if (initialTemplate.suggestedGoal) {
        setContentGoal(initialTemplate.suggestedGoal);
      }
      setInputType('text');
    }
  }, [initialTemplate]);

  // Sync with activeVoiceProfile when switched
  useEffect(() => {
    if (activeVoiceProfile) {
      if (activeVoiceProfile.preferredStyles?.[0] && !initialTemplate) {
        setStyle(activeVoiceProfile.preferredStyles[0]);
      }
      if (activeVoiceProfile.primaryGoal && !initialTemplate) {
        setContentGoal(activeVoiceProfile.primaryGoal);
      }
      if (activeVoiceProfile.targetAudience && !initialTemplate) {
        setTargetAudience(activeVoiceProfile.targetAudience);
      }
      if (activeVoiceProfile.toneCharacteristics?.length && !initialTemplate) {
        setDesiredTone(activeVoiceProfile.toneCharacteristics.join(', '));
      }
    }
  }, [activeVoiceProfile?.id]);

  const stylesList: ContentStyle[] = [
    'Founder',
    'Build-in-Public',
    'Technical Deep-Dive',
    'Bold / Contrarian',
    'Educational',
    'Storytelling',
  ];

  const goalsList: ContentGoal[] = [
    'Build in public',
    'Share engineering lessons',
    'Drive signups',
    'Spark debate',
    'Recruit talent',
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

  const handleLoadSample = (sample: TemplatePrompt) => {
    setSourceContent(sample.sampleInput);
    setStyle(sample.suggestedStyle);
    setDesiredTone(sample.suggestedTone);
    setTargetAudience(sample.suggestedAudience);
    if (sample.suggestedGoal) setContentGoal(sample.suggestedGoal);
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

  // Repurpose generation with safe credit handling
  const handleRepurpose = async (regeneratePlatform?: Platform) => {
    if (isGenerating) return;

    if (!sourceContent || sourceContent.trim().length < 25) {
      onNotify('error', 'Please provide at least a couple of sentences of raw notes or thoughts.');
      return;
    }

    const isRegen = Boolean(regeneratePlatform);
    const requiredCredits = calculateRepurposeCost(selectedPlatforms, isRegen);
    const affordability = checkCreditAffordability(requiredCredits);

    if (!affordability.ok) {
      onNotify(
        'error',
        `Insufficient credits (${creditBalance} available, ${requiredCredits} required). Request quota to continue.`
      );
      onOpenPricingModal();
      return;
    }

    setIsGenerating(true);
    const steps = [
      'Extracting core builder arguments...',
      'Applying strict zero-fabrication guardrails...',
      'Synthesizing platform-native publish-ready content...',
    ];

    let stepIdx = 0;
    setGenerationStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 1200);

    const requestId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent,
          inputType,
          platforms: isRegen && regeneratePlatform ? [regeneratePlatform] : selectedPlatforms,
          style,
          targetAudience,
          desiredTone,
          callToAction,
          preserveVoice,
          regeneratePlatform,
          voiceProfile: activeVoiceProfile,
          contentGoal,
          userBalance: creditBalance,
          requestId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to repurpose content');
      }

      const actualCost = data.creditUsage?.cost || requiredCredits;
      recordCompletedDeduction(
        actualCost,
        isRegen ? 'platform_regenerate' : 'repurpose',
        data.creditUsage?.description ||
          (isRegen
            ? `Regenerated ${regeneratePlatform?.toUpperCase()}`
            : `Repurposed across ${selectedPlatforms.length} platforms`),
        requestId
      );
      onRefreshCredits();

      let nextOutput = data;
      if (isRegen && regeneratePlatform && currentOutput) {
        const merged: any = { ...currentOutput, [regeneratePlatform]: data[regeneratePlatform] };
        nextOutput = {
          ...merged,
          sourceGrounding: validateContentGrounding(merged.sourceContent, activeVoiceProfile, merged),
        };
      }
      onUpdateOutput(nextOutput);
      if (!selectedPlatforms.includes(activePlatformTab)) {
        setActivePlatformTab(selectedPlatforms[0] || 'x');
      }
      onNotify(
        'success',
        isRegen
          ? `Regenerated ${regeneratePlatform?.toUpperCase()} post.`
          : `Generated complete content package for ${selectedPlatforms.length} platforms.`
      );
    } catch (err: any) {
      console.error('Repurpose error:', err);
      onNotify('error', err.message || 'Error repurposing content.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleOpenTuner = (platform: Platform) => {
    setVoiceFeedbackPlatform(platform);
    setIsVoiceFeedbackOpen(true);
  };

  const handleApplyVoiceFeedback = (feedbackText: string, shouldRegenerate: boolean) => {
    const updated = addLearnedAdjustment(activeVoiceProfile.id, feedbackText, voiceFeedbackPlatform);
    onUpdateVoiceProfile(updated);
    onNotify('success', `Feedback saved to "${activeVoiceProfile.name}" memory.`);
    if (shouldRegenerate) {
      handleRepurpose(voiceFeedbackPlatform);
    }
  };

  const handleExportFullMarkdown = () => {
    if (!currentOutput) return;
    let md = `# Content Package: ${currentOutput.title || 'Repurposed Content'}\n`;
    md += `Voice: ${activeVoiceProfile.name} | Style: ${currentOutput.style}\n\n`;

    if (currentOutput.intelligence) {
      md += `## Content Intelligence\n- **Core Thesis:** ${currentOutput.intelligence.coreMessage}\n- **Recommended Angle:** ${currentOutput.intelligence.bestAngle}\n\n`;
    }

    if (currentOutput.x) {
      md += `## X / Twitter\n### Standalone Post\n${currentOutput.x.standalonePost}\n\n### Thread\n${currentOutput.x.thread.join('\n\n')}\n\n`;
    }

    if (currentOutput.linkedin) {
      md += `## LinkedIn\n${currentOutput.linkedin.variations.map((v) => `### ${v.title}\n${v.content}`).join('\n\n')}\n\n`;
    }

    if (currentOutput.tiktok) {
      md += `## TikTok / Reels\n${currentOutput.tiktok.scripts.map((s) => `### ${s.title}\nHook: ${s.hook}\nScript: ${s.spokenScript}\nCTA: ${s.callToAction}`).join('\n\n')}\n\n`;
    }

    if (currentOutput.instagram) {
      md += `## Instagram\n${currentOutput.instagram.captions.map((c, i) => `### Caption ${i + 1}\n${c.caption}`).join('\n\n')}\n\n`;
      if (currentOutput.instagram.carousel?.slides) {
        md += `### Carousel Slides\n`;
        currentOutput.instagram.carousel.slides.forEach((s) => {
          md += `Slide ${s.slideNumber}: ${s.headline}\n${s.bodyText}\n\n`;
        });
      }
    }

    onCopyText(md, 'Complete Content Package Markdown');
    onNotify('success', 'Full markdown copied to clipboard.');
  };

  const requiredCredits = calculateRepurposeCost(selectedPlatforms, false);
  const wordCount = sourceContent.trim() ? sourceContent.trim().split(/\s+/).length : 0;
  const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div id="create-view-container" className="max-w-7xl mx-auto space-y-6">
      {/* 1. STUDIO HEADER BANNER */}
      <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Founder Content Studio</span>
              <span className="text-[#9ba3af]">·</span>
              <span className="text-[#9ba3af]">
                Active Voice: <strong className="text-[#f0f2f5]">{activeVoiceProfile.name}</strong>
              </span>
              <button
                onClick={onOpenVoiceProfileTab}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1 cursor-pointer"
              >
                Edit Voice
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#f0f2f5] tracking-tight">
              Transform Builder Notes Into Multi-Channel Distribution
            </h1>

            <p className="text-xs sm:text-sm text-[#9ba3af] leading-relaxed">
              Drop rough meeting notes, architectural breakthroughs, or contrarian startup reflections. Repurpose outputs complete, publish-ready assets for each chosen platform.
            </p>
          </div>

          {/* Quick Framework Loader Chips */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ba3af]">
              Quick-load prompt template:
            </span>
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {SAMPLE_TEMPLATES.slice(0, 3).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleLoadSample(tpl)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#16191c] hover:bg-[#22272b] border border-[#262b30] hover:border-[#3d444d] text-[11px] text-[#cbd2d9] hover:text-[#f0f2f5] transition-all cursor-pointer truncate max-w-[200px]"
                  title={tpl.description}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKSPACE: LEFT INPUT STUDIO & RIGHT RESULTS STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: FOCUSED INPUT WORKSPACE (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Source Notes */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0f2f5]">
                  1. Source Notes & Context
                </h3>
              </div>

              {/* Input mode pills */}
              <div className="flex items-center rounded-lg bg-[#16191c] border border-[#262b30] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    inputType === 'text'
                      ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                      : 'text-[#9ba3af] hover:text-[#f0f2f5]'
                  }`}
                >
                  Direct Notes
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    inputType === 'url'
                      ? 'bg-[#22272b] text-[#f0f2f5] shadow-xs'
                      : 'text-[#9ba3af] hover:text-[#f0f2f5]'
                  }`}
                >
                  URL Link
                </button>
              </div>
            </div>

            {/* URL Input */}
            {inputType === 'url' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://yourblog.com/post-or-changelog"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] placeholder-[#9ba3af] focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleExtractUrl}
                    disabled={isExtractingUrl}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isExtractingUrl ? 'Extracting...' : 'Fetch'}
                  </button>
                </div>
              </div>
            )}

            {/* Editorial Textarea */}
            <div className="space-y-2">
              <textarea
                id="source-content-textarea"
                rows={10}
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste raw thoughts, engineering decisions, postmortem reflections, contrarian startup observations, customer discovery quotes, or product release notes..."
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-4 text-xs sm:text-sm text-[#f0f2f5] placeholder-[#9ba3af] focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed resize-y transition-colors"
              />

              <div className="flex items-center justify-between text-[11px] text-[#9ba3af] px-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums">{wordCount} words</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{sourceContent.length} chars</span>
                  {wordCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-mono tabular-nums">~{estimatedReadingMinutes}m read</span>
                    </>
                  )}
                </div>
                {sourceContent && (
                  <button
                    type="button"
                    onClick={() => setSourceContent('')}
                    className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer text-xs"
                  >
                    Clear notes
                  </button>
                )}
              </div>
            </div>

            {/* Factual Integrity Guarantee Badge */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#16191c] border border-[#262b30] text-xs text-[#9ba3af]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#cbd2d9] font-medium">Factual Integrity:</strong> Strict zero-fabrication guardrail. The engine will never invent metrics, revenue figures, customer quotes, or timelines not present in your notes.
              </p>
            </div>
          </div>

          {/* Card 2: Channels Selector */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-5 sm:p-6 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f0f2f5]">
                2. Target Channels ({selectedPlatforms.length} Selected)
              </span>
              <button
                type="button"
                onClick={handleSelectAllPlatforms}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Select All 4
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'x' as Platform, name: 'X / Twitter', icon: '𝕏', desc: '1 Post + 1 Coherent Thread' },
                { id: 'linkedin' as Platform, name: 'LinkedIn', icon: 'in', desc: 'Primary Post + 2 Hooks' },
                { id: 'tiktok' as Platform, name: 'TikTok / Reels', icon: '▶', desc: '1 Spoken Video Script' },
                { id: 'instagram' as Platform, name: 'Instagram', icon: '📸', desc: 'Caption + Carousel Slides' },
              ].map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <div
                    key={p.id}
                    id={`platform-select-${p.id}`}
                    onClick={() => togglePlatform(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#22272b] border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/20'
                        : 'bg-[#16191c] border-[#262b30] opacity-80 hover:opacity-100 hover:border-[#3d444d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#f0f2f5]">{p.icon}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-[#3d444d]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#f0f2f5]">{p.name}</h4>
                      <p className="text-[10px] text-[#9ba3af] mt-0.5 leading-snug">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Style & Publishing Goal */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#f0f2f5] uppercase tracking-wider block">
                3. Content Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stylesList.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      style === s
                        ? 'bg-[#22272b] text-[#f0f2f5] border border-emerald-500/40 shadow-xs'
                        : 'bg-[#16191c] text-[#9ba3af] border border-[#262b30] hover:text-[#f0f2f5]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#262b30]">
              <label className="text-xs font-bold text-[#f0f2f5] uppercase tracking-wider block">
                Publishing Objective
              </label>
              <select
                value={contentGoal}
                onChange={(e) => setContentGoal(e.target.value as ContentGoal)}
                className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                {goalsList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 4: Action & Credit Calculation */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#9ba3af]">
              <span className="font-medium">Estimated Generation Cost:</span>
              <span className="font-mono text-[#f0f2f5] font-semibold tabular-nums">
                {requiredCredits} credits <span className="text-[#9ba3af] font-normal">({creditBalance} available)</span>
              </span>
            </div>

            <button
              id="generate-repurpose-btn"
              type="button"
              disabled={isGenerating || !sourceContent.trim()}
              onClick={() => handleRepurpose()}
              className="w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>{generationStep || 'Synthesizing publish-ready content...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Content ({selectedPlatforms.length} Platforms)</span>
                </>
              )}
            </button>
          </div>

          {/* Card 5: Advanced Controls */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] overflow-hidden text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="w-full flex items-center justify-between p-4 text-[#9ba3af] hover:text-[#f0f2f5] transition-colors cursor-pointer"
            >
              <span className="font-medium">Advanced Audience & Tone Overrides</span>
              {showAdvancedControls ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvancedControls && (
              <div className="p-5 pt-0 border-t border-[#262b30] space-y-3.5">
                <div className="space-y-1.5 pt-3">
                  <label className="text-[11px] font-semibold text-[#9ba3af] uppercase">
                    Target Audience (ICP)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#9ba3af] uppercase">
                    Desired Tone Cadence
                  </label>
                  <input
                    type="text"
                    value={desiredTone}
                    onChange={(e) => setDesiredTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#9ba3af] uppercase">
                    Call To Action (CTA)
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLISHING SUITE / RESULTS STUDIO (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentOutput ? (
            <div id="repurpose-results-section" className="space-y-4">
              {/* Results Suite Action Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 rounded-2xl bg-[#1d2125] border border-[#2e343b] shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <h2 className="text-base sm:text-lg font-bold text-[#f0f2f5] tracking-tight">
                      Publish-Ready Content Suite
                    </h2>
                  </div>
                  <p className="text-xs text-[#9ba3af]">
                    Generated across {currentOutput.platforms.length} channels · Voiced with {activeVoiceProfile.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="export-markdown-global-btn"
                    onClick={handleExportFullMarkdown}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
                    title="Export complete package as Markdown"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9ba3af]" />
                    <span className="hidden sm:inline">Export MD</span>
                  </button>

                  <button
                    id="tune-voice-global-btn"
                    onClick={() => handleOpenTuner(activePlatformTab)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tune Voice</span>
                  </button>

                  <button
                    id="save-all-to-library-btn"
                    onClick={() => onSaveToLibrary(currentOutput)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Library</span>
                  </button>
                </div>
              </div>

              {/* Source Grounding Integrity Report */}
              {currentOutput.sourceGrounding && (
                <SourceGroundingCard
                  report={currentOutput.sourceGrounding}
                  onSelectPlatformTab={setActivePlatformTab}
                />
              )}

              {/* Platform Content Packages (Primary Post First) */}
              <PlatformTabs
                output={currentOutput}
                activePlatform={activePlatformTab}
                onSelectPlatform={setActivePlatformTab}
                onUpdateOutput={onUpdateOutput}
                onCopyText={onCopyText}
                onRegeneratePlatform={(p) => handleRepurpose(p)}
                onSaveToLibrary={() => onSaveToLibrary(currentOutput)}
                onGenerateMore={() => handleRepurpose()}
                onOpenVoiceTuner={handleOpenTuner}
                isRegenerating={isGenerating}
              />

              {/* Collapsible Content Intelligence Drawer */}
              {currentOutput.intelligence && (
                <ContentIntelligenceCard
                  intelligence={currentOutput.intelligence}
                  onCopy={onCopyText}
                  defaultExpanded={false}
                />
              )}
            </div>
          ) : (
            /* EMPTY CANVAS: EDITORIAL STUDIO PREVIEW */
            <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-6 sm:p-10 space-y-6 shadow-xs text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#22272b] border border-[#2e343b] flex items-center justify-center text-emerald-400 mx-auto shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-[#f0f2f5] tracking-tight">
                  Complete Content Products from Your Raw Notes
                </h3>
                <p className="text-xs sm:text-sm text-[#9ba3af] leading-relaxed">
                  Provide rough thoughts or paste a link on the left. The engine synthesizes 100% complete, publish-ready packages tailored to each platform's native reader psychology.
                </p>
              </div>

              {/* Multi-Channel Preview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
                <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] space-y-1">
                  <span className="font-mono text-xs font-bold text-[#f0f2f5]">𝕏 X / Twitter</span>
                  <p className="text-[10px] text-[#9ba3af] leading-snug">
                    1 complete post + full 5-part argument thread.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] space-y-1">
                  <span className="font-mono text-xs font-bold text-[#0a66c2]">in LinkedIn</span>
                  <p className="text-[10px] text-[#9ba3af] leading-snug">
                    Publish-ready post + 2 alternative hook options.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] space-y-1">
                  <span className="font-mono text-xs font-bold text-rose-400">▶ TikTok</span>
                  <p className="text-[10px] text-[#9ba3af] leading-snug">
                    Speakable video script + on-screen visual notes.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] space-y-1">
                  <span className="font-mono text-xs font-bold text-amber-400">📸 Instagram</span>
                  <p className="text-[10px] text-[#9ba3af] leading-snug">
                    Complete caption + structured carousel outline.
                  </p>
                </div>
              </div>

              {/* Sample Templates Quick-Load */}
              <div className="pt-4 border-t border-[#262b30] max-w-lg mx-auto space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ba3af] block">
                  Or load a tested founder framework to start:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {SAMPLE_TEMPLATES.slice(0, 4).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleLoadSample(tpl)}
                      className="p-3.5 rounded-xl bg-[#16191c] hover:bg-[#22272b] border border-[#262b30] hover:border-[#3d444d] text-left transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#f0f2f5] group-hover:text-emerald-400 transition-colors block">
                        {tpl.title}
                      </span>
                      <span className="text-[11px] text-[#9ba3af] line-clamp-1 mt-0.5">
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Tuning Modal */}
      <VoiceFeedbackModal
        isOpen={isVoiceFeedbackOpen}
        onClose={() => setIsVoiceFeedbackOpen(false)}
        activeProfile={activeVoiceProfile}
        platform={voiceFeedbackPlatform}
        onApplyFeedback={handleApplyVoiceFeedback}
        isRegenerating={isGenerating}
      />
    </div>
  );
};
