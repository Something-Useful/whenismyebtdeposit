import type { CSSProperties, ReactNode } from 'react';
import { C, TRACK_EYEBROW } from '@/lib/tokens';
import { EmbedApp } from './EmbedApp';

// "How it works" for /partners, from design option 2c (Annotated): a
// before/after inside one dashed frame. The before is Florida's official
// schedule rewritten as prose with the pain points highlighted inline
// (saffron marks on "read backwards" / "dropping the 10th digit") above a
// truncated lookup table; the after is the calculator rendered live —
// directly, not via the iframe embed (this is our own site; the iframe
// machinery is for partner pages) — pre-filled so the pulsing CTA is one
// tap away.

// Column header in the app's kicker idiom (uppercase, letterspaced, muted)
// with the check-circle iconography the app already uses for freshness rows
// — an ✕ for the old way, the green ✓ for the calculator.
function ColumnHeader({
  tone,
  label,
  detail,
}: {
  tone: 'before' | 'after';
  label: string;
  detail: string;
}) {
  const before = tone === 'before';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 12,
      }}
    >
      {before ? (
        // Chunky gray ✕
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path
            d="M6.5 6.5l11 11M17.5 6.5l-11 11"
            stroke={C.inkMute}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Big satisfying green ✓
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path
            d="M4.5 13l5 5.5L19.5 6"
            stroke="#3a7d3a"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: TRACK_EYEBROW,
          textTransform: 'uppercase',
          color: before ? C.inkMute : C.ink,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12.5, color: C.inkMute }}>{detail}</span>
    </div>
  );
}

// Inline pain-point highlight, per the design's annotated phrases.
function Mark({ children }: { children: ReactNode }) {
  return (
    <strong style={{ background: C.saffronTint, padding: '1px 5px', borderRadius: 5 }}>
      {children}
    </strong>
  );
}

const BEFORE_ROWS: Array<[string, string]> = [
  ['00–03', '1st of the month'],
  ['04–06', '2nd of the month'],
  ['07–10', '3rd of the month'],
  ['11–13', '4th of the month'],
  ['14–17', '5th of the month'],
];

function BeforeCard() {
  const row: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: 12,
  };
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: '20px 22px',
      }}
    >
      <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: 0 }}>
        In Florida, benefits are sent out from the 1st to the 28th of every
        month, based on the 9th and 8th digits of your Florida case number
        &mdash; <Mark>read backwards</Mark>, <Mark>dropping the 10th digit</Mark>.
      </p>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '12px 0 12px' }}>If your:</p>
      <div
        style={{
          ...row,
          paddingBottom: 8,
          fontSize: 11.5,
          fontWeight: 600,
          color: C.inkSoft,
        }}
      >
        <span>Case number&rsquo;s 9th and 8th digits are</span>
        <span>Benefits available</span>
      </div>
      {BEFORE_ROWS.map(([d, b]) => (
        <div
          key={d}
          style={{
            ...row,
            padding: '9px 0',
            borderTop: `1px solid ${C.line}`,
            fontSize: 12,
            color: C.ink,
          }}
        >
          <span>{d}</span>
          <span>{b}</span>
        </div>
      ))}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: '9px 0 2px',
          fontSize: 12,
          color: C.inkMute,
        }}
      >
        &hellip; 23 more rows
      </div>
    </div>
  );
}

export function PartnersHowItWorks() {
  // Max 440 to match the embed card's own width cap, so the headers align
  // with their cards at every breakpoint.
  const col: CSSProperties = { maxWidth: 440 };
  return (
    <div>
      <p style={{ margin: '0 0 16px' }}>Here&rsquo;s a real example for Florida.</p>
      <div
        style={{
          border: '1px dashed rgba(21,20,15,0.18)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '28px 28px',
            alignItems: 'start',
          }}
        >
          <div style={col}>
            <ColumnHeader tone="before" label="Before" detail="the official schedule" />
            <BeforeCard />
          </div>
          <div style={col}>
            <ColumnHeader tone="after" label="After" detail="the calculator" />
            <EmbedApp initialAbbr="FL" demoPrefill="12312312312" />
          </div>
        </div>
      </div>
    </div>
  );
}
