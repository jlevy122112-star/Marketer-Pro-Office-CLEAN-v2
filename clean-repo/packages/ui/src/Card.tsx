// ─────────────────────────────────────────────────────────────────────────────
// CARD
// Surface container used for stats, artifact previews, settings rows.
// Supports press (tapable), glow accent color, and skeleton loading.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, radii, space, shadows } from './tokens';

export type CardVariant = 'default' | 'glass' | 'gold' | 'teal' | 'error';

interface CardProps {
  children:     ReactNode;
  variant?:     CardVariant;
  accent?:      string;           // Any CSS color — overrides variant border/glow
  onPress?:     () => void;
  padding?:     string | number;
  borderRadius?: string;
  style?:       React.CSSProperties;
  loading?:     boolean;
  'aria-label'?: string;
}

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: colors.void[800],
    border:     `1px solid ${colors.border.subtle}`,
  },
  glass: {
    background:          'rgba(13,17,32,0.85)',
    border:              `1px solid ${colors.classified.border}`,
    backdropFilter:      'blur(20px)',
    WebkitBackdropFilter:'blur(20px)',
  },
  gold: {
    background: colors.classified.ghost,
    border:     `1px solid ${colors.classified.border}`,
    boxShadow:  `0 0 30px ${colors.classified.faint}`,
  },
  teal: {
    background: colors.reactor.ghost,
    border:     `1px solid ${colors.reactor.border}`,
  },
  error: {
    background: colors.status.errorBg,
    border:     `1px solid ${colors.status.errorBdr}`,
  },
};

export function Card({
  children,
  variant    = 'default',
  accent,
  onPress,
  padding    = space[4],
  borderRadius = radii.xl,
  style,
  loading    = false,
  'aria-label': ariaLabel,
}: CardProps) {
  const reduce = useReducedMotion();

  const baseStyle: React.CSSProperties = {
    borderRadius,
    padding,
    position:   'relative',
    overflow:   'hidden',
    transition: 'all 0.2s ease',
    cursor:     onPress ? 'pointer' : 'default',
    ...VARIANT_STYLES[variant],
    ...(accent ? {
      border:    `1px solid ${accent}30`,
      boxShadow: `0 0 20px ${accent}12`,
    } : {}),
    ...style,
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        aria-busy="true"
        style={{
          ...baseStyle,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s linear infinite',
          minHeight: 80,
        }}
      />
    );
  }

  if (onPress) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPress(); }}
        onClick={onPress}
        whileHover={reduce ? {} : { scale: 1.005, boxShadow: shadows.card }}
        whileTap={reduce   ? {} : { scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={baseStyle}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div aria-label={ariaLabel} style={baseStyle}>
      {children}
    </div>
  );
}
