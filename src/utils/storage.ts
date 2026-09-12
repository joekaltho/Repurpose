import { ContentStyle, Platform, RepurposedOutput, SavedContentItem } from '../types';

const STORAGE_KEY = 'repurpose_saved_library_v1';
const PREFS_KEY = 'repurpose_user_preferences_v1';

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
  defaultAudience: 'Founders, builders, and ambitious professionals',
  defaultTone: 'Insightful, direct, no-fluff',
  defaultCta: 'Drop your perspective in the comments or follow for more',
  preserveVoice: true,
};

export function getSavedLibrary(): SavedContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
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
    sourceSnippet: output.sourceContent.slice(0, 160) + (output.sourceContent.length > 160 ? '...' : ''),
    sourceContent: output.sourceContent,
    platforms: output.platforms,
    style: output.style,
    status: output.status || 'Saved',
    output,
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
