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
  isRegenerating = false,
}) => {
  const platforms = output.platforms || [];

  const getPlatformMeta = (p: Platform) => {
    switch (p) {
      case 'x':
        return {
          name: 'X (Twitter)',
          icon: '𝕏',
          badge: output.x ? '1 Thread, 1 Post, 5 Hooks' : 'Available',
          color: 'text-zinc-100',
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          icon: 'in',
          badge: output.linkedin ? '3 Post Angles' : 'Available',
          color: 'text-[#0a66c2]',
        };
      case 'tiktok':
        return {
          name: 'TikTok / Reels',
          icon: '▶',
          badge: output.tiktok ? '3 Video Scripts' : 'Available',
          color: 'text-rose-400',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: '📸',
          badge: output.instagram ? '1 Carousel, 2 Captions' : 'Available',
          color: 'text-amber-400',
        };
    }
  };

  return (
    <div id="platform-tabs-container" className="space-y-6">
      {/* Platform Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {platforms.map((platform) => {
            const meta = getPlatformMeta(platform);
            const isActive = activePlatform === platform;
            return (
              <button
                key={platform}
                id={`platform-tab-${platform}`}
                onClick={() => onSelectPlatform(platform)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-indigo-500/50 shadow-md shadow-black/40 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800/80'
                }`}
              >
                <span className={`font-mono text-xs ${meta.color}`}>{meta.icon}</span>
                <span>{meta.name}</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-400">
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/40 hover:border-indigo-400 transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Generate More</span>
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
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </div>
  );
};
