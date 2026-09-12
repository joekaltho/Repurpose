import React from 'react';
import { Menu, Plus, Sparkles, BookOpen, Layers } from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onNewRepurpose: () => void;
  onLoadSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onNewRepurpose,
  onLoadSample,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'create':
        return 'Repurpose Engine';
      case 'library':
        return 'Content Library';
      case 'templates':
        return 'Templates & Frameworks';
      case 'settings':
        return 'Preferences & Settings';
    }
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">Repurpose /</span>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {currentTab === 'create' && (
          <button
            id="navbar-load-sample-btn"
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Try Sample Content</span>
            <span className="sm:hidden">Sample</span>
          </button>
        )}

        <button
          id="navbar-new-repurpose-btn"
          onClick={onNewRepurpose}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Repurpose</span>
        </button>
      </div>
    </header>
  );
};
