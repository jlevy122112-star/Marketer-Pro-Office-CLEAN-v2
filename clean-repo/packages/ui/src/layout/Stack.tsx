// STACK — vertical/horizontal flex layout helper
import { type ReactNode } from 'react';

interface StackProps {
  children:   ReactNode;
  gap?:       number | string;
  direction?: 'row' | 'column';
  align?:     React.CSSProperties['alignItems'];
  justify?:   React.CSSProperties['justifyContent'];
  wrap?:      boolean;
  style?:     React.CSSProperties;
  as?:        keyof JSX.IntrinsicElements;
}

export function Stack({
  children,
  gap       = 12,
  direction = 'column',
  align,
  justify,
  wrap      = false,
  style,
  as:       Tag = 'div',
}: StackProps) {
  return (
    <Tag style={{
      display:        'flex',
      flexDirection:  direction,
      gap,
      alignItems:     align,
      justifyContent: justify,
      flexWrap:       wrap ? 'wrap' : 'nowrap',
      ...style,
    }}>
      {children}
    </Tag>
  );
}
