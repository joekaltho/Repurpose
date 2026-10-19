import React from 'react';
import { Menu, Plus, BookOpen, Coins } from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onNewRepurpose: () => void;
  onLoadSample: () => void;
  creditBalance: number;
  onOpenPricingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onNewRepurpose,
  onLoadSample,
  creditBalance,
  onOpenPricingModal,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Overview';
      case 'create':
        return 'Create & Repurpose';
      case 'voice':
        return 'Founder Voice Profile';
      case 'library':
        return 'Content Library';
      case 'templates':
        return 'Templates & Frameworks';
      case 'settings':
        return 'Settings & Defaults';
    }
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 h-16 bg-[#171a1d]/95 backdrop-blur-md border-b border-[#262b30] px-4 sm:px-8 flex items-center justify-between gap-4"
    >
      {/* Zone 1: Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#22272b] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#9ba3af] hidden sm:inline">Repurpose /</span>
          <h1 className="text-sm sm:text-base font-bold text-[#f0f2f5] tracking-tight">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Zone 3: Actions & Credit Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Credits Badge / Trigger */}
        <button
          id="navbar-credits-btn"
          onClick={onOpenPricingModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#cbd2d9] bg-[#1d2125] border border-[#2e343b] hover:border-[#3d444d] hover:bg-[#22272b] transition-colors shadow-xs cursor-pointer"
          title="View credit balance and capacity"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono tabular-nums text-[#f0f2f5] font-bold">{creditBalance}</span>
          <span className="text-[#9ba3af] text-[11px] hidden sm:inline">credits</span>
        </button>

        {currentTab === 'create' && (
          <button
            id="navbar-load-sample-btn"
            onClick={onLoadSample}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#cbd2d9] bg-[#1d2125] border border-[#2e343b] hover:border-[#3d444d] hover:bg-[#22272b] hover:text-[#f0f2f5] transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Try Sample</span>
          </button>
        )}

        <button
          id="navbar-new-repurpose-btn"
          onClick={onNewRepurpose}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm active:scale-98 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Repurpose</span>
        </button>
      </div>
    </header>
  );
};
