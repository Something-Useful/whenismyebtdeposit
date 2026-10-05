import type { ReactNode } from 'react';
import { C, FONT } from '@/lib/tokens';

interface Props {
  /** Background tint of the card. Sage for welcome, saffron for result. */
  tint: string;
  children: ReactNode;
}

/**
 * The bordered max-width-440 card that wraps every embed screen. Renders
 * with a transparent outer surface so partners can drop the embed iframe
 * onto any background and have it match — the tint shows only inside the
 * widget's rounded card.
 *
 * Same single layout on desktop and mobile (per partner request — embeds
 * live in a constrained iframe, not a full responsive viewport).
 */
export function EmbedShell({ tint, children }: Props) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 440,
        margin: '0 auto',
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      <div
        style={{
          background: tint,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          padding: 24,
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
