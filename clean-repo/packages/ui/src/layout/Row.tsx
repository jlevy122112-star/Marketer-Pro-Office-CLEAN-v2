// ROW — horizontal flex layout helper
import { type ReactNode } from 'react';

interface RowProps {
  children:   ReactNode;
  gap?:       number | string;
  align?:     React.CSSProperties['alignItems'];
  justify?:   React.CSSProperties['justifyContent'];
  wrap?:      boolean;
  style?:     React.CSSProperties;
}

export function Row({
  children,
  gap     = 12,
  align   = 'center',
  justify,
  wrap    = false,
  style,
}: RowProps) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'row',
      gap,
      alignItems:     align,
      justifyContent: justify,
      flexWrap:       wrap ? 'wrap' : 'nowrap',
      ...style,
    }}>
      {children}
    </div>
  );
}
