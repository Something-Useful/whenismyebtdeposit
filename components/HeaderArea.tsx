import type { ReactNode } from 'react';
import { C } from '@/lib/tokens';

export function HeaderArea({
  children,
  tint = C.sage,
}: {
  children: ReactNode;
  tint?: string;
}) {
  return (
    // Full-bleed: the tint spans the whole viewport even when rendered
    // inside ScreenChrome's centered 480px column (mid-size screens showed
    // paper gutters otherwise). The classic 100vw pull-out; content stays
    // aligned to the column via the inner max-width box.
    <div
      style={{
        background: tint,
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          marginInline: 'auto',
          boxSizing: 'border-box',
          padding: '40px 24px 28px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
