import { Platform } from '../types';

/**
 * REPURPOSE - CENTRALIZED CREDIT & USAGE CONFIGURATION
 * 
 * All credit allowances and operation costs are defined here in one central place.
 * Economics can be adjusted directly by modifying the values below.
 */

// Default free allowance for new users (configurable)
export const DEFAULT_FREE_ALLOWANCE = 50;

// Operation credit costs (configurable)
export const CREDIT_CONFIG = {
  // Base cost for content intelligence analysis (core message, angle, hook extraction, context notes)
  BASE_INTELLIGENCE: 1,

  // Granular generation cost per selected platform
  PER_PLATFORM: {
    x: 3,         // 5 hooks, standalone post, thread, 3 closing lines
    linkedin: 3,  // 3 distinct variations with angles & storytelling
    tiktok: 3,    // 3 short-form video scripts with hooks, spoken script, on-screen text, CTAs
    instagram: 3, // 2 captions, carousel outline with slides, 5 hook ideas
  } as Record<Platform, number>,

  // Cost to regenerate a single platform using updated voice tuning or prompt
  REGENERATE_SINGLE_PLATFORM: 3,

  // Cost for AI-powered voice fingerprint analysis from sample writing
  VOICE_FINGERPRINT_ANALYSIS: 2,
};

/**
 * Calculates the exact credit cost for a repurposing request based on actual platforms selected.
 * Generating for 1 platform costs significantly less than generating for all 4 platforms.
 */
export function calculateRepurposeCost(platforms: Platform[], isRegeneration = false): number {
  if (isRegeneration) {
    return CREDIT_CONFIG.REGENERATE_SINGLE_PLATFORM;
  }

  if (!platforms || platforms.length === 0) {
    return CREDIT_CONFIG.BASE_INTELLIGENCE;
  }

  const platformCost = platforms.reduce((total, p) => {
    return total + (CREDIT_CONFIG.PER_PLATFORM[p] || 3);
  }, 0);

  return CREDIT_CONFIG.BASE_INTELLIGENCE + platformCost;
}
