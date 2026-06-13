// ─────────────────────────────────────────────────────────────────────────────
// TEXT
// Body text component. DM Sans font, semantic color variants.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode, type ElementType } from 'react';
import { fonts, fontSizes, fontWeights, colors } from './tokens';

type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'faint' | 'gold' | 'teal' | 'error';
type TextSize    = '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg';
type TextAs      = 'p' | 'span' | 'label' | 'div' | 'li';

interface TextProps {
  variant?:   TextVariant;
  size?:      TextSize;
  weight?:    keyof typeof fontWeights;
  as?:        TextAs;
  mono?:      boolean;
  uppercase?: boolean;
  children:   ReactNode;
  style?:     React.CSSProperties;
  id?:        string;
  htmlFor?:   string;
}

const VARIANT_COLORS: Record<TextVariant, string> = {
  primary:   colors.text.primary,
  secondary: colors.text.secondary,
  tertiary:  colors.text.tertiary,
  faint:     colors.text.faint,
  gold:      colors.classified.DEFAULT,
  teal:      colors.reactor.DEFAULT,
  error:     colors.status.error,
};

export function Text({
  variant   = 'secondary',
  size      = 'base',
  weight    = 'normal',
  as        = 'p',
  mono      = false,
  uppercase = false,
  children,
  style,
  id,
  htmlFor,
}: TextProps) {
  const Tag = as as ElementType;

  return (
    <Tag
      id={id}
      htmlFor={htmlFor}
      style={{
        fontFamily:    mono ? fonts.mono : fonts.body,
        fontSize:      fontSizes[size],
        fontWeight:    fontWeights[weight],
        color:         VARIANT_COLORS[variant],
        textTransform: uppercase ? 'uppercase' : undefined,
        lineHeight:    1.6,
        margin:        0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
