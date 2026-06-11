export const PLATFORMS = [
  { id: 'facebook',  name: 'Facebook',   color: '#1877F2', active: true,  comingSoon: false },
  { id: 'instagram', name: 'Instagram',  color: '#E4405F', active: true,  comingSoon: false },
  { id: 'twitter',   name: 'X/Twitter',  color: '#000000', active: true,  comingSoon: false },
  { id: 'linkedin',  name: 'LinkedIn',   color: '#0A66C2', active: true,  comingSoon: false },
  { id: 'tiktok',    name: 'TikTok',     color: '#FF0050', active: true,  comingSoon: false },
  { id: 'youtube',   name: 'YouTube',    color: '#FF0000', active: false, comingSoon: true  },
  { id: 'pinterest', name: 'Pinterest',  color: '#E60023', active: false, comingSoon: true  },
  { id: 'snapchat',  name: 'Snapchat',   color: '#FFFC00', active: false, comingSoon: true  },
] as const;

export const ACTIVE_PLATFORMS    = PLATFORMS.filter((p) => p.active);
export const COMING_SOON_PLATFORMS = PLATFORMS.filter((p) => p.comingSoon);

export const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Try the vault',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: 0,
    badge: null,
    features: ['25 AI generations/mo','1 social account','1 brand','7-day analytics','Standard AI','Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Built for creators',
    monthlyPrice: 29,
    annualPrice: 19,
    annualTotal: 228,
    badge: 'Most Popular',
    features: ['Unlimited generations','10 social accounts','5 brands','90-day analytics','Advanced AI','Priority support','Full vault progression','Content scheduling'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For teams & agencies',
    monthlyPrice: 99,
    annualPrice: 79,
    annualTotal: 948,
    badge: null,
    features: ['Everything in Pro','Unlimited accounts & brands','Unlimited team members','365-day analytics','Predictive AI','White-label options','Dedicated manager','SLA guarantee'],
  },
] as const;

export const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPProgress(xp: number) {
  const level   = getLevelFromXP(xp);
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next    = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  return {
    level,
    progress: xp - current,
    required: next - current,
    percent: Math.min(100, Math.round(((xp - current) / (next - current)) * 100)),
  };
}

export const SUPPORT = {
  email:       'support@marketer-pro.app',
  privacy:     'https://marketer-pro.app/privacy',
  terms:       'https://marketer-pro.app/terms',
  deleteAccount:'https://marketer-pro.app/delete-account',
  help:        'https://marketer-pro.app/help',
} as const;
