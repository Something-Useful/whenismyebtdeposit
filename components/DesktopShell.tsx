import type { CSSProperties, ReactNode } from 'react';
import { C, FONT } from '@/lib/tokens';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

// Desktop root: full-width column on cream paper, sans-serif by default.
// No max-width — heroes span the full viewport and inner content centers itself.
export function DesktopShell({ children, style }: Props) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: C.paper,
        fontFamily: FONT,
        color: C.ink,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const DESKTOP_COLUMN = 640;
