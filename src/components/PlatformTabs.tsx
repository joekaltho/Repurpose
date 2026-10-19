import React from 'react';
import { Platform, RepurposedOutput } from '../types';
import { XView } from './platform/XView';
import { LinkedInView } from './platform/LinkedInView';
import { TikTokView } from './platform/TikTokView';
import { InstagramView } from './platform/InstagramView';
import { Sparkles, Plus, Share2, Layers, RefreshCw } from 'lucide-react';

interface PlatformTabsProps {
  output: RepurposedOutput;
  activePlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
  onUpdateOutput: (updated: RepurposedOutput) => void;
  onCopyText: (text: string, label: string) => void;
  onRegeneratePlatform: (platform: Platform) => void;
  onSaveToLibrary: () => void;
  onGenerateMore: () => void;
  onOpenVoiceTuner?: (platform: Platform) => void;
  isRegenerating?: boolean;
}

export const PlatformTabs: React.FC<PlatformTabsProps> = ({
  output,
  activePlatform,
  onSelectPlatform,
  onUpdateOutput,
  onCopyText,
  onRegeneratePlatform,
  onSaveToLibrary,
  onGenerateMore,
  onOpenVoiceTuner,
  isRegenerating = false,
}) => {
  const platforms = output.platforms || [];

  const getPlatformMeta = (p: Platform) => {
    switch (p) {
      case 'x':
        return {
          name: 'X (Twitter)',
          icon: '𝕏',
          badge: output.x ? 'Post & Thread' : 'Available',
          color: 'text-[#f0f2f5]',
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          icon: 'in',
          badge: output.linkedin ? 'Primary Post' : 'Available',
          color: 'text-[#0a66c2]',
        };
      case 'tiktok':
        return {
          name: 'TikTok / Reels',
          icon: '▶',
          badge: output.tiktok ? 'Video Script' : 'Available',
          color: 'text-rose-400',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: '📸',
          badge: output.instagram ? 'Caption & Carousel' : 'Available',
          color: 'text-amber-400',
        };
    }
  };

  return (
    <div id="platform-tabs-container" className="space-y-4">
      {/* Platform Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262b30]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {platforms.map((platform) => {
            const meta = getPlatformMeta(platform);
            const isActive = activePlatform === platform;
            return (
              <button
                key={platform}
                id={`platform-tab-${platform}`}
                onClick={() => onSelectPlatform(platform)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#22272b] text-[#f0f2f5] border border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/15'
                    : 'bg-[#1d2125] text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] border border-[#262b30]'
                }`}
              >
                <span className={`font-mono text-xs ${meta.color}`}>{meta.icon}</span>
                <span>{meta.name}</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-[#cbd2d9] border border-[#262b30]">
                  {meta.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Generate More Button */}
        <button
          id="generate-more-btn"
          onClick={onGenerateMore}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Regenerate Suite</span>
        </button>
      </div>

      {/* Active Platform View */}
      <div className="mt-2">
        {activePlatform === 'x' && output.x && (
          <XView
            content={output.x}
            onUpdateContent={(updated) => onUpdateOutput({ ...output, x: updated })}
            onCopy={onCopyText}
            onRegenerate={() => onRegeneratePlatform('x')}
            onSaveToLibrary={onSaveToLibrary}
            onOpenVoiceTuner={() => onOpenVoiceTuner?.('x')}
            isRegenerating={isRegenerating}
          />
        )}

        {activePlatform === 'linkedin' && output.linkedin && (
          <LinkedInView
            content={output.linkedin}
            onUpdateContent={(updated) => onUpdateOutput({ ...output, linkedin: updated })}
            onCopy={onCopyText}
            onRegenerate={() => onRegeneratePlatform('linkedin')}
            onSaveToLibrary={onSaveToLibrary}
            onOpenVoiceTuner={() => onOpenVoiceTuner?.('linkedin')}
            isRegenerating={isRegenerating}
          />
        )}

        {activePlatform === 'tiktok' && output.tiktok && (
          <TikTokView
            content={output.tiktok}
            onUpdateContent={(updated) => onUpdateOutput({ ...output, tiktok: updated })}
            onCopy={onCopyText}
            onRegenerate={() => onRegeneratePlatform('tiktok')}
            onSaveToLibrary={onSaveToLibrary}
            onOpenVoiceTuner={() => onOpenVoiceTuner?.('tiktok')}
            isRegenerating={isRegenerating}
          />
        )}

        {activePlatform === 'instagram' && output.instagram && (
          <InstagramView
            content={output.instagram}
            onUpdateContent={(updated) => onUpdateOutput({ ...output, instagram: updated })}
            onCopy={onCopyText}
            onRegenerate={() => onRegeneratePlatform('instagram')}
            onSaveToLibrary={onSaveToLibrary}
            onOpenVoiceTuner={() => onOpenVoiceTuner?.('instagram')}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </div>
  );
};
