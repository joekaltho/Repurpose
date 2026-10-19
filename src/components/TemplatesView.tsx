import React from 'react';
import { BookTemplate, ArrowRight } from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { TemplatePrompt } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (template: TemplatePrompt) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div id="templates-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#1d2125] border border-[#262b30]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22272b] border border-[#2e343b] flex items-center justify-center text-emerald-400 font-bold">
            <BookTemplate className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#f0f2f5] tracking-tight">
              Founder Content Frameworks & Templates
            </h2>
            <p className="text-xs text-[#9ba3af] mt-0.5">
              Battle-tested structures designed to turn raw startup experiences into high-signal posts across platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAMPLE_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            id={`template-card-${tpl.id}`}
            className="rounded-2xl bg-[#1d2125] border border-[#262b30] hover:border-[#3d444d] p-5 sm:p-6 flex flex-col justify-between transition-all group space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-[#9ba3af]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-400">{tpl.category}</span>
                  <span>·</span>
                  <span>Style: {tpl.suggestedStyle}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#f0f2f5] group-hover:text-white transition-colors">
                {tpl.title}
              </h3>
              <p className="text-xs text-[#9ba3af] leading-relaxed">
                {tpl.description}
              </p>

              <div className="p-3.5 rounded-xl bg-[#16191c] border border-[#262b30] text-xs text-[#cbd2d9] line-clamp-4 leading-relaxed font-sans">
                "{tpl.sampleInput}"
              </div>
            </div>

            <div className="pt-3 border-t border-[#262b30] flex items-center justify-between">
              <div className="text-[11px] text-[#9ba3af]">
                Audience: <span className="text-[#cbd2d9] font-medium">{tpl.suggestedAudience}</span>
              </div>

              <button
                id={`use-template-btn-${tpl.id}`}
                onClick={() => onSelectTemplate(tpl)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
              >
                <span>Use Framework</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
