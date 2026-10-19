import {
  ContentStyle,
  Platform,
  RepurposedOutput,
  SavedContentItem,
  VoiceProfile,
  LearnedVoiceAdjustment,
  CreditAccount,
  CreditTransaction,
} from '../types';

const STORAGE_KEY = 'repurpose_saved_library_v1';
const PREFS_KEY = 'repurpose_user_preferences_v1';
const VOICE_PROFILES_KEY = 'repurpose_voice_profiles_v1';
const ACTIVE_PROFILE_KEY = 'repurpose_active_voice_profile_id_v1';
const CREDITS_KEY = 'repurpose_credits_account_v1';

export interface UserPreferences {
  defaultPlatforms: Platform[];
  defaultStyle: ContentStyle;
  defaultAudience: string;
  defaultTone: string;
  defaultCta: string;
  preserveVoice: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultPlatforms: ['x', 'linkedin', 'tiktok', 'instagram'],
  defaultStyle: 'Founder',
  defaultAudience: 'Technical founders, engineers, and startup CEOs',
  defaultTone: 'Pragmatic, sharp, high signal, zero fluff',
  defaultCta: 'Drop your perspective in the replies or follow for weekly breakdowns',
  preserveVoice: true,
};

export const INITIAL_FOUNDER_VOICE_PROFILE: VoiceProfile = {
  id: 'profile_default_founder',
  name: 'Default Builder Voice',
  founderName: '',
  role: 'Founder & Builder',
  bio: 'Technical founder building software and sharing practical lessons.',
  startupName: '',
  startupOneLiner: '',
  targetAudience: 'Software engineers, tech leads, CTOs, and builders',
  primaryGoal: 'Build in public',
  preferredStyles: ['Founder', 'Build-in-Public', 'Technical Deep-Dive', 'Bold / Contrarian'],
  toneCharacteristics: [
    'Direct & concise',
    'Pragmatic with clear tradeoffs',
    'Self-aware & grounded',
    'Zero corporate buzzwords',
  ],
  bannedPhrases: [
    'game changer',
    'supercharge',
    'in today\'s fast-paced world',
    'unleash',
    'crucial',
    'delve',
    'testament',
    'buckle up',
    'let\'s dive in',
    'at the end of the day',
  ],
  writingSamples: [
    `Technical decisions should be driven by immediate bottlenecks rather than hypothetical future scale. Simplicity scales much further than most teams anticipate.`,
    `High-signal communication requires stripping away jargon and clearly identifying the primary tradeoff. If an idea cannot be stated directly in two sentences, the underlying reasoning is not clear yet.`,
  ],
  learnedAdjustments: [
    {
      id: 'adj_1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      feedback: 'Keep sentences punchy and avoid filler introductory clauses.',
      active: true,
    },
    {
      id: 'adj_2',
      date: new Date(Date.now() - 86400000).toISOString(),
      feedback: 'Never use generic hype emojis in hooks or thread openings.',
      active: true,
    },
  ],
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ==================== VOICE PROFILES STORAGE ====================

export function getVoiceProfiles(): VoiceProfile[] {
  try {
    const raw = localStorage.getItem(VOICE_PROFILES_KEY);
    if (!raw) {
      const initial = [INITIAL_FOUNDER_VOICE_PROFILE];
      localStorage.setItem(VOICE_PROFILES_KEY, JSON.stringify(initial));
      return initial;
    }
    let parsed: VoiceProfile[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [INITIAL_FOUNDER_VOICE_PROFILE];
    }
    // Cleanse legacy default profile if it had fake Mercer / VeloceDB or polite compliments writing samples
    parsed = parsed.map((p) => {
      if (p.id === 'profile_default_founder') {
        return {
          ...p,
          founderName: p.founderName === 'Alex Mercer' ? '' : p.founderName,
          startupName: p.startupName === 'VeloceDB' ? '' : p.startupName,
          startupOneLiner: p.startupName === 'VeloceDB' ? '' : p.startupOneLiner,
          name: 'Default Builder Voice',
          writingSamples: INITIAL_FOUNDER_VOICE_PROFILE.writingSamples,
        };
      }
      return p;
    });
    localStorage.setItem(VOICE_PROFILES_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    console.error('Error reading voice profiles:', err);
    return [INITIAL_FOUNDER_VOICE_PROFILE];
  }
}

export function saveVoiceProfile(profile: VoiceProfile): VoiceProfile {
  const profiles = getVoiceProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  const updatedProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    profiles[index] = updatedProfile;
  } else {
    profiles.push(updatedProfile);
  }

  try {
    localStorage.setItem(VOICE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Error saving voice profile:', err);
  }
  return updatedProfile;
}

export function deleteVoiceProfile(id: string): void {
  const profiles = getVoiceProfiles().filter((p) => p.id !== id);
  if (profiles.length === 0) {
    profiles.push(INITIAL_FOUNDER_VOICE_PROFILE);
  }
  try {
    localStorage.setItem(VOICE_PROFILES_KEY, JSON.stringify(profiles));
    // If active profile was deleted, switch to first available
    const activeId = getActiveVoiceProfileId();
    if (activeId === id) {
      setActiveVoiceProfileId(profiles[0].id);
    }
  } catch (err) {
    console.error('Error deleting voice profile:', err);
  }
}

export function getActiveVoiceProfileId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (id) return id;
    const profiles = getVoiceProfiles();
    return profiles[0]?.id || INITIAL_FOUNDER_VOICE_PROFILE.id;
  } catch {
    return INITIAL_FOUNDER_VOICE_PROFILE.id;
  }
}

export function setActiveVoiceProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (err) {
    console.error('Error setting active voice profile:', err);
  }
}

export function getActiveVoiceProfile(): VoiceProfile {
  const profiles = getVoiceProfiles();
  const activeId = getActiveVoiceProfileId();
  return profiles.find((p) => p.id === activeId) || profiles[0] || INITIAL_FOUNDER_VOICE_PROFILE;
}

export function addLearnedAdjustment(
  profileId: string,
  feedbackText: string,
  platform?: Platform | 'all'
): VoiceProfile {
  const profiles = getVoiceProfiles();
  const profile = profiles.find((p) => p.id === profileId) || profiles[0];

  const newAdjustment: LearnedVoiceAdjustment = {
    id: `adj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    feedback: feedbackText.trim(),
    platform: platform || 'all',
    active: true,
  };

  profile.learnedAdjustments = [newAdjustment, ...(profile.learnedAdjustments || [])];
  profile.updatedAt = new Date().toISOString();
  saveVoiceProfile(profile);
  return profile;
}

export function toggleLearnedAdjustment(profileId: string, adjustmentId: string): VoiceProfile {
  const profiles = getVoiceProfiles();
  const profile = profiles.find((p) => p.id === profileId) || profiles[0];

  profile.learnedAdjustments = (profile.learnedAdjustments || []).map((adj) =>
    adj.id === adjustmentId ? { ...adj, active: !adj.active } : adj
  );
  profile.updatedAt = new Date().toISOString();
  saveVoiceProfile(profile);
  return profile;
}

export function removeLearnedAdjustment(profileId: string, adjustmentId: string): VoiceProfile {
  const profiles = getVoiceProfiles();
  const profile = profiles.find((p) => p.id === profileId) || profiles[0];

  profile.learnedAdjustments = (profile.learnedAdjustments || []).filter(
    (adj) => adj.id !== adjustmentId
  );
  profile.updatedAt = new Date().toISOString();
  saveVoiceProfile(profile);
  return profile;
}

// ==================== CREDITS & USAGE STORAGE ====================

import {
  DEFAULT_FREE_ALLOWANCE,
  CREDIT_CONFIG,
  calculateRepurposeCost,
} from '../config/credits';

const INITIAL_CREDIT_ACCOUNT: CreditAccount = {
  balance: DEFAULT_FREE_ALLOWANCE,
  totalUsed: 0,
  freeAllowance: DEFAULT_FREE_ALLOWANCE,
  tier: 'free',
  createdAt: new Date().toISOString(),
  history: [
    {
      id: 'tx_welcome_allowance',
      timestamp: new Date().toISOString(),
      amount: DEFAULT_FREE_ALLOWANCE,
      operation: 'quota_grant',
      description: `Initial free allowance (${DEFAULT_FREE_ALLOWANCE} credits)`,
    },
  ],
};

export function getCreditAccount(): CreditAccount {
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) {
      localStorage.setItem(CREDITS_KEY, JSON.stringify(INITIAL_CREDIT_ACCOUNT));
      return INITIAL_CREDIT_ACCOUNT;
    }
    const parsed = JSON.parse(raw);
    // Ensure all required fields exist without resetting balance
    if (typeof parsed.balance !== 'number' || isNaN(parsed.balance)) {
      parsed.balance = DEFAULT_FREE_ALLOWANCE;
    }
    if (typeof parsed.freeAllowance !== 'number') {
      parsed.freeAllowance = DEFAULT_FREE_ALLOWANCE;
    }
    if (!Array.isArray(parsed.history)) {
      parsed.history = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading credit account:', err);
    return INITIAL_CREDIT_ACCOUNT;
  }
}

/**
 * Checks whether user can afford an operation without mutating balance.
 */
export function checkCreditAffordability(cost: number): {
  ok: boolean;
  balance: number;
  cost: number;
  shortage: number;
} {
  const account = getCreditAccount();
  const ok = account.balance >= cost;
  return {
    ok,
    balance: account.balance,
    cost,
    shortage: ok ? 0 : cost - account.balance,
  };
}

/**
 * Records a successful deduction after the server operation has succeeded.
 * Prevents duplicate deductions using an idempotency requestId check.
 */
export function recordCompletedDeduction(
  amount: number,
  operation: CreditTransaction['operation'],
  description: string,
  requestId?: string,
  serverBalance?: number
): { success: boolean; balance: number; error?: string } {
  const account = getCreditAccount();

  // Prevent duplicate deductions for the exact same requestId
  if (requestId && account.history?.some((tx) => tx.requestId === requestId)) {
    return { success: true, balance: account.balance };
  }

  // If server provided authoritative balance, use it (clamped to >= 0)
  const newBalance =
    typeof serverBalance === 'number'
      ? Math.max(0, serverBalance)
      : Math.max(0, account.balance - amount);

  const newTransaction: CreditTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    amount: -amount,
    operation,
    description,
    requestId,
  };

  const updatedAccount: CreditAccount = {
    ...account,
    balance: newBalance,
    totalUsed: (account.totalUsed || 0) + amount,
    history: [newTransaction, ...(account.history || []).slice(0, 49)], // keep last 50 transactions
  };

  try {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(updatedAccount));
  } catch (err) {
    console.error('Error saving credit transaction:', err);
  }

  return { success: true, balance: newBalance };
}

/**
 * Reconciles the client credit state with authoritative server data
 */
export function syncCreditAccount(serverAccount: Partial<CreditAccount>): CreditAccount {
  const current = getCreditAccount();
  const updated: CreditAccount = {
    ...current,
    ...serverAccount,
    balance: typeof serverAccount.balance === 'number' ? Math.max(0, serverAccount.balance) : current.balance,
  };
  try {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error syncing credit account:', err);
  }
  return updated;
}


// ==================== SAVED LIBRARY STORAGE ====================

export function getSavedLibrary(): SavedContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedContentItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Cleanse all legacy starter items with fabricated launches or polite feedback
    const cleansed = parsed.filter(
      (item) =>
        !(
          item.id === 'starter_sample_item' ||
          item.id.startsWith('starter_') ||
          item.title?.toLowerCase().includes('polite feedback') ||
          JSON.stringify(item).includes('polite compliments')
        )
    );
    if (cleansed.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleansed));
    }
    return cleansed;
  } catch (err) {
    console.error('Error reading saved library:', err);
    return [];
  }
}

export function saveToLibrary(output: RepurposedOutput): SavedContentItem {
  const library = getSavedLibrary();
  const title =
    output.sourceTitle ||
    output.intelligence?.coreMessage?.slice(0, 60) ||
    'Repurposed Content Batch';

  const existingIndex = library.findIndex((item) => item.id === output.id);

  const savedItem: SavedContentItem = {
    id: output.id,
    createdAt: output.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title,
    sourceSnippet:
      output.sourceContent.slice(0, 160) + (output.sourceContent.length > 160 ? '...' : ''),
    sourceContent: output.sourceContent,
    platforms: output.platforms,
    style: output.style,
    status: output.status || 'Saved',
    output,
    voiceProfileName: output.voiceProfileName,
    contentGoal: output.contentGoal,
  };

  if (existingIndex >= 0) {
    library[existingIndex] = savedItem;
  } else {
    library.unshift(savedItem);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (err) {
    console.error('Error saving to library:', err);
  }

  return savedItem;
}

export function removeFromLibrary(id: string): void {
  const library = getSavedLibrary().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (err) {
    console.error('Error deleting from library:', err);
  }
}

export function updateSavedItemStatus(id: string, status: 'Draft' | 'Saved' | 'Published'): void {
  const library = getSavedLibrary();
  const item = library.find((i) => i.id === id);
  if (item) {
    item.status = status;
    item.output.status = status;
    item.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }
}

// ==================== USER PREFERENCES ====================

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving user preferences:', err);
  }
  return updated;
}
