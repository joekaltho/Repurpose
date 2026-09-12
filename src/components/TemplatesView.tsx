import React from 'react';
import { BookTemplate, ArrowRight, Sparkles, Zap, Tag } from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../data/templates';
import { TemplatePrompt } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (template: TemplatePrompt) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div id="templates-view" className="space-y-6">
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BookTemplate className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              High-Converting Frameworks & Inspiration
            </h2>
            <p className="text-xs text-zinc-400">
              Battle-tested structures designed to be transformed into cross-platform content.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SAMPLE_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            id={`template-card-${tpl.id}`}
            className="rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 p-5 sm:p-6 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {tpl.category}
                </span>
                <span className="text-xs text-zinc-400 font-medium">Style: {tpl.suggestedStyle}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                {tpl.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {tpl.description}
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 line-clamp-4 leading-relaxed font-sans mb-4">
                "{tpl.sampleInput}"
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="text-[11px] text-zinc-400">
                Audience: <span className="text-zinc-300 font-medium">{tpl.suggestedAudience}</span>
              </div>

              <button
                id={`use-template-btn-${tpl.id}`}
                onClick={() => onSelectTemplate(tpl)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-xs group-hover:shadow-indigo-600/30"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
