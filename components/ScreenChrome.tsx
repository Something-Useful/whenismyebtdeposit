import type { ReactNode } from 'react';
import { C, FONT } from '@/lib/tokens';

export function ScreenChrome({ children }: { children: ReactNode }) {
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
        position: 'relative',
        // HeaderArea pulls itself out to 100vw for the full-bleed tint;
        // clip the scrollbar-width overshoot so no horizontal scroll.
        overflowX: 'clip',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          marginInline: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '100dvh',
        }}
      >
        {children}
      </div>
    </div>
  );
}
