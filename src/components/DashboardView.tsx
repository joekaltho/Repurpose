import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Library,
  BookOpen,
  UserCheck,
  Coins,
  Copy,
  Clock,
  Layers,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { SavedContentItem, TemplatePrompt, VoiceProfile, CreditAccount, Platform } from '../types';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  onNavigateToCreate: (initialText?: string, template?: TemplatePrompt) => void;
  onOpenLibraryItem: (item: SavedContentItem) => void;
  onNavigateToTab: (tab: NavTab) => void;
  library: SavedContentItem[];
  creditAccount: CreditAccount;
  activeVoiceProfile: VoiceProfile;
  onOpenPricingModal: () => void;
  onCopyText: (text: string, label: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToCreate,
  onOpenLibraryItem,
  onNavigateToTab,
  library,
  creditAccount,
  activeVoiceProfile,
  onOpenPricingModal,
  onCopyText,
}) => {
  // Take 3 high-impact templates for the quick-start area
  const quickStartTemplates = SAMPLE_TEMPLATES.slice(0, 3);

  // Recent 4 saved items from actual persisted library
  const recentItems = library.slice(0, 4);

  const formatRelativeDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const platformLabels: Record<Platform, string> = {
    x: 'X',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    instagram: 'Instagram',
  };

  return (
    <div id="dashboard-view" className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header & Primary Action Banner */}
      <div className="rounded-2xl bg-[#1d2125] border border-[#2e343b] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Founder Content Engine</span>
            <span className="text-[#9ba3af]">·</span>
            <span className="text-[#9ba3af]">
              Voice: {activeVoiceProfile.name}
              {activeVoiceProfile.startupName ? ` (${activeVoiceProfile.startupName})` : ''}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f0f2f5] tracking-tight">
            Turn your startup notes into publish-ready content.
          </h1>

          <p className="text-sm text-[#9ba3af] leading-relaxed">
            Paste raw engineering notes, product launch observations, or customer discovery findings.
            Generate platform-native packages for X, LinkedIn, TikTok, and Instagram with zero fluff.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            id="dashboard-cta-create"
            onClick={() => onNavigateToCreate()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Repurpose</span>
          </button>

          <button
            id="dashboard-cta-sample"
            onClick={() => onNavigateToCreate(quickStartTemplates[0]?.sampleInput, quickStartTemplates[0])}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16191c] hover:bg-[#22272b] text-[#cbd2d9] hover:text-[#f0f2f5] border border-[#2e343b] text-xs font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Try sample notes</span>
          </button>
        </div>
      </div>

      {/* 2. Account & Real Metric Strip (Anti-slop: real data only, tabular numbers) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Credit Balance */}
        <div
          onClick={onOpenPricingModal}
          className="p-4 rounded-xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ba3af] mb-1.5">
            <span className="font-medium">Credit Balance</span>
            <Coins className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#f0f2f5] tabular-nums">
              {creditAccount.balance}
            </span>
            <span className="text-xs text-[#9ba3af]">available</span>
          </div>
          <p className="text-[11px] text-[#9ba3af] mt-2 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
            <span>Manage allowance</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 2: Saved Projects */}
        <div
          onClick={() => onNavigateToTab('library')}
          className="p-4 rounded-xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ba3af] mb-1.5">
            <span className="font-medium">Saved Content</span>
            <Library className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#f0f2f5] tabular-nums">
              {library.length}
            </span>
            <span className="text-xs text-[#9ba3af]">projects</span>
          </div>
          <p className="text-[11px] text-[#9ba3af] mt-2 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
            <span>View library</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 3: Active Founder Voice */}
        <div
          onClick={() => onNavigateToTab('voice')}
          className="p-4 rounded-xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ba3af] mb-1.5">
            <span className="font-medium">Voice Profile</span>
            <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="truncate text-base font-bold text-[#f0f2f5] mt-1">
            {activeVoiceProfile.name}
          </div>
          <p className="text-[11px] text-[#9ba3af] mt-2 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
            <span>Edit characteristics</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 4: Platform Engine Coverage */}
        <div className="p-4 rounded-xl bg-[#1d2125] border border-[#262b30]">
          <div className="flex items-center justify-between text-xs text-[#9ba3af] mb-1.5">
            <span className="font-medium">Supported Channels</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#f0f2f5] tabular-nums">
              4
            </span>
            <span className="text-xs text-[#9ba3af]">platforms</span>
          </div>
          <p className="text-[11px] text-[#9ba3af] mt-2">
            X · LinkedIn · TikTok · IG
          </p>
        </div>
      </div>

      {/* 3. Quick-Start Starters Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#f0f2f5] tracking-tight">
              Quick-Start Prompts
            </h2>
            <p className="text-xs text-[#9ba3af]">
              Select a proven founder content structure to prefill the creation workspace.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('templates')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>All frameworks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStartTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onNavigateToCreate(template.sampleInput, template)}
              className="p-5 rounded-xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] hover:bg-[#22272b] transition-all flex flex-col justify-between cursor-pointer group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9ba3af]">
                  <span className="font-medium text-emerald-400/90">{template.category}</span>
                  <span>{template.suggestedStyle}</span>
                </div>
                <h3 className="text-sm font-bold text-[#f0f2f5] group-hover:text-white transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-[#9ba3af] line-clamp-3 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#262b30] flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Load framework</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Projects or Helpful Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#f0f2f5] tracking-tight">
              Recent Repurposed Content
            </h2>
            <p className="text-xs text-[#9ba3af]">
              Your saved outputs and previous generation runs.
            </p>
          </div>
          {library.length > 0 && (
            <button
              onClick={() => onNavigateToTab('library')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({library.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentItems.length === 0 ? (
          /* Empty State for New Users */
          <div className="rounded-xl bg-[#1d2125] border border-[#262b30] p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#16191c] border border-[#2e343b] flex items-center justify-center mx-auto text-[#9ba3af]">
              <Library className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-[#f0f2f5]">No generated content yet</h3>
              <p className="text-xs text-[#9ba3af] leading-relaxed">
                Paste your first thought, meeting note, or launch update to generate complete posts,
                threads, scripts, and carousels.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToCreate()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Start your first repurpose
              </button>
              <button
                onClick={() => onNavigateToCreate(quickStartTemplates[0]?.sampleInput, quickStartTemplates[0])}
                className="px-4 py-2 rounded-xl bg-[#16191c] hover:bg-[#22272b] text-[#cbd2d9] border border-[#2e343b] text-xs font-medium transition-colors cursor-pointer"
              >
                Load sample idea
              </button>
            </div>
          </div>
        ) : (
          /* Populated State with Real Data */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#9ba3af]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeDate(item.createdAt)}</span>
                      <span>·</span>
                      <span className="capitalize">{item.style}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16191c] text-[#cbd2d9] border border-[#2e343b]">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#f0f2f5] line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#9ba3af] line-clamp-2 leading-relaxed font-sans">
                    {item.sourceContent}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#262b30] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.platforms.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16191c] text-[#9ba3af] border border-[#262b30]"
                      >
                        {platformLabels[p] || p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopyText(item.sourceContent, 'Source notes')}
                      className="p-1.5 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
                      title="Copy original notes"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenLibraryItem(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Open in Editor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
