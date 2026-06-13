// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// Inline status label. Used for plan names, post status, level display.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { fonts, fontSizes, fontWeights, letterSpacings, colors, radii } from './tokens';

type BadgeVariant = 'gold' | 'teal' | 'error' | 'warning' | 'neutral';

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  ReactNode;
  style?:    React.CSSProperties;
}

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  gold: {
    background: 'rgba(201,168,76,0.12)',
    color:      colors.classified.DEFAULT,
    border:     `1px solid ${colors.classified.border}`,
  },
  teal: {
    background: colors.reactor.faint,
    color:      colors.reactor.DEFAULT,
    border:     `1px solid ${colors.reactor.border}`,
  },
  error: {
    background: colors.status.errorBg,
    color:      colors.status.error,
    border:     `1px solid ${colors.status.errorBdr}`,
  },
  warning: {
    background: 'rgba(251,191,36,0.1)',
    color:      colors.status.warning,
    border:     '1px solid rgba(251,191,36,0.22)',
  },
  neutral: {
    background: 'rgba(255,255,255,0.05)',
    color:      colors.text.tertiary,
    border:     `1px solid ${colors.border.subtle}`,
  },
};

export function Badge({ variant = 'gold', children, style }: BadgeProps) {
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      padding:       '3px 8px',
      borderRadius:  radii.sm,
      fontFamily:    fonts.display,
      fontSize:      fontSizes['2xs'],
      fontWeight:    fontWeights.bold,
      letterSpacing: letterSpacings.wider,
      textTransform: 'uppercase',
      whiteSpace:    'nowrap',
      ...BADGE_STYLES[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}
