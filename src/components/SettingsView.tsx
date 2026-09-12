import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Save,
  Download,
  Trash2,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { UserPreferences, getUserPreferences, saveUserPreferences } from '../utils/storage';
import { ContentStyle, Platform } from '../types';

interface SettingsViewProps {
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onClearLibrary: () => void;
  totalSaved: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNotify,
  onClearLibrary,
  totalSaved,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [isSaved, setIsSaved] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    hasApiKey: boolean;
    model: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => {
        console.error('Health check failed:', err);
      });
  }, []);

  const handleSave = () => {
    saveUserPreferences(prefs);
    setIsSaved(true);
    onNotify('success', 'Preferences saved successfully.');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const togglePlatform = (p: Platform) => {
    if (prefs.defaultPlatforms.includes(p)) {
      if (prefs.defaultPlatforms.length === 1) return; // Keep at least one
      setPrefs({
        ...prefs,
        defaultPlatforms: prefs.defaultPlatforms.filter((item) => item !== p),
      });
    } else {
      setPrefs({
        ...prefs,
        defaultPlatforms: [...prefs.defaultPlatforms, p],
      });
    }
  };

  const styles: ContentStyle[] = [
    'Founder',
    'Educational',
    'Storytelling',
    'Personal',
    'Bold / Contrarian',
    'Professional',
    'Casual',
  ];

  const exportEntireLibrary = () => {
    const raw = localStorage.getItem('repurpose_saved_library_v1') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurpose-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'Library backup downloaded.');
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl">
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Application Settings & Defaults
            </h2>
            <p className="text-xs text-zinc-400">
              Configure default audience parameters, editorial voice presets, and content filters.
            </p>
          </div>
        </div>
      </div>

      {/* Engine & AI Status Card */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">AI Engine & Server Status</h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-zinc-400 block mb-1">Active Model</span>
            <span className="text-zinc-100 font-bold font-mono">
              {healthStatus?.model || 'gemini-3.8-flash'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-zinc-400 block mb-1">Architecture</span>
            <span className="text-zinc-100 font-bold">Server-Side Proxy (Express)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-zinc-400 block mb-1">Anti-Cliché Filter</span>
            <span className="text-emerald-400 font-bold">Active & Enforced</span>
          </div>
        </div>
      </div>

      {/* Generation Defaults */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Default Repurpose Preferences</h3>
          </div>
        </div>

        <div className="space-y-4">
          {/* Default Platforms */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              Default Platforms Selected
            </label>
            <div className="flex flex-wrap gap-2">
              {(['x', 'linkedin', 'tiktok', 'instagram'] as Platform[]).map((p) => {
                const isSelected = prefs.defaultPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border border-indigo-500'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {p === 'x' ? 'X (Twitter)' : p === 'linkedin' ? 'LinkedIn' : p === 'tiktok' ? 'TikTok' : 'Instagram'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Style */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              Default Content Style
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, defaultStyle: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    prefs.defaultStyle === s
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Default Target Audience */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Default Target Audience
            </label>
            <input
              type="text"
              value={prefs.defaultAudience}
              onChange={(e) => setPrefs({ ...prefs, defaultAudience: e.target.value })}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Default Tone */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Default Desired Tone
            </label>
            <input
              type="text"
              value={prefs.defaultTone}
              onChange={(e) => setPrefs({ ...prefs, defaultTone: e.target.value })}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Default CTA */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Default Call To Action
            </label>
            <input
              type="text"
              value={prefs.defaultCta}
              onChange={(e) => setPrefs({ ...prefs, defaultCta: e.target.value })}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Preserve Voice Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <div>
              <span className="text-xs font-bold text-white block">
                Preserve Original Voice by Default
              </span>
              <span className="text-xs text-zinc-400">
                Maintains raw creator cadence, personal stories, and authentic phrasing.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, preserveVoice: !prefs.preserveVoice })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                prefs.preserveVoice ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  prefs.preserveVoice ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="save-settings-btn"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <h3 className="text-sm font-bold text-white">Data Management</h3>
          <span className="text-xs text-zinc-400">{totalSaved} items in local library</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="export-library-json-btn"
            onClick={exportEntireLibrary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Library as JSON</span>
          </button>

          <button
            id="clear-library-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all saved library items?')) {
                onClearLibrary();
                onNotify('info', 'Content library has been cleared.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Saved Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
