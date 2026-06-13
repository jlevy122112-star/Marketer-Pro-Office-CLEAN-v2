// ─────────────────────────────────────────────────────────────────────────────
// CHIP
// Platform chips, content type chips, filter chips.
// Active state uses the chip's own color (e.g. Instagram pink).
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fonts, fontSizes, fontWeights, letterSpacings, colors, radii } from './tokens';

interface ChipProps {
  active?:    boolean;
  color?:     string;     // Brand color override (for platform chips)
  disabled?:  boolean;
  onClick?:   () => void;
  children:   ReactNode;
  style?:     React.CSSProperties;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
}

export function Chip({
  active   = false,
  color,
  disabled = false,
  onClick,
  children,
  style,
  'aria-label':   ariaLabel,
  'aria-pressed': ariaPressed,
}: ChipProps) {
  const reduce = useReducedMotion();
  const accent = color ?? colors.classified.DEFAULT;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed ?? active}
      whileTap={reduce || disabled ? {} : { scale: 0.95 }}
      style={{
        padding:       '7px 12px',
        borderRadius:  radii.md,
        fontFamily:    fonts.display,
        fontSize:      fontSizes.xs,
        fontWeight:    fontWeights.bold,
        letterSpacing: letterSpacings.wide,
        textTransform: 'uppercase',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        border:        `1px solid ${active ? `${accent}60` : colors.border.subtle}`,
        background:    active ? `${accent}18` : 'transparent',
        color:         active ? accent : disabled ? colors.text.faint : colors.text.tertiary,
        opacity:       disabled ? 0.45 : 1,
        transition:    'all 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
