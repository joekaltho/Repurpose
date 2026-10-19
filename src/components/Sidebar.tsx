import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  UserCheck,
  Library,
  BookTemplate,
  Settings,
  Layers,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { VoiceProfile } from '../types';

export type NavTab = 'dashboard' | 'create' | 'voice' | 'library' | 'templates' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  creditBalance: number;
  onOpenPricingModal: () => void;
  activeProfile: VoiceProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  isOpenMobile,
  onCloseMobile,
  creditBalance,
  onOpenPricingModal,
  activeProfile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'create' as NavTab,
      label: 'Create & Repurpose',
      icon: Sparkles,
    },
    {
      id: 'voice' as NavTab,
      label: 'Voice Profile',
      icon: UserCheck,
      badge: activeProfile.startupName ? activeProfile.startupName.slice(0, 10) : 'Active',
    },
    {
      id: 'library' as NavTab,
      label: 'Content Library',
      icon: Library,
      badge: savedCount > 0 ? savedCount.toString() : undefined,
    },
    {
      id: 'templates' as NavTab,
      label: 'Templates & Prompts',
      icon: BookTemplate,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#171a1d] border-r border-[#262b30] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#262b30]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22272b] border border-[#2e343b] flex items-center justify-center shadow-xs text-emerald-400 font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#f0f2f5]">Repurpose</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-[#9ba3af] font-medium">Founder Content Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#9ba3af] uppercase">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#22272b] text-[#f0f2f5] border border-[#2e343b] shadow-xs font-semibold'
                    : 'text-[#9ba3af] hover:text-[#f0f2f5] hover:bg-[#1d2125]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-[#9ba3af]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#16191c] text-[#cbd2d9] border border-[#262b30]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Credits & Subscription Box */}
        <div className="p-3 border-t border-[#262b30] space-y-2">
          <div className="p-3.5 rounded-xl bg-[#1d2125] border border-[#262b30] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#9ba3af] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Allowance</span>
              </span>
              <span className="font-mono text-xs font-bold text-[#f0f2f5] tabular-nums">
                {creditBalance} <span className="text-[#9ba3af] font-normal">credits</span>
              </span>
            </div>

            <div className="w-full bg-[#16191c] rounded-full h-1.5 overflow-hidden border border-[#262b30]">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(8, (creditBalance / 50) * 100))}%` }}
              />
            </div>

            <button
              id="sidebar-pricing-btn"
              onClick={onOpenPricingModal}
              className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-[#22272b] hover:bg-[#282e34] text-[11px] font-semibold text-[#cbd2d9] hover:text-[#f0f2f5] transition-colors flex items-center justify-between border border-[#2e343b] cursor-pointer"
            >
              <span>Manage Capacity</span>
              <ChevronRight className="w-3 h-3 text-[#9ba3af]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
