export type Platform = 'x' | 'linkedin' | 'tiktok' | 'instagram';

export type ContentStyle =
  | 'Founder'
  | 'Educational'
  | 'Storytelling'
  | 'Personal'
  | 'Bold / Contrarian'
  | 'Professional'
  | 'Casual';

export type InputType = 'text' | 'url' | 'transcript';

export interface ContentIntelligence {
  coreMessage: string;
  bestAngle: string;
  potentialHooks: string[];
  contentOpportunities: string[];
  keyQuotesAndClaims?: string[];
}

export interface XContent {
  hooks: string[];
  standalonePost: string;
  thread: string[];
  closingLines: string[];
}

export interface LinkedInVariation {
  title: string;
  angle: string;
  content: string;
}

export interface LinkedInContent {
  variations: LinkedInVariation[];
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
  x?: XContent;
  linkedin?: LinkedInContent;
  tiktok?: TikTokContent;
  instagram?: InstagramContent;
  status: 'Draft' | 'Saved' | 'Published';
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
}
