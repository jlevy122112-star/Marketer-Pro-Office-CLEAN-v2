import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:       { 900: '#060912', 800: '#0D1120', 700: '#111827', 600: '#1a2235' },
        classified: { DEFAULT: '#C9A84C', dark: '#9d7c2e', light: '#E8C54E' },
        reactor:    { DEFAULT: '#6EE7B7', dark: '#10B981' },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
