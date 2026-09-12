import React, { useState, useMemo } from 'react';
import {
  Library,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Copy,
  Check,
  FileText,
  Share2,
  ExternalLink,
  Sparkles,
  Download,
} from 'lucide-react';
import { SavedContentItem, Platform, RepurposedOutput } from '../types';

interface ContentLibraryViewProps {
  library: SavedContentItem[];
  onOpenItem: (item: SavedContentItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Draft' | 'Saved' | 'Published') => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  library,
  onOpenItem,
  onDeleteItem,
  onUpdateStatus,
  onCopyText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered items
  const filteredItems = useMemo(() => {
    return library.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceContent.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform =
        selectedPlatformFilter === 'all' ||
        item.platforms.includes(selectedPlatformFilter as Platform);

      const matchesStatus =
        selectedStatusFilter === 'all' || item.status === selectedStatusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [library, searchTerm, selectedPlatformFilter, selectedStatusFilter]);

  const handleCopyMarkdown = (item: SavedContentItem) => {
    const output = item.output;
    let md = `# Repurposed Content: ${item.title}\nDate: ${new Date(item.createdAt).toLocaleDateString()}\n\n`;

    if (output.intelligence) {
      md += `## Content Intelligence\n**Core Idea:** ${output.intelligence.coreMessage}\n**Best Angle:** ${output.intelligence.bestAngle}\n\n`;
    }

    if (output.x) {
      md += `## X (Twitter)\n### Standalone Post\n${output.x.standalonePost}\n\n### Thread\n${output.x.thread.join('\n\n')}\n\n`;
    }

    if (output.linkedin) {
      md += `## LinkedIn\n${output.linkedin.variations.map((v) => `### ${v.title}\n${v.content}`).join('\n\n')}\n\n`;
    }

    if (output.tiktok) {
      md += `## TikTok / Reels\n${output.tiktok.scripts.map((s) => `### ${s.title}\nHook: ${s.hook}\nScript: ${s.spokenScript}\nCTA: ${s.callToAction}`).join('\n\n')}\n\n`;
    }

    if (output.instagram) {
      md += `## Instagram\n${output.instagram.captions.map((c, i) => `### Caption ${i + 1}\n${c.caption}`).join('\n\n')}\n\n`;
    }

    onCopyText(md, 'Markdown Export');
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="content-library-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-400" />
            Saved Content Library
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Access previous repurpose runs, review original ideas, and reopen for editing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">
            {filteredItems.length} of {library.length} items
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="library-search-input"
            type="text"
            placeholder="Search saved ideas, claims, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Platform filter */}
        <select
          id="library-platform-filter"
          value={selectedPlatformFilter}
          onChange={(e) => setSelectedPlatformFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All Platforms</option>
          <option value="x">X (Twitter)</option>
          <option value="linkedin">LinkedIn</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>

        {/* Status filter */}
        <select
          id="library-status-filter"
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="Saved">Saved</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-400">
            <Library className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-200">No saved content found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {searchTerm || selectedPlatformFilter !== 'all' || selectedStatusFilter !== 'all'
              ? 'Try clearing your search or adjusting filters.'
              : 'Create your first repurpose run and click "Save to Library" to keep your content organized here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              id={`library-item-${item.id}`}
              className="rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 p-5 space-y-4 flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {item.style}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) =>
                      onUpdateStatus(item.id, e.target.value as 'Draft' | 'Saved' | 'Published')
                    }
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border cursor-pointer focus:outline-hidden ${
                      item.status === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : item.status === 'Draft'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Saved">Saved</option>
                    <option value="Published">Published</option>
                  </select>
                </div>

                {/* Title & snippet */}
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {item.sourceSnippet}
                </p>
              </div>

              {/* Platforms & Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {item.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono"
                    >
                      {p === 'x' ? '𝕏' : p === 'linkedin' ? 'in' : p === 'tiktok' ? 'TT' : 'IG'}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`copy-markdown-${item.id}`}
                    onClick={() => handleCopyMarkdown(item)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Export as Markdown"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    id={`delete-item-${item.id}`}
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`open-item-${item.id}`}
                    onClick={() => onOpenItem(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs ml-1"
                  >
                    <span>Reopen & Edit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
