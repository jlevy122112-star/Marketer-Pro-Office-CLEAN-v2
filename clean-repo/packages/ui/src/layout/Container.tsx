// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER
// Full-height scrollable page container.
// Handles safe-area insets, tab bar offset, and pull-to-refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';

interface ContainerProps {
  children:      ReactNode;
  tabBarOffset?: boolean;  // true on all tab pages — adds bottom padding
  style?:        React.CSSProperties;
}

export function Container({ children, tabBarOffset = true, style }: ContainerProps) {
  return (
    <div style={{
      position:            'fixed',
      inset:               0,
      background:          '#060912',
      display:             'flex',
      flexDirection:       'column',
      paddingTop:          'var(--sat, 0px)',
      overflow:            'hidden',
      ...style,
    }}>
      <div style={{
        flex:                1,
        overflowY:           'auto',
        overflowX:           'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom:       tabBarOffset ? 'calc(env(safe-area-inset-bottom, 0px) + 80px)' : 'env(safe-area-inset-bottom, 16px)',
      }}>
        {children}
      </div>
    </div>
  );
}
