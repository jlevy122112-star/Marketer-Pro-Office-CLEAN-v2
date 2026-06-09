import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────
      colors: {
        'void': {
          900: '#080B14',
          800: '#0D1120',
        },
        'desk': {
          900: '#0D1120',
          800: '#111827',
          700: '#1a2233',
          600: '#1e293b',
        },
        // Classified gold — the primary brand accent
        'classified': {
          DEFAULT: '#C9A84C',
          light:   '#E8C96A',
          dark:    '#9d7c2e',
          dim:     'rgba(201,168,76,0.12)',
        },
        // Reactor teal — secondary accent
        'reactor': {
          DEFAULT: '#6EE7B7',
          dim:     'rgba(110,231,183,0.10)',
        },
      },

      // ─── Typography ─────────────────────────────────────────
      fontFamily: {
        display:    ['Syne', 'system-ui', 'sans-serif'],
        body:       ['DM Sans', 'system-ui', 'sans-serif'],
        heading:    ['DM Sans', 'system-ui', 'sans-serif'],
        classified: ['Syne', 'system-ui', 'sans-serif'],
        mono:       ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ─── Border radius ───────────────────────────────────────
      borderRadius: {
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      // ─── Animations ─────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.3' },
          '50%':     { opacity: '0.1' },
        },
        'spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':  'slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':  'scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':   'shimmer 1.5s ease-in-out infinite',
        'pulse-glow':'pulse-glow 2.5s ease-in-out infinite',
        'spin':      'spin 600ms linear infinite',
      },

      // ─── Box shadow ──────────────────────────────────────────
      boxShadow: {
        'gold':    '0 4px 20px rgba(201,168,76,0.25)',
        'gold-lg': '0 8px 40px rgba(201,168,76,0.4)',
        'void':    '0 4px 24px rgba(0,0,0,0.5)',
      },

      // ─── Background image ────────────────────────────────────
      backgroundImage: {
        'gold-gradient':       'linear-gradient(135deg, #C9A84C, #9d7c2e)',
        'gold-gradient-light': 'linear-gradient(135deg, #E8C96A, #C9A84C)',
        'void-gradient':       'linear-gradient(145deg, #080B14, #0D1120, #111827)',
        'grid-pattern': `
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;
