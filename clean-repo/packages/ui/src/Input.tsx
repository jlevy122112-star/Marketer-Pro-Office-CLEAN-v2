// ─────────────────────────────────────────────────────────────────────────────
// INPUT (FLOATING LABEL)
// The accessible floating-label input from the compliance audit.
// Fixes WCAG 2.1 AA failure — placeholder is never the only label.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, radii } from './tokens';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label:        string;
  error?:       string;
  rightElement?: ReactNode;
  inputSize?:   'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, rightElement, inputSize = 'md', value, onChange, style, ...rest }, ref) {
    const [focused, setFocused] = useState(false);
    const hasValue  = String(value ?? '').length > 0;
    const lifted    = focused || hasValue;
    const topPad    = inputSize === 'lg' ? '26px 16px 10px' : '22px 16px 8px';
    const inputId   = rest.id ?? rest.name ?? label.toLowerCase().replace(/\s/g, '-');
    const errorId   = `${inputId}-error`;

    return (
      <div style={{ position: 'relative', paddingTop: 2 }}>
        <label
          htmlFor={inputId}
          style={{
            position:      'absolute',
            left:          16,
            top:           lifted ? 8 : inputSize === 'lg' ? 20 : 17,
            fontFamily:    lifted ? fonts.display : fonts.body,
            fontSize:      lifted ? fontSizes['2xs'] : fontSizes.base,
            fontWeight:    lifted ? fontWeights.bold : fontWeights.normal,
            letterSpacing: lifted ? letterSpacings.widest : '0',
            textTransform: lifted ? 'uppercase' : 'none',
            color:         error
              ? 'rgba(248,113,113,0.8)'
              : focused
              ? colors.classified.DEFAULT
              : lifted
              ? colors.classified.dim
              : colors.text.faint,
            transition:    'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'none',
            zIndex:        1,
          }}
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:        '100%',
            padding:      topPad,
            paddingRight: rightElement ? 48 : 16,
            borderRadius: radii.lg,
            background:   error
              ? 'rgba(248,113,113,0.04)'
              : focused
              ? colors.classified.ghost
              : 'rgba(255,255,255,0.03)',
            border:       `1px solid ${
              error
                ? colors.status.errorBdr
                : focused
                ? 'rgba(201,168,76,0.5)'
                : colors.border.dim
            }`,
            color:        colors.text.primary,
            fontFamily:   fonts.body,
            fontSize:     fontSizes.md,
            outline:      'none',
            boxSizing:    'border-box',
            boxShadow:    focused
              ? `0 0 0 3px ${error ? 'rgba(248,113,113,0.08)' : 'rgba(201,168,76,0.08)'}`
              : 'none',
            transition:   'all 0.2s ease',
            ...style,
          }}
          {...rest}
        />

        {rightElement && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-20%)', zIndex: 2 }}>
            {rightElement}
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              id={errorId}
              role="alert"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                fontFamily: fonts.body,
                fontSize:   fontSizes.xs,
                color:      colors.status.error,
                paddingLeft: 4,
                display:    'flex',
                alignItems: 'center',
                gap:        5,
                overflow:   'hidden',
              }}
            >
              <span aria-hidden>⚠</span> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
