// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER
// Horizontal rule with optional centered label. Used in auth flows.
// ─────────────────────────────────────────────────────────────────────────────

import { colors, fonts, fontSizes, letterSpacings } from './tokens';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: colors.border.subtle }} />
      {label && (
        <span style={{
          fontFamily:    fonts.display,
          fontSize:      fontSizes['2xs'],
          letterSpacing: letterSpacings.wider,
          textTransform: 'uppercase',
          color:         colors.text.faint,
          whiteSpace:    'nowrap',
        }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: colors.border.subtle }} />
    </div>
  );
}
