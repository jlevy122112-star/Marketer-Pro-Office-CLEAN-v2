// ─────────────────────────────────────────────────────────────────────────────
// HEADING
// Typography component for all display headings.
// Applies gold gradient text and Syne font automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode, type ElementType } from 'react';
import { fonts, fontSizes, fontWeights, letterSpacings, gradients, colors } from './tokens';

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps {
  level?:   HeadingLevel;
  gold?:    boolean;   // Apply gold gradient text
  children: ReactNode;
  style?:   React.CSSProperties;
}

const LEVEL_STYLES: Record<HeadingLevel, React.CSSProperties> = {
  1: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.extrabold, letterSpacing: letterSpacings.tighter },
  2: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.extrabold, letterSpacing: letterSpacings.tighter },
  3: { fontSize: fontSizes.xl,     fontWeight: fontWeights.bold,      letterSpacing: letterSpacings.tight },
  4: { fontSize: fontSizes.lg,     fontWeight: fontWeights.bold,      letterSpacing: letterSpacings.normal },
};

export function Heading({ level = 2, gold = true, children, style }: HeadingProps) {
  const Tag = (`h${level}`) as ElementType;

  const goldStyle: React.CSSProperties = gold ? {
    background:           gradients.goldText,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
  } : {
    color: colors.text.primary,
  };

  return (
    <Tag style={{
      fontFamily: fonts.display,
      margin:     0,
      ...LEVEL_STYLES[level],
      ...goldStyle,
      ...style,
    }}>
      {children}
    </Tag>
  );
}
