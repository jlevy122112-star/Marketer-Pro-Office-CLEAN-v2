// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC ENGINE — SHARED CONSTANTS
// Platform metadata, content types, and prompt starters used across scenes.
// ─────────────────────────────────────────────────────────────────────────────

import type { PlatformId, ContentType, BrandTone } from './types';

export interface PlatformMeta {
  id:     PlatformId;
  name:   string;
  color:  string;
  active: boolean;
}

export const PLATFORMS: PlatformMeta[] = [
  { id: 'facebook',  name: 'Facebook',  color: '#1877F2', active: true  },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', active: true  },
  { id: 'twitter',   name: 'X/Twitter', color: '#000000', active: true  },
  { id: 'linkedin',  name: 'LinkedIn',  color: '#0A66C2', active: true  },
  { id: 'tiktok',    name: 'TikTok',    color: '#FF0050', active: true  },
  { id: 'youtube',   name: 'YouTube',   color: '#FF0000', active: false },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', active: false },
  { id: 'snapchat',  name: 'Snapchat',  color: '#FFFC00', active: false },
];

export const ACTIVE_PLATFORMS     = PLATFORMS.filter((p) => p.active);
export const COMING_SOON_PLATFORMS = PLATFORMS.filter((p) => !p.active);

export function getPlatformMeta(id: PlatformId): PlatformMeta {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

export const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'post',      label: 'Post' },
  { id: 'image_ad',  label: 'Image Ad' },
  { id: 'video_ad',  label: 'Video Ad' },
  { id: 'carousel',  label: 'Carousel' },
  { id: 'story',     label: 'Story' },
  { id: 'reel',      label: 'Reel' },
];

export const BRAND_TONES: { id: BrandTone; label: string }[] = [
  { id: 'professional',  label: 'Professional' },
  { id: 'casual',         label: 'Casual' },
  { id: 'playful',        label: 'Playful' },
  { id: 'authoritative',  label: 'Authority' },
  { id: 'inspirational',  label: 'Inspirational' },
  { id: 'luxury',         label: 'Luxury' },
];

/**
 * Prompt starters — solves the cold-start problem on the Desk generator.
 * Tapping one pre-fills the textarea with the text after the emoji.
 */
export const PROMPT_STARTERS: string[] = [
  '✨ Announce a new product launch with excitement',
  '🎯 Share an industry insight that builds authority',
  '📣 Promote a limited-time offer with urgency',
  '💡 Educate my audience about a common misconception',
  '🤝 Share a customer success story',
];

/** Platform character limits — shown as live guidance in the generator form */
export const PLATFORM_CHAR_LIMITS: Record<PlatformId, number> = {
  facebook:  63206,
  instagram: 2200,
  twitter:   280,
  linkedin:  3000,
  tiktok:    2200,
  youtube:   5000,
  pinterest: 500,
  snapchat:  250,
};
