// ─────────────────────────────────────────────────────────────────────────────
// BUTTON
// Premium variant system. Every interactive button in the app uses this.
// Fully accessible — keyboard, ARIA, disabled states, loading states.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, radii, shadows, gradients } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:    ButtonVariant;
  size?:       ButtonSize;
  loading?:    boolean;
  leftIcon?:   ReactNode;
  rightIcon?:  ReactNode;
  fullWidth?:  boolean;
  children:    ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: gradients.gold,
    color:      '#060912',
    border:     'none',
    boxShadow:  shadows.gold,
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color:      colors.text.secondary,
    border:     `1px solid ${colors.border.dim}`,
    boxShadow:  'none',
  },
  ghost: {
    background: 'transparent',
    color:      colors.text.secondary,
    border:     'none',
    boxShadow:  'none',
  },
  danger: {
    background: colors.status.errorBg,
    color:      colors.status.error,
    border:     `1px solid ${colors.status.errorBdr}`,
    boxShadow:  'none',
  },
  teal: {
    background: gradients.teal,
    color:      '#060912',
    border:     'none',
    boxShadow:  shadows.teal,
  },
  outline: {
    background: 'transparent',
    color:      colors.classified.DEFAULT,
    border:     `1px solid ${colors.classified.border}`,
    boxShadow:  'none',
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 14px', fontSize: fontSizes.xs, borderRadius: radii.md },
  md: { padding: '12px 20px', fontSize: fontSizes.sm, borderRadius: radii.lg },
  lg: { padding: '14px 24px', fontSize: fontSizes.base, borderRadius: radii.lg },
  xl: { padding: '16px 32px', fontSize: fontSizes.base, borderRadius: radii.xl },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    const reduce    = useReducedMotion();
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      display:        'inline-flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            8,
      fontFamily:     fonts.display,
      fontWeight:     fontWeights.bold,
      letterSpacing:  letterSpacings.wider,
      textTransform:  'uppercase',
      cursor:         isDisabled ? 'not-allowed' : 'pointer',
      opacity:        isDisabled ? 0.5 : 1,
      width:          fullWidth ? '100%' : undefined,
      transition:     'all 0.2s ease',
      position:       'relative',
      userSelect:     'none',
      WebkitTapHighlightColor: 'transparent',
      ...VARIANT_STYLES[variant],
      ...SIZE_STYLES[size],
      ...style,
    };

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={isDisabled || reduce ? {} : { scale: 1.01 }}
        whileTap={isDisabled || reduce   ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={baseStyle}
        aria-busy={loading}
        {...rest}
      >
        {loading ? (
          <LoadingDots />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </motion.button>
    );
  },
);

function LoadingDots() {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ display: 'flex', gap: 4, alignItems: 'center' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{
            display:      'block',
            width:        5,
            height:       5,
            borderRadius: '50%',
            background:   'currentColor',
          }}
        />
      ))}
    </span>
  );
}
