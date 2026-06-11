import type { PlatformId } from '../types';

export const APP_NAME = 'Marketer-Pro';
export const APP_TAGLINE = 'Your Digital Office';
export const SUPABASE_PROJECT_ID = 'qormgykublfsmgacbpyx';

export const SUPPORT = {
  email: 'support@marketer-pro.app',
  privacy: 'https://marketer-pro.app/privacy',
  terms: 'https://marketer-pro.app/terms',
  deleteAccount: 'https://marketer-pro.app/delete-account',
  help: 'https://marketer-pro.app/help',
} as const;

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  gradient: string;
  active: boolean;
  comingSoon: boolean;
  maxChars: number;
  supportsVideo: boolean;
  supportsCarousel: boolean;
  supportsStories: boolean;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg,#1877F2,#0d5fbf)',
    active: true,
    comingSoon: false,
    maxChars: 63206,
    supportsVideo: true,
    supportsCarousel: true,
    supportsStories: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    gradient: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
    active: true,
    comingSoon: false,
    maxChars: 2200,
    supportsVideo: true,
    supportsCarousel: true,
    supportsStories: true,
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    color: '#000000',
    gradient: 'linear-gradient(135deg,#000000,#333333)',
    active: true,
    comingSoon: false,
    maxChars: 280,
    supportsVideo: true,
    supportsCarousel: false,
    supportsStories: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg,#0A66C2,#084d92)',
    active: true,
    comingSoon: false,
    maxChars: 3000,
    supportsVideo: true,
    supportsCarousel: true,
    supportsStories: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#FF0050',
    gradient: 'linear-gradient(135deg,#FF0050,#010101)',
    active: true,
    comingSoon: false,
    maxChars: 2200,
    supportsVideo: true,
    supportsCarousel: false,
    supportsStories: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg,#FF0000,#cc0000)',
    active: false,
    comingSoon: true,
    maxChars: 5000,
    supportsVideo: true,
    supportsCarousel: false,
    supportsStories: false,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    gradient: 'linear-gradient(135deg,#E60023,#ad081b)',
    active: false,
    comingSoon: true,
    maxChars: 500,
    supportsVideo: true,
    supportsCarousel: false,
    supportsStories: false,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    color: '#FFFC00',
    gradient: 'linear-gradient(135deg,#FFFC00,#f0eb00)',
    active: false,
    comingSoon: true,
    maxChars: 250,
    supportsVideo: true,
    supportsCarousel: false,
    supportsStories: true,
  },
];

export const ACTIVE_PLATFORMS = PLATFORMS.filter((p) => p.active);
export const COMING_SOON_PLATFORMS = PLATFORMS.filter((p) => p.comingSoon);

export const PLANS = [
  {
    id: 'free' as const,
    name: 'Starter',
    tagline: 'Try the vault',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: 0,
    badge: null,
    features: [
      '25 AI generations / month',
      '1 social account',
      '1 brand profile',
      '7-day analytics',
      'Standard AI model',
      'Community support',
    ],
    limits: {
      generationsPerMonth: 25,
      socialAccounts: 1,
      brandProfiles: 1,
      analyticsHistoryDays: 7,
    },
    stripePriceIds: { monthly: null, annual: null },
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    tagline: 'Built for creators',
    monthlyPrice: 29,
    annualPrice: 19,
    annualTotal: 228,
    badge: 'Most Popular',
    features: [
      'Unlimited AI generations',
      '10 social accounts',
      '5 brand profiles',
      '90-day analytics',
      'Advanced AI model',
      'Priority support',
      'Full vault progression',
      'Content scheduling',
      'Platform-optimized copy',
    ],
    limits: {
      generationsPerMonth: null,
      socialAccounts: 10,
      brandProfiles: 5,
      analyticsHistoryDays: 90,
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY ?? null,
      annual: import.meta.env.VITE_STRIPE_PRO_ANNUAL ?? null,
    },
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    tagline: 'For teams & agencies',
    monthlyPrice: 99,
    annualPrice: 79,
    annualTotal: 948,
    badge: null,
    features: [
      'Everything in Pro',
      'Unlimited accounts & brands',
      'Unlimited team members',
      '365-day analytics',
      'Predictive AI model',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: {
      generationsPerMonth: null,
      socialAccounts: null,
      brandProfiles: null,
      analyticsHistoryDays: 365,
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_ENT_MONTHLY ?? null,
      annual: import.meta.env.VITE_STRIPE_ENT_ANNUAL ?? null,
    },
  },
];

export const DEPARTMENTS = [
  { key: 'brand_identity_chamber', label: 'Brand Strategy',    icon: '🏛️', requiredLevel: 1, description: 'Voice, identity, and visual guidelines' },
  { key: 'audience_arena',         label: 'Audience Intel',    icon: '🎯', requiredLevel: 1, description: 'Segment and analyze target audiences' },
  { key: 'content_forge',          label: 'Content Forge',     icon: '⚡', requiredLevel: 1, description: 'AI-powered content for every format' },
  { key: 'tone_lab',               label: 'Tone Lab',          icon: '🎨', requiredLevel: 2, description: 'Craft your brand tone and creative direction' },
  { key: 'artifact_vault',         label: 'Artifact Vault',    icon: '🗄️', requiredLevel: 2, description: 'Store, organize, and repurpose assets' },
  { key: 'scheduler_tower',        label: 'Scheduler Tower',   icon: '🗓️', requiredLevel: 2, description: 'Plan and automate your calendar' },
  { key: 'analytics_observatory',  label: 'Observatory',       icon: '📊', requiredLevel: 3, description: 'Deep performance insights and forecasting' },
  { key: 'ppc_command_center',     label: 'PPC Command',       icon: '💰', requiredLevel: 4, description: 'Manage and optimize paid campaigns' },
  { key: 'multiverse_gate',        label: 'Multiverse Gate',   icon: '🌐', requiredLevel: 5, description: 'Coordinate all platforms simultaneously' },
] as const;

export const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPProgress(xp: number) {
  const level = getLevelFromXP(xp);
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const progress = xp - current;
  const required = next - current;
  return { level, progress, required, percent: Math.min(100, Math.round((progress / required) * 100)) };
}

export const TABS = [
  { id: 'create',   label: 'Create',   path: '/create'   },
  { id: 'plan',     label: 'Plan',     path: '/plan'     },
  { id: 'analyze',  label: 'Analyze',  path: '/analyze'  },
  { id: 'settings', label: 'Settings', path: '/settings' },
] as const;