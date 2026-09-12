import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CreateView } from './components/CreateView';
import { ContentLibraryView } from './components/ContentLibraryView';
import { TemplatesView } from './components/TemplatesView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  SavedContentItem,
  RepurposedOutput,
  TemplatePrompt,
} from './types';
import {
  getSavedLibrary,
  saveToLibrary,
  removeFromLibrary,
  updateSavedItemStatus,
} from './utils/storage';
import { SAMPLE_TEMPLATES } from './data/templates';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('create');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [library, setLibrary] = useState<SavedContentItem[]>([]);
  const [currentOutput, setCurrentOutput] = useState<RepurposedOutput | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePrompt | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('success', `Copied ${label} to clipboard!`);
    }
  };

  // Initialize library on mount & seed initial high-converting item if empty
  useEffect(() => {
    const saved = getSavedLibrary();
    if (saved.length === 0) {
      // Seed a starter item so user can immediately experience the library
      const starterTemplate = SAMPLE_TEMPLATES[0];
      const starterOutput: RepurposedOutput = {
        id: 'starter_sample_item',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sourceContent: starterTemplate.sampleInput,
        sourceTitle: 'The Contrarian Lesson: Why polite feedback kills startups',
        inputType: 'text',
        style: 'Bold / Contrarian',
        targetAudience: 'Founders, operators, and builders',
        desiredTone: 'Direct, sharp, no-fluff',
        callToAction: 'Drop your thoughts below',
        preserveVoice: true,
        platforms: ['x', 'linkedin', 'tiktok', 'instagram'],
        status: 'Saved',
        intelligence: {
          coreMessage:
            'Most startups fail not from poor products, but from building for phantom polite customers instead of desperate payers.',
          bestAngle:
            'Counter-intuitive reality: Why polite user feedback is more dangerous than hostile rejection.',
          potentialHooks: [
            'Polite feedback is the silent killer of early-stage startups.',
            'We asked 40 people for $49/mo. 39 ghosted. Here is the one who paid:',
            'If your users aren’t swearing about the problem, you’re building a hobby.',
            'Stop optimizing for compliments. Optimize for desperate relief.',
            'The single metric that changed our revenue trajectory:',
          ],
          contentOpportunities: [
            'Breakdown of the exact spreadsheet migration that got $45k MRR',
            'The 5 polite questions founders ask that give false signals',
            'How to identify a desperate customer in the first 3 minutes of a call',
          ],
        },
        x: {
          hooks: [
            'Polite feedback is the silent killer of early-stage startups.',
            'We asked 40 people for $49/mo. 39 ghosted. Here is what happened next:',
            'Stop building for the customer you wish existed.',
            'If someone isn’t swearing about their problem, you have a hobby, not a business.',
            'How we went from 39 rejections to $45k MRR in 4 months:',
          ],
          standalonePost: `Most startups fail not because their product is bad, but because they build for a phantom customer who gives polite feedback rather than the desperate one who actually pays.\n\nStop optimizing for compliments. Solve the bleeding neck problem.\n\nSimplicity scales. Polite noise stalls.`,
          thread: [
            `1/6 Most startups fail not because their product is bad, but because they build for a phantom customer who gives polite praise instead of urgent cash.\n\nHere is what took us 9 months to learn:`,
            `2/6 We interviewed 40 people for our AI workflow app.\n\nEvery single one smiled and said: "This looks super cool, definitely keep me updated."\n\nWhen we asked for $49/month, 39 of them ghosted.`,
            `3/6 The only person who pulled out their card?\n\nA frantic logistics broker managing 14 spreadsheets who didn't care about our sleek UI or AI buzzwords.\n\nHe cared that his team was losing 4 hours every Tuesday fixing shipment tracking mismatches.`,
            `4/6 We stripped out 80% of our fancy features and rebuilt around his messy Excel problem.\n\nWe grew to $45k MRR in 4 months.`,
            `5/6 The Golden Rule:\n\nIf someone isn't swearing about the problem or pulling out their card before the call ends, you are building a hobby, not a business.`,
            `6/6 If this resonated, RT tweet 1 and bookmark it for your next product review.`,
          ],
          closingLines: [
            'If this resonated, RT the first tweet to save a founder 9 months.',
            'Drop a reply: What is the single most annoying task your customer has today?',
            'Bookmark this before your next product roadmap session.',
          ],
        },
        linkedin: {
          variations: [
            {
              title: 'The Hard-Won Lesson (Story Angle)',
              angle: 'Vulnerable narrative contrasting polite user interviews with real buyer behavior.',
              content: `Polite feedback is the silent killer of early-stage companies.\n\nThree years ago, my co-founder and I spent 9 months building what we thought was the ultimate AI workflow optimizer.\n\nWe ran 40 user interviews.\n\nEvery single person said: "This looks super cool, definitely keep me posted!"\n\nThen we launched and asked for $49/month.\n\n39 of them ghosted.\n\nThe one customer who actually paid? A frantic logistics broker managing 14 spreadsheets who didn't care about our sleek UI or tech stack.\n\nHe cared that his team was losing 4 hours every Tuesday fixing shipment tracking mismatches.\n\nWe stripped out 80% of our fancy features, rebuilt around his messy Excel problem, and grew to $45k MRR in 4 months.\n\nTwo lessons:\n1. If someone isn't swearing about the problem, it's a nice-to-have.\n2. True demand is loud, messy, and urgent.\n\nWhat is one lesson you had to learn the hard way?`,
            },
            {
              title: 'The Tactical Filter (Framework)',
              angle: '3-question filter founders can use to test if user feedback is real or fake.',
              content: `A 3-step filter to prevent you from wasting 9 months building the wrong thing:\n\n1. The Card Pull Test\nDon't ask "Would you use this?" Ask: "Can I charge your card $49 right now to reserve early access?" Polite compliments evaporate instantly.\n\n2. The Frequency Test\nAre they dealing with this friction every single day, or once a quarter?\n\n3. The Subtraction Rule\nWhat happens if you remove 80% of your planned roadmap and only solve their single most painful bottleneck?\n\nKeep the main thing the main thing.`,
            },
            {
              title: 'The Contrarian Observation (Bold)',
              angle: 'Sharp critique of founder vanity metrics vs cash flow.',
              content: `Unpopular opinion:\n\nMost founders don't fail from lack of talent. They fail from vanity.\n\nThey would rather spend 9 months looking like a high-tech venture company with a sleek UI than spend 2 hours manually fixing an unsexy spreadsheet problem for someone who actually has money.\n\nFix the bleeding neck problem first.\n\nAgree or disagree?`,
            },
          ],
        },
        tiktok: {
          scripts: [
            {
              title: 'The Reality Check Hook',
              hook: 'Stop asking your friends if your startup idea is good. Here is why.',
              spokenScript: `(Fast cut, looking directly into lens)\nStop asking your friends if your startup idea is good. Here is why.\n\nWe spent 9 months building an AI app. We had 40 people tell us 'This looks so cool, definitely keep me updated.'\n\nThen we asked for $49. 39 of them vanished.\n\nHere is the truth: Polite compliments are completely free. If someone isn't swearing about their problem or pulling out their card, you have a hobby, not a business.\n\nFocus on the desperate customer, not the polite one.`,
              onScreenText: [
                'Polite advice is a trap 🪤',
                '39 out of 40 ghosted 💀',
                'Compliments are FREE 💸',
                'Hobby vs. Business 🎯',
              ],
              callToAction: 'Drop a comment if you have ever fallen for polite feedback.',
              estimatedDuration: '35 seconds',
            },
            {
              title: 'The $45k MRR Pivot',
              hook: 'How we deleted 80% of our product and went to $45,000 a month:',
              spokenScript: `(Casual storytelling tone)\nHow we deleted 80% of our product and made $45k a month:\n\nWe spent nearly a year building all these complex AI features. Nobody cared.\n\nThe ONLY guy who paid was a logistics broker who was losing his mind over 14 messy spreadsheets.\n\nWe deleted almost everything we built, focused purely on his Tuesday spreadsheet headache, and our revenue exploded.\n\nSimplicity wins every time.`,
              onScreenText: [
                'Deleted 80% of code ✂️',
                'Fix the messy problem 📑',
                'From $0 to $45k MRR 🚀',
              ],
              callToAction: 'Save this for your next business review.',
              estimatedDuration: '40 seconds',
            },
            {
              title: 'The 3-Second Rule',
              hook: 'The single question that tells you if a business will make money.',
              spokenScript: `(Pointing to screen)\nAsk this one question on your next customer call:\n\n'Can I charge your card $50 right now to fix this for you by Friday?'\n\nIf they hesitate or make excuses, they don't actually care. If they say 'take my card right now', you just found product-market fit.`,
              onScreenText: [
                'The 1 Question that matters ⚡',
                'Take my card test 💳',
                'Find real urgency 🔍',
              ],
              callToAction: 'Follow for more unfiltered founder breakdowns.',
              estimatedDuration: '28 seconds',
            },
          ],
        },
        instagram: {
          captions: [
            {
              caption: `Polite feedback is the silent killer of early-stage companies.\n\nWhen people say "this looks neat", they are being polite. When they ask "can I pay for this right now?", you have a real business.\n\nWe learned this the hard way after wasting 9 months on features nobody asked for.\n\nSwipe through the carousel 👉 to see how we stripped away 80% of our product and grew to $45k MRR.\n\nDrop a 💡 if you needed this reminder today!`,
              callToAction: 'Save this post for your next strategy session.',
              suggestedHashtags: [
                '#startuptips',
                '#founderinsights',
                '#productmarketfit',
                '#contentstrategy',
                '#buildinginpublic',
                '#repurpose',
              ],
            },
            {
              caption: `You don't need permission, venture capital, or 20 features to be useful.\n\nYou just need to care more about solving someone's acute pain than protecting your ego.\n\nWhat is the single biggest bottleneck in your project right now?\nLet's troubleshoot it in the comments below! 👇`,
              callToAction: 'Drop your current bottleneck below!',
              suggestedHashtags: [
                '#entrepreneurmindset',
                '#saasfounder',
                '#creatoreconomy',
                '#solopreneur',
                '#focus',
              ],
            },
          ],
          carousel: {
            topic: 'Why Polite Feedback Kills Startups (And What to Do Instead)',
            slides: [
              {
                slideNumber: 1,
                headline: 'The Polite Feedback Trap',
                bodyText: 'Why 90% of early-stage projects stall before their first paying customer.',
                visualNote: 'Bold contrasting sans-serif typography on dark slate canvas with purple pill.',
              },
              {
                slideNumber: 2,
                headline: '39 Out of 40 Ghosted',
                bodyText: 'Everyone told us: "Looks cool, keep us updated!" When we asked for $49/mo, 39 vanished.',
                visualNote: 'Visual comparison of Compliments vs. Real Credit Card Commits.',
              },
              {
                slideNumber: 3,
                headline: 'The Desperate Customer Rule',
                bodyText: 'The only person who paid was losing 4 hours every Tuesday over messy spreadsheets.',
                visualNote: 'Focal diagram showing the difference between Nice-to-Have and Bleeding Neck Pain.',
              },
              {
                slideNumber: 4,
                headline: 'Radical Subtraction',
                bodyText: 'We deleted 80% of our complex features and doubled down solely on his spreadsheet problem.',
                visualNote: 'Before & After architecture illustration.',
              },
              {
                slideNumber: 5,
                headline: 'From $0 to $45k MRR',
                bodyText: 'A messy solution that solves a real pain today beats an immaculate solution next year.',
                visualNote: 'Growth curve infographic with Key Milestone markers.',
              },
              {
                slideNumber: 6,
                headline: 'Save This For Your Next Roadmap',
                bodyText: 'Double tap if this resonated. Tag a builder who needs to hear this today.',
                visualNote: 'Clean share & save call to action with custom bookmark icons.',
              },
            ],
          },
          hookIdeas: [
            'Stop building for people who give you polite feedback.',
            'How we deleted 80% of our code and grew to $45k MRR:',
            'The difference between a nice hobby and a real business:',
            'Why compliments are the most dangerous thing a founder can hear:',
            'The 3-second test for real product-market fit:',
          ],
        },
      };

      const seededItem = saveToLibrary(starterOutput);
      setLibrary([seededItem]);
      setCurrentOutput(starterOutput);
    } else {
      setLibrary(saved);
      if (!currentOutput && saved.length > 0) {
        setCurrentOutput(saved[0].output);
      }
    }
  }, []);

  const handleSaveToLibrary = (output: RepurposedOutput) => {
    const saved = saveToLibrary(output);
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

  return (
    <div id="app-root" className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={library.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNewRepurpose={handleNewRepurpose}
          onLoadSample={handleLoadSampleFromNavbar}
        />

        {/* Dynamic Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
