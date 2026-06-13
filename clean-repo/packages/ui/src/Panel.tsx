// ─────────────────────────────────────────────────────────────────────────────
// PANEL
// Section container with optional header, label, and action button.
// Used throughout the Desk, Settings, Analytics screens.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { colors, fonts, fontSizes, fontWeights, letterSpacings, radii, space, gradients } from './tokens';

interface PanelProps {
  children:    ReactNode;
  label?:      string;       // Small uppercase label above panel
  title?:      string;
  action?:     ReactNode;    // Button or link in top-right
  padding?:    string;
  gap?:        number | string;
  style?:      React.CSSProperties;
  noBorder?:   boolean;
}

export function Panel({
  children,
  label,
  title,
  action,
  padding  = space[4],
  gap      = 12,
  style,
  noBorder = false,
}: PanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {/* Section label */}
      {label && (
        <p style={{
          fontFamily:    fonts.display,
          fontSize:      fontSizes['2xs'],
          fontWeight:    fontWeights.bold,
          letterSpacing: letterSpacings.widest,
          textTransform: 'uppercase',
          color:         colors.classified.dim,
        }}>
          {label}
        </p>
      )}

      {/* Header */}
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title && (
            <p style={{
              fontFamily:    fonts.display,
              fontWeight:    fontWeights.extrabold,
              fontSize:      fontSizes['2xl'],
              letterSpacing: letterSpacings.tighter,
              background:    gradients.goldText,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip: 'text',
            }}>
              {title}
            </p>
          )}
          {action}
        </div>
      )}

      {/* Content */}
      <div style={{
        borderRadius:  radii.xl,
        background:    noBorder ? 'transparent' : colors.void[800],
        border:        noBorder ? 'none' : `1px solid ${colors.border.subtle}`,
        padding,
        display:       'flex',
        flexDirection: 'column',
        gap,
      }}>
        {children}
      </div>
    </div>
  );
}
