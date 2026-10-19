import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  RotateCw,
  Sliders,
  ShieldAlert,
  BrainCircuit,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  VoiceProfile,
  ContentStyle,
  ContentGoal,
} from '../types';
import { CREDIT_CONFIG } from '../config/credits';
import {
  getVoiceProfiles,
  saveVoiceProfile,
  deleteVoiceProfile,
  setActiveVoiceProfileId,
  addLearnedAdjustment,
  toggleLearnedAdjustment,
  removeLearnedAdjustment,
  checkCreditAffordability,
  recordCompletedDeduction,
  getCreditAccount,
} from '../utils/storage';

interface VoiceProfileViewProps {
  activeProfile: VoiceProfile;
  onUpdateActiveProfile: (profile: VoiceProfile) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onRefreshCredits: () => void;
}

export const VoiceProfileView: React.FC<VoiceProfileViewProps> = ({
  activeProfile,
  onUpdateActiveProfile,
  onNotify,
  onRefreshCredits,
}) => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(getVoiceProfiles());
  const [draft, setDraft] = useState<VoiceProfile>({ ...activeProfile });
  const [newBannedWord, setNewBannedWord] = useState('');
  const [newToneTrait, setNewToneTrait] = useState('');
  const [newSampleDraft, setNewSampleDraft] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Sync draft when activeProfile changes externally
  React.useEffect(() => {
    setDraft({ ...activeProfile });
  }, [activeProfile.id]);

  const handleSwitchProfile = (id: string) => {
    setActiveVoiceProfileId(id);
    const selected = profiles.find((p) => p.id === id) || profiles[0];
    onUpdateActiveProfile(selected);
    setDraft({ ...selected });
    onNotify('info', `Switched to profile: ${selected.name}`);
  };

  const handleCreateNewProfile = () => {
    const newId = `profile_${Date.now()}`;
    const newProfile: VoiceProfile = {
      id: newId,
      name: 'New Founder Profile',
      founderName: 'Founder Name',
      role: 'Founder & Builder',
      bio: 'Bootstrapping a developer tool.',
      startupName: 'MyStartup',
      startupOneLiner: 'Solving workflow friction for modern engineering teams.',
      targetAudience: 'Software engineers, founders, and technical leads',
      primaryGoal: 'Build in public',
      preferredStyles: ['Founder', 'Build-in-Public', 'Technical Deep-Dive'],
      toneCharacteristics: ['Direct', 'High signal', 'No fluff'],
      bannedPhrases: ['game changer', 'supercharge', 'in today\'s fast-paced world', 'delve'],
      writingSamples: [],
      learnedAdjustments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveVoiceProfile(newProfile);
    const updatedList = getVoiceProfiles();
    setProfiles(updatedList);
    handleSwitchProfile(newId);
    onNotify('success', 'Created new voice profile.');
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      onNotify('error', 'You must maintain at least one voice profile.');
      return;
    }
    deleteVoiceProfile(id);
    const updatedList = getVoiceProfiles();
    setProfiles(updatedList);
    const next = updatedList[0];
    onUpdateActiveProfile(next);
    setDraft({ ...next });
    onNotify('info', 'Voice profile deleted.');
  };

  const handleSaveProfile = () => {
    const updated = saveVoiceProfile(draft);
    setProfiles(getVoiceProfiles());
    onUpdateActiveProfile(updated);
    setIsSaved(true);
    onNotify('success', 'Voice profile saved. All future content will use these preferences.');
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Add/remove tone traits
  const handleAddToneTrait = () => {
    if (!newToneTrait.trim()) return;
    if (draft.toneCharacteristics.includes(newToneTrait.trim())) {
      setNewToneTrait('');
      return;
    }
    setDraft({
      ...draft,
      toneCharacteristics: [...draft.toneCharacteristics, newToneTrait.trim()],
    });
    setNewToneTrait('');
  };

  const handleRemoveToneTrait = (trait: string) => {
    setDraft({
      ...draft,
      toneCharacteristics: draft.toneCharacteristics.filter((t) => t !== trait),
    });
  };

  // Add/remove banned phrases
  const handleAddBannedWord = () => {
    if (!newBannedWord.trim()) return;
    const clean = newBannedWord.trim().toLowerCase();
    if (draft.bannedPhrases.includes(clean)) {
      setNewBannedWord('');
      return;
    }
    setDraft({
      ...draft,
      bannedPhrases: [...draft.bannedPhrases, clean],
    });
    setNewBannedWord('');
  };

  const handleRemoveBannedWord = (phrase: string) => {
    setDraft({
      ...draft,
      bannedPhrases: draft.bannedPhrases.filter((p) => p !== phrase),
    });
  };

  // Add/remove writing samples
  const handleAddSample = () => {
    if (!newSampleDraft.trim() || newSampleDraft.trim().length < 25) {
      onNotify('error', 'Please provide a writing sample of at least 25 characters.');
      return;
    }
    setDraft({
      ...draft,
      writingSamples: [...(draft.writingSamples || []), newSampleDraft.trim()],
    });
    setNewSampleDraft('');
    onNotify('success', 'Writing sample added to your voice vault.');
  };

  const handleRemoveSample = (index: number) => {
    const updated = [...(draft.writingSamples || [])];
    updated.splice(index, 1);
    setDraft({ ...draft, writingSamples: updated });
  };

  // Analyze voice with Gemini
  const handleAnalyzeVoice = async () => {
    if (!draft.writingSamples || draft.writingSamples.length === 0) {
      onNotify('error', 'Add at least one writing sample below before analyzing your voice.');
      return;
    }

    const requiredCredits = CREDIT_CONFIG.VOICE_FINGERPRINT_ANALYSIS;
    const affordability = checkCreditAffordability(requiredCredits);

    if (!affordability.ok) {
      onNotify(
        'error',
        `Insufficient credits for voice analysis (${affordability.balance} available, ${requiredCredits} required).`
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const requestId = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writingSamples: draft.writingSamples,
          bio: draft.bio,
          startupOneLiner: draft.startupOneLiner,
          founderName: draft.founderName,
          userBalance: affordability.balance,
          requestId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze voice.');
      }

      // Safe deduction: only deduct credits AFTER server completes successfully
      recordCompletedDeduction(
        requiredCredits,
        'voice_analysis',
        `Voice fingerprint analysis for profile "${draft.name}"`,
        requestId
      );
      onRefreshCredits();

      setAnalysisResult(data);
      onNotify('success', `Voice fingerprint analyzed (${requiredCredits} credits used). Review suggestions below.`);
    } catch (err: any) {
      console.error(err);
      onNotify('error', err.message || 'Voice analysis failed. No credits were deducted.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAnalysis = () => {
    if (!analysisResult) return;
    const combinedTraits = Array.from(
      new Set([...draft.toneCharacteristics, ...(analysisResult.toneCharacteristics || [])])
    );
    const combinedBanned = Array.from(
      new Set([...draft.bannedPhrases, ...(analysisResult.recommendedBannedPhrases || [])])
    );

    setDraft({
      ...draft,
      toneCharacteristics: combinedTraits,
      bannedPhrases: combinedBanned,
    });
    setAnalysisResult(null);
    onNotify('success', 'Applied analyzed traits and banned phrases to your profile!');
  };

  const availableStyles: ContentStyle[] = [
    'Founder',
    'Build-in-Public',
    'Technical Deep-Dive',
    'Bold / Contrarian',
    'Educational',
    'Storytelling',
    'Personal',
  ];

  const toggleStyle = (s: ContentStyle) => {
    if (draft.preferredStyles.includes(s)) {
      if (draft.preferredStyles.length <= 1) return;
      setDraft({
        ...draft,
        preferredStyles: draft.preferredStyles.filter((item) => item !== s),
      });
    } else {
      setDraft({
        ...draft,
        preferredStyles: [...draft.preferredStyles, s],
      });
    }
  };

  const goalsList: ContentGoal[] = [
    'Build in public',
    'Share engineering lessons',
    'Drive signups',
    'Spark debate',
    'Recruit talent',
    'Document journey',
  ];

  return (
    <div id="voice-profile-view" className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Profile Switcher */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-[#f0f2f5] tracking-tight">Founder Voice Profile</h2>
            </div>
            <p className="text-xs text-[#9ba3af] max-w-2xl">
              Repurpose uses this profile to generate content that sounds authentically like you, honoring your real background, startup context, cadence, and anti-cliché preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Profile Dropdown */}
            <select
              id="voice-profile-switcher"
              value={draft.id}
              onChange={(e) => handleSwitchProfile(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#16191c] border border-[#2e343b] text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 font-medium cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              id="create-profile-btn"
              onClick={handleCreateNewProfile}
              className="p-2 rounded-xl bg-[#22272b] hover:bg-[#282e34] text-[#cbd2d9] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors cursor-pointer"
              title="Create another voice profile"
            >
              <Plus className="w-4 h-4" />
            </button>

            {profiles.length > 1 && (
              <button
                id="delete-profile-btn"
                onClick={() => handleDeleteProfile(draft.id)}
                className="p-2 rounded-xl bg-[#22272b] hover:bg-rose-950/40 text-[#9ba3af] hover:text-rose-400 border border-[#2e343b] transition-colors cursor-pointer"
                title="Delete this profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              id="save-profile-top-btn"
              onClick={handleSaveProfile}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Founder & Startup Identity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Card */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#262b30] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#f0f2f5] border-b border-[#262b30] pb-3">
              1. Founder & Startup Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Profile Label
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Primary Founder Voice"
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Founder Name
                </label>
                <input
                  id="founder-name-input"
                  type="text"
                  value={draft.founderName}
                  onChange={(e) => setDraft({ ...draft, founderName: e.target.value })}
                  placeholder="e.g. Your Name (optional)"
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Startup / Company Name
                </label>
                <input
                  id="startup-name-input"
                  type="text"
                  value={draft.startupName}
                  onChange={(e) => setDraft({ ...draft, startupName: e.target.value })}
                  placeholder="e.g. Your Startup (optional)"
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Your Role
                </label>
                <input
                  id="founder-role-input"
                  type="text"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  placeholder="e.g. Technical Founder & CEO"
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                Startup One-Liner (What it actually does)
              </label>
              <input
                id="startup-oneliner-input"
                type="text"
                value={draft.startupOneLiner}
                onChange={(e) => setDraft({ ...draft, startupOneLiner: e.target.value })}
                placeholder="e.g. Embedded low-latency cache with instant durability for edge microservices"
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                Founder Bio & Background (Technical credibility)
              </label>
              <textarea
                id="founder-bio-textarea"
                rows={2}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="e.g. Former staff distributed systems engineer. Now bootstrapping a developer infrastructure platform."
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 resize-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Target Audience (ICP)
                </label>
                <input
                  id="target-audience-input"
                  type="text"
                  value={draft.targetAudience}
                  onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value })}
                  placeholder="e.g. Software engineers, tech leads, CTOs"
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-1">
                  Default Content Objective
                </label>
                <select
                  id="primary-goal-select"
                  value={draft.primaryGoal}
                  onChange={(e) => setDraft({ ...draft, primaryGoal: e.target.value as ContentGoal })}
                  className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#cbd2d9] focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  {goalsList.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Voice Archetypes & Tone Traits */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#262b30] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#f0f2f5] border-b border-[#262b30] pb-3">
              2. Content Styles & Tone Signatures
            </h3>

            {/* Preferred Archetypes */}
            <div>
              <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block mb-2">
                Preferred Archetypes (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStyles.map((style) => {
                  const isSelected = draft.preferredStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'bg-[#16191c] text-[#9ba3af] border border-[#262b30] hover:text-[#f0f2f5] hover:bg-[#22272b]'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Traits */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider block">
                Tone Characteristics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {draft.toneCharacteristics.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9]"
                  >
                    <span>{trait}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveToneTrait(trait)}
                      className="text-[#9ba3af] hover:text-rose-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newToneTrait}
                  onChange={(e) => setNewToneTrait(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToneTrait())}
                  placeholder="e.g. Unflinching, Self-aware, Systems-minded"
                  className="flex-1 rounded-xl bg-[#16191c] border border-[#2e343b] p-2 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddToneTrait}
                  className="px-3 py-1.5 rounded-xl bg-[#22272b] hover:bg-[#282e34] border border-[#2e343b] text-xs font-medium text-[#cbd2d9] hover:text-[#f0f2f5] cursor-pointer"
                >
                  Add Trait
                </button>
              </div>
            </div>

            {/* Banned Phrases */}
            <div className="space-y-2 pt-2 border-t border-[#262b30]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Phrases to Strictly Avoid</span>
                </label>
                <span className="text-[11px] text-[#9ba3af] font-mono">
                  {draft.bannedPhrases.length} banned
                </span>
              </div>
              <p className="text-[11px] text-[#9ba3af]">
                AI clichés and corporate jargon that will be strictly barred from all generations:
              </p>

              <div className="flex flex-wrap gap-1.5">
                {draft.bannedPhrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300"
                  >
                    <span>"{phrase}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBannedWord(phrase)}
                      className="text-rose-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newBannedWord}
                  onChange={(e) => setNewBannedWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBannedWord())}
                  placeholder="Add phrase to ban (e.g. 'game changer', 'unlock')"
                  className="flex-1 rounded-xl bg-[#16191c] border border-[#2e343b] p-2 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddBannedWord}
                  className="px-3 py-1.5 rounded-xl bg-[#22272b] hover:bg-[#282e34] border border-[#2e343b] text-xs font-medium text-[#cbd2d9] hover:text-[#f0f2f5] cursor-pointer"
                >
                  Ban Phrase
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Writing Samples & Learned Feedback */}
        <div className="lg:col-span-5 space-y-6">
          {/* Writing Samples Vault */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#262b30] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262b30] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#f0f2f5] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>3. Writing Samples Vault</span>
                </h3>
                <p className="text-[11px] text-[#9ba3af]">
                  {draft.writingSamples.length} samples registered
                </p>
              </div>

              <button
                id="analyze-voice-btn"
                type="button"
                onClick={handleAnalyzeVoice}
                disabled={isAnalyzing || draft.writingSamples.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isAnalyzing ? (
                  <RotateCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                )}
                <span>Analyze ({CREDIT_CONFIG.VOICE_FINGERPRINT_ANALYSIS} cr)</span>
              </button>
            </div>

            <p className="text-xs text-[#9ba3af] leading-relaxed">
              Paste authentic posts or paragraphs you have written. Repurpose uses these to learn your exact cadence, sentence lengths, and natural vocabulary.
            </p>

            {/* Samples List */}
            <div className="space-y-3">
              {draft.writingSamples.map((sample, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9] relative group"
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#262b30] text-[#9ba3af] text-[11px] font-mono">
                    <span>Sample #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSample(idx)}
                      className="text-[#9ba3af] hover:text-rose-400 cursor-pointer"
                      title="Remove sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="whitespace-pre-line line-clamp-4 leading-relaxed font-sans">
                    {sample}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Sample Box */}
            <div className="space-y-2 pt-2 border-t border-[#262b30]">
              <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block">
                Add Another Writing Sample
              </label>
              <textarea
                rows={3}
                value={newSampleDraft}
                onChange={(e) => setNewSampleDraft(e.target.value)}
                placeholder="Paste a raw tweet, LinkedIn post, or newsletter snippet you wrote..."
                className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-2.5 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 resize-none font-sans"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddSample}
                  className="px-3 py-1.5 rounded-xl bg-[#22272b] hover:bg-[#282e34] border border-[#2e343b] text-xs font-semibold text-[#f0f2f5] cursor-pointer"
                >
                  Save Sample
                </button>
              </div>
            </div>

            {/* AI Analysis Result Card */}
            {analysisResult && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Analyzed Voice Fingerprint</span>
                  </span>
                  <button
                    onClick={handleApplyAnalysis}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-semibold text-white cursor-pointer"
                  >
                    Apply Suggestions
                  </button>
                </div>

                <p className="text-xs text-[#cbd2d9] leading-relaxed">
                  {analysisResult.voiceSummary}
                </p>

                <div className="text-[11px] text-[#9ba3af]">
                  <strong className="text-[#f0f2f5]">Rhythm:</strong> {analysisResult.signatureRhythm}
                </div>
              </div>
            )}
          </div>

          {/* Learned Voice Adjustments (Feedback Loop Memory) */}
          <div className="rounded-2xl bg-[#1d2125] border border-[#262b30] p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#262b30] pb-3">
              <h3 className="text-sm font-bold text-[#f0f2f5] flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>4. Learned Voice Adjustments</span>
              </h3>
              <p className="text-[11px] text-[#9ba3af]">
                Persistent feedback memory collected when you tune generated drafts.
              </p>
            </div>

            {(draft.learnedAdjustments || []).length === 0 ? (
              <p className="text-xs text-[#9ba3af] italic">
                No adjustments yet. When you click "Tune Voice" on any generation and give feedback (e.g. "more direct", "less formal"), the system saves it here to guide all future posts.
              </p>
            ) : (
              <div className="space-y-2">
                {draft.learnedAdjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#16191c] border border-[#262b30] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = toggleLearnedAdjustment(draft.id, adj.id);
                          setDraft(updated);
                        }}
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] cursor-pointer ${
                          adj.active
                            ? 'bg-emerald-600 text-white'
                            : 'border border-[#2e343b] text-transparent'
                        }`}
                        title="Toggle rule active"
                      >
                        ✓
                      </button>
                      <span className={adj.active ? 'text-[#cbd2d9]' : 'text-[#64748b] line-through'}>
                        {adj.feedback}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = removeLearnedAdjustment(draft.id, adj.id);
                        setDraft(updated);
                      }}
                      className="text-[#9ba3af] hover:text-rose-400 p-1 cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
