import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CreateView } from './components/CreateView';
import { VoiceProfileView } from './components/VoiceProfileView';
import { ContentLibraryView } from './components/ContentLibraryView';
import { TemplatesView } from './components/TemplatesView';
import { SettingsView } from './components/SettingsView';
import { PricingModal } from './components/PricingModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  LayoutDashboard,
  Sparkles,
  Library,
  UserCheck,
  BookTemplate,
  Settings,
} from 'lucide-react';
import {
  SavedContentItem,
  RepurposedOutput,
  TemplatePrompt,
  VoiceProfile,
  CreditAccount,
} from './types';
import {
  getSavedLibrary,
  saveToLibrary,
  removeFromLibrary,
  updateSavedItemStatus,
  getActiveVoiceProfile,
  getVoiceProfiles,
  saveVoiceProfile,
  setActiveVoiceProfileId,
  getCreditAccount,
} from './utils/storage';
import { SAMPLE_TEMPLATES } from './data/templates';
import { validateContentGrounding } from './utils/sourceGrounding';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [library, setLibrary] = useState<SavedContentItem[]>([]);
  const [currentOutput, setCurrentOutput] = useState<RepurposedOutput | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePrompt | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Voice Profile state
  const [activeVoiceProfile, setActiveVoiceProfile] = useState<VoiceProfile>(getActiveVoiceProfile());
  const [allVoiceProfiles, setAllVoiceProfiles] = useState<VoiceProfile[]>(getVoiceProfiles());

  // Credits & Pricing state
  const [creditAccount, setCreditAccount] = useState<CreditAccount>(getCreditAccount());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Toast notification helper
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      showToast('success', `Copied ${label} to clipboard!`);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('success', `Copied ${label} to clipboard!`);
    }
  };

  // Refresh credits
  const refreshCredits = () => {
    setCreditAccount(getCreditAccount());
  };

  // Initialize library on mount & cleanse any legacy mock starter items
  useEffect(() => {
    const saved = getSavedLibrary();
    setLibrary(saved);
  }, []);

  const handleSaveToLibrary = (output: RepurposedOutput) => {
    saveToLibrary(output);
    setLibrary(getSavedLibrary());
    showToast('success', 'Content saved to Content Library!');
  };

  const handleOpenLibraryItem = (item: SavedContentItem) => {
    setCurrentOutput(item.output);
    setCurrentTab('create');
    showToast('info', `Opened: ${item.title}`);
  };

  const handleDeleteLibraryItem = (id: string) => {
    removeFromLibrary(id);
    setLibrary(getSavedLibrary());
    showToast('info', 'Item removed from library.');
  };

  const handleUpdateStatus = (id: string, status: 'Draft' | 'Saved' | 'Published') => {
    updateSavedItemStatus(id, status);
    setLibrary(getSavedLibrary());
    showToast('success', `Status updated to ${status}.`);
  };

  const handleClearEntireLibrary = () => {
    localStorage.removeItem('repurpose_saved_library_v1');
    setLibrary([]);
  };

  const handleSelectTemplate = (template: TemplatePrompt) => {
    setSelectedTemplate(template);
    setCurrentTab('create');
    showToast('info', `Loaded template: ${template.title}`);
  };

  const handleNavigateToCreate = (initialText?: string, template?: TemplatePrompt) => {
    if (template) {
      setSelectedTemplate(template);
    } else if (initialText) {
      setSelectedTemplate({
        id: 'quick_custom',
        title: 'Custom Startup Note',
        description: 'Loaded custom notes',
        category: 'Quick-Start',
        suggestedStyle: 'Founder',
        suggestedTone: 'Pragmatic, sharp, high signal, zero fluff',
        suggestedAudience: 'Technical founders and builders',
        sampleInput: initialText,
      });
    }
    setCurrentTab('create');
  };

  const handleNewRepurpose = () => {
    setCurrentOutput(null);
    setSelectedTemplate(null);
    setCurrentTab('create');
    showToast('info', 'Ready for new content input!');
  };

  const handleLoadSampleFromNavbar = () => {
    const randomTemplate = SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)];
    setSelectedTemplate(randomTemplate);
    setCurrentTab('create');
    showToast('info', `Sample loaded: ${randomTemplate.title}`);
  };

  const handleSelectVoiceProfile = (id: string) => {
    setActiveVoiceProfileId(id);
    const profiles = getVoiceProfiles();
    const selected = profiles.find((p) => p.id === id) || profiles[0];
    setActiveVoiceProfile(selected);
    showToast('info', `Active Voice: ${selected.name}`);
  };

  const handleUpdateActiveProfile = (updated: VoiceProfile) => {
    saveVoiceProfile(updated);
    setActiveVoiceProfile(updated);
    setAllVoiceProfiles(getVoiceProfiles());
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#111315] text-[#cbd2d9] flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={library.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        creditBalance={creditAccount.balance}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        activeProfile={activeVoiceProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNewRepurpose={handleNewRepurpose}
          onLoadSample={handleLoadSampleFromNavbar}
          creditBalance={creditAccount.balance}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
        />

        {/* Dynamic Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToCreate={handleNavigateToCreate}
              onOpenLibraryItem={handleOpenLibraryItem}
              onNavigateToTab={setCurrentTab}
              library={library}
              creditAccount={creditAccount}
              activeVoiceProfile={activeVoiceProfile}
              onOpenPricingModal={() => setIsPricingModalOpen(true)}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'create' && (
            <CreateView
              currentOutput={currentOutput}
              onUpdateOutput={(updated) => {
                setCurrentOutput(updated);
                saveToLibrary(updated);
                setLibrary(getSavedLibrary());
              }}
              onSaveToLibrary={handleSaveToLibrary}
              onCopyText={handleCopyText}
              onNotify={showToast}
              initialTemplate={selectedTemplate}
              activeVoiceProfile={activeVoiceProfile}
              allVoiceProfiles={allVoiceProfiles}
              onSelectVoiceProfile={handleSelectVoiceProfile}
              onOpenVoiceProfileTab={() => setCurrentTab('voice')}
              onOpenPricingModal={() => setIsPricingModalOpen(true)}
              creditBalance={creditAccount.balance}
              onRefreshCredits={refreshCredits}
              onUpdateVoiceProfile={handleUpdateActiveProfile}
            />
          )}

          {currentTab === 'voice' && (
            <VoiceProfileView
              activeProfile={activeVoiceProfile}
              onUpdateActiveProfile={handleUpdateActiveProfile}
              onNotify={showToast}
              onRefreshCredits={refreshCredits}
            />
          )}

          {currentTab === 'library' && (
            <ContentLibraryView
              library={library}
              onOpenItem={handleOpenLibraryItem}
              onDeleteItem={handleDeleteLibraryItem}
              onUpdateStatus={handleUpdateStatus}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView onSelectTemplate={handleSelectTemplate} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onNotify={showToast}
              onClearLibrary={handleClearEntireLibrary}
              totalSaved={library.length}
            />
          )}
        </main>
      </div>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#171a1d]/95 backdrop-blur-md border-t border-[#262b30] px-2 py-1.5 flex items-center justify-around lg:hidden"
      >
        {[
          { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
          { id: 'create' as NavTab, label: 'Create', icon: Sparkles },
          { id: 'library' as NavTab, label: 'Library', icon: Library, badge: library.length },
          { id: 'voice' as NavTab, label: 'Voice', icon: UserCheck },
          { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-[#9ba3af] hover:text-[#cbd2d9]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-[#9ba3af]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Monetization & Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        creditAccount={creditAccount}
        onUpdateAccount={(updated) => setCreditAccount(updated)}
        onNotify={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
