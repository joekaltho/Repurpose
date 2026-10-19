import React, { useState } from 'react';
import {
  BrainCircuit,
  X,
  Sparkles,
  RotateCw,
  Check,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import { Platform, VoiceProfile } from '../types';
import { CREDIT_CONFIG } from '../config/credits';

interface VoiceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: VoiceProfile;
  platform?: Platform;
  onApplyFeedback: (feedbackText: string, shouldRegenerate: boolean) => void;
  isRegenerating?: boolean;
}

export const VoiceFeedbackModal: React.FC<VoiceFeedbackModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  platform,
  onApplyFeedback,
  isRegenerating = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState<string>('');

  if (!isOpen) return null;

  const quickPresets = [
    'More direct and punchy — cut introductory throat-clearing.',
    'Less formal — sound like an engineer talking to a peer over coffee.',
    'Increase technical depth and mention real operational tradeoffs.',
    'More vulnerable founder storytelling — lean into the mistake.',
    'Never use hype emojis or bullet point checklists in the hook.',
    'This doesn\'t sound like me — make it simpler and more grounded.',
  ];

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setCustomFeedback(preset);
  };

  const handleSaveOnly = () => {
    const feedback = customFeedback.trim() || selectedPreset;
    if (!feedback) return;
    onApplyFeedback(feedback, false);
    onClose();
  };

  const handleSaveAndRegenerate = () => {
    const feedback = customFeedback.trim() || selectedPreset;
    if (!feedback) return;
    onApplyFeedback(feedback, true);
    onClose();
  };

  return (
    <div
      id="voice-feedback-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="voice-feedback-modal"
        className="w-full max-w-lg rounded-2xl bg-[#1d2125] border border-[#262b30] p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262b30]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f2f5]">Tune Voice & Teach System</h3>
              <p className="text-[11px] text-[#9ba3af]">
                Updating profile: <strong className="text-[#f0f2f5]">{activeProfile.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain the memory loop */}
        <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9] leading-relaxed">
          Repurpose does not pretend to guess. Your feedback is stored in your permanent Voice Profile as an active rule that will shape this post and all future generations.
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block">
            Common Voice Adjustments
          </label>
          <div className="flex flex-col gap-1.5">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  customFeedback === preset
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'bg-[#16191c] text-[#cbd2d9] border border-[#262b30] hover:bg-[#22272b] hover:text-[#f0f2f5]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#cbd2d9] uppercase tracking-wider block">
            Or Describe the Adjustment in Your Words
          </label>
          <textarea
            rows={3}
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            placeholder="e.g. Focus more on our database incident and less on generic startup advice..."
            className="w-full rounded-xl bg-[#16191c] border border-[#2e343b] p-3 text-xs text-[#f0f2f5] focus:outline-hidden focus:border-emerald-500 resize-none font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#262b30]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-[#9ba3af] hover:text-[#f0f2f5] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveOnly}
            disabled={!customFeedback.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#cbd2d9] bg-[#22272b] hover:bg-[#282e34] hover:text-[#f0f2f5] border border-[#2e343b] transition-colors disabled:opacity-40 cursor-pointer"
          >
            Save to Voice Memory
          </button>

          <button
            type="button"
            onClick={handleSaveAndRegenerate}
            disabled={!customFeedback.trim() || isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Save & Regenerate ({CREDIT_CONFIG.REGENERATE_SINGLE_PLATFORM} cr)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
