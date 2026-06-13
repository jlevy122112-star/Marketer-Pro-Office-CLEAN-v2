// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// Single source of truth for every color, spacing, radius, shadow,
// typography, and animation value used across the entire app.
// Import from here — never hardcode design values in components.
// ─────────────────────────────────────────────────────────────────────────────

// ── Color palette ─────────────────────────────────────────────────────────────
export const colors = {
  // Backgrounds — darkest to lightest
  void: {
    950: '#03050A',
    900: '#060912',
    800: '#0D1120',
    700: '#111827',
    600: '#1a2235',
    500: '#243047',
  },

  // Brand gold — primary accent
  classified: {
    light:   '#E8C54E',
    DEFAULT: '#C9A84C',
    dark:    '#9d7c2e',
    dim:     'rgba(201,168,76,0.6)',
    faint:   'rgba(201,168,76,0.15)',
    ghost:   'rgba(201,168,76,0.06)',
    border:  'rgba(201,168,76,0.25)',
    glow:    'rgba(201,168,76,0.35)',
  },

  // Reactor teal — secondary accent / success
  reactor: {
    light:   '#A7F3D0',
    DEFAULT: '#6EE7B7',
    dark:    '#10B981',
    dim:     'rgba(110,231,183,0.6)',
    faint:   'rgba(110,231,183,0.12)',
    ghost:   'rgba(110,231,183,0.06)',
    border:  'rgba(110,231,183,0.22)',
  },

  // Status
  status: {
    error:    '#F87171',
    errorBg:  'rgba(248,113,113,0.08)',
    errorBdr: 'rgba(248,113,113,0.25)',
    warning:  '#FBBF24',
    success:  '#34D399',
    info:     '#60A5FA',
  },

  // Text
  text: {
    primary:   '#FFFFFF',
    secondary: 'rgba(255,255,255,0.65)',
    tertiary:  'rgba(255,255,255,0.4)',
    faint:     'rgba(255,255,255,0.2)',
    ghost:     'rgba(255,255,255,0.08)',
  },

  // Borders
  border: {
    subtle:    'rgba(255,255,255,0.07)',
    dim:       'rgba(255,255,255,0.1)',
    moderate:  'rgba(255,255,255,0.15)',
  },

  // Platform brand colors
  platforms: {
    facebook:  '#1877F2',
    instagram: '#E4405F',
    twitter:   '#000000',
    linkedin:  '#0A66C2',
    tiktok:    '#FF0050',
    youtube:   '#FF0000',
    pinterest: '#E60023',
    snapchat:  '#FFFC00',
  },
} as const;

// ── Typography ─────────────────────────────────────────────────────────────────
export const fonts = {
  display: "'Syne', sans-serif",
  body:    "'DM Sans', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

export const fontSizes = {
  '2xs': '9px',
  xs:    '11px',
  sm:    '12px',
  base:  '14px',
  md:    '15px',
  lg:    '16px',
  xl:    '18px',
  '2xl': '22px',
  '3xl': '28px',
  '4xl': '36px',
  '5xl': '48px',
} as const;

export const fontWeights = {
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
} as const;

export const letterSpacings = {
  tighter: '-0.02em',
  tight:   '-0.01em',
  normal:  '0',
  wide:    '0.1em',
  wider:   '0.2em',
  widest:  '0.35em',
  caps:    '0.4em',
} as const;

// ── Spacing scale (4px base) ──────────────────────────────────────────────────
export const space = {
  0:   '0px',
  1:   '4px',
  2:   '8px',
  3:   '12px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  7:   '28px',
  8:   '32px',
  10:  '40px',
  12:  '48px',
  16:  '64px',
  20:  '80px',
} as const;

// ── Border radius ─────────────────────────────────────────────────────────────
export const radii = {
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'24px',
  '3xl':'32px',
  full: '9999px',
} as const;

// ── Shadows / glows ───────────────────────────────────────────────────────────
export const shadows = {
  gold:     '0 0 30px rgba(201,168,76,0.25)',
  goldLg:   '0 0 60px rgba(201,168,76,0.35)',
  goldXl:   '0 0 100px rgba(201,168,76,0.2)',
  teal:     '0 0 20px rgba(110,231,183,0.25)',
  card:     '0 4px 24px rgba(0,0,0,0.4)',
  modal:    '0 8px 48px rgba(0,0,0,0.6)',
  focus:    '0 0 0 3px rgba(201,168,76,0.2)',
} as const;

// ── Z-index scale ─────────────────────────────────────────────────────────────
export const zIndex = {
  base:       1,
  raised:     10,
  overlay:    100,
  scene:      200,  // Cinematic scenes
  toast:      400,  // Achievement toasts
  celebration:500,  // Level-up modal
  max:        9999, // Offline banner
} as const;

// ── Animation durations ───────────────────────────────────────────────────────
export const durations = {
  instant: 0,
  fast:    150,
  base:    200,
  slow:    350,
  xslow:   500,
  scene:   600,
} as const;

// ── Common gradients ──────────────────────────────────────────────────────────
export const gradients = {
  gold:       'linear-gradient(135deg, #C9A84C 0%, #9d7c2e 100%)',
  goldSheen:  'linear-gradient(135deg, #C9A84C 0%, #E8C54E 50%, #9d7c2e 100%)',
  teal:       'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)',
  void:       'linear-gradient(180deg, #060912 0%, #0D1120 100%)',
  goldText:   'linear-gradient(135deg, #C9A84C 0%, #E8C54E 100%)',
  goldRadial: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.08) 0%, transparent 65%)',
  grid:       'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)',
} as const;

// ── Reusable style objects ────────────────────────────────────────────────────
// These are CSSProperties-compatible and used directly in inline styles.

export const goldText: React.CSSProperties = {
  background:            gradients.goldText,
  WebkitBackgroundClip:  'text',
  WebkitTextFillColor:   'transparent',
  backgroundClip:        'text',
};

export const sectionLabel: React.CSSProperties = {
  fontFamily:      fonts.display,
  fontSize:        fontSizes['2xs'],
  fontWeight:      fontWeights.bold,
  letterSpacing:   letterSpacings.widest,
  textTransform:   'uppercase',
  color:           colors.classified.dim,
};

export const cardBase: React.CSSProperties = {
  borderRadius:  radii.xl,
  background:    colors.void[800],
  border:        `1px solid ${colors.border.subtle}`,
  padding:       space[4],
};

export const glassCard: React.CSSProperties = {
  borderRadius:        radii.xl,
  background:          'rgba(13,17,32,0.85)',
  border:              `1px solid ${colors.classified.border}`,
  backdropFilter:      'blur(20px)',
  WebkitBackdropFilter:'blur(20px)',
};

export const chipBase: React.CSSProperties = {
  padding:       `7px 12px`,
  borderRadius:  radii.md,
  fontFamily:    fonts.display,
  fontSize:      fontSizes.xs,
  fontWeight:    fontWeights.bold,
  letterSpacing: letterSpacings.wide,
  textTransform: 'uppercase',
  cursor:        'pointer',
  transition:    'all 0.2s ease',
  border:        '1px solid transparent',
};
