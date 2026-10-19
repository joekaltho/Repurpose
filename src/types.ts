export type Platform = 'x' | 'linkedin' | 'tiktok' | 'instagram';

export type ContentStyle =
  | 'Founder'
  | 'Educational'
  | 'Storytelling'
  | 'Personal'
  | 'Bold / Contrarian'
  | 'Build-in-Public'
  | 'Thought Leadership'
  | 'Technical Deep-Dive'
  | 'Professional'
  | 'Casual';

export type ContentGoal =
  | 'Drive signups'
  | 'Share engineering lessons'
  | 'Build in public'
  | 'Spark debate'
  | 'Recruit talent'
  | 'Document journey';

export type InputType = 'text' | 'url' | 'transcript';

export interface LearnedVoiceAdjustment {
  id: string;
  date: string;
  feedback: string;
  platform?: Platform | 'all';
  active: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  founderName: string;
  role: string;
  bio: string;
  startupName: string;
  startupOneLiner: string;
  targetAudience: string;
  primaryGoal: ContentGoal;
  preferredStyles: ContentStyle[];
  toneCharacteristics: string[];
  bannedPhrases: string[];
  writingSamples: string[];
  learnedAdjustments: LearnedVoiceAdjustment[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  timestamp: string;
  amount: number;
  operation: 'repurpose' | 'platform_regenerate' | 'voice_analysis' | 'quota_grant' | 'adjustment';
  description: string;
  requestId?: string;
}

export interface CreditAccount {
  balance: number;
  totalUsed: number;
  freeAllowance: number;
  tier: 'free' | 'paid';
  createdAt: string;
  history: CreditTransaction[];
}

export { CREDIT_CONFIG, calculateRepurposeCost, DEFAULT_FREE_ALLOWANCE } from './config/credits';

export interface ContentIntelligence {
  coreMessage: string;
  bestAngle: string;
  potentialHooks: string[];
  contentOpportunities: string[];
  keyQuotesAndClaims?: string[];
  missingContextNotes?: string[];
}

export interface XContent {
  hooks: string[]; // 3 genuinely different hook options
  standalonePost: string;
  thread: string[];
  closingLines: string[];
  callToAction?: string;
}

export interface LinkedInVariation {
  title: string;
  angle: string;
  content: string;
}

export interface LinkedInContent {
  variations: LinkedInVariation[];
  alternativeHooks?: string[]; // 2 alternative opening hooks
}

export interface TikTokScript {
  title: string;
  hook: string;
  spokenScript: string;
  onScreenText: string[];
  callToAction: string;
  estimatedDuration?: string;
}

export interface TikTokContent {
  scripts: TikTokScript[];
}

export interface InstagramCaption {
  caption: string;
  callToAction: string;
  suggestedHashtags: string[];
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  bodyText: string;
  visualNote: string;
}

export interface InstagramCarousel {
  topic: string;
  slides: CarouselSlide[];
}

export interface InstagramContent {
  captions: InstagramCaption[];
  carousel: InstagramCarousel;
  hookIdeas: string[];
}

export interface GroundingFlag {
  claim: string;
  reason: string;
  severity: 'warning' | 'info';
  platform?: Platform | 'general';
}

export interface SourceGroundingReport {
  isGrounded: boolean;
  status: 'grounded' | 'needs_review';
  score: number; // 0-100
  checkedAt: string;
  flags: GroundingFlag[];
  verifiedFactsCount: number;
  message: string;
  explicitFactsDetected?: string[];
}

export interface RepurposedOutput {
  id: string;
  createdAt: string;
  sourceContent: string;
  sourceTitle?: string;
  inputType: InputType;
  style: ContentStyle;
  targetAudience: string;
  desiredTone: string;
  callToAction: string;
  preserveVoice: boolean;
  platforms: Platform[];
  intelligence: ContentIntelligence;
  sourceGrounding?: SourceGroundingReport;
  x?: XContent;
  linkedin?: LinkedInContent;
  tiktok?: TikTokContent;
  instagram?: InstagramContent;
  status: 'Draft' | 'Saved' | 'Published';
  voiceProfileId?: string;
  voiceProfileName?: string;
  contentGoal?: ContentGoal;
}

export interface SavedContentItem {
  id: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  sourceSnippet: string;
  sourceContent: string;
  platforms: Platform[];
  style: ContentStyle;
  status: 'Draft' | 'Saved' | 'Published';
  output: RepurposedOutput;
  voiceProfileName?: string;
  contentGoal?: ContentGoal;
}

export interface RepurposeRequest {
  sourceContent: string;
  inputType: InputType;
  platforms: Platform[];
  style: ContentStyle;
  targetAudience: string;
  desiredTone: string;
  callToAction: string;
  preserveVoice: boolean;
  regeneratePlatform?: Platform;
  voiceProfile?: VoiceProfile;
  contentGoal?: ContentGoal;
}

export interface TemplatePrompt {
  id: string;
  title: string;
  category: string;
  description: string;
  sampleInput: string;
  suggestedStyle: ContentStyle;
  suggestedTone: string;
  suggestedAudience: string;
  suggestedGoal?: ContentGoal;
}
