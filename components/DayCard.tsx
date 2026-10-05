import type { ReactNode } from 'react';
import { C, SERIF, TRACK_EYEBROW } from '@/lib/tokens';
import { ordinalSuffix } from '@/lib/format';

export interface DayEntry {
  label: string;
  date: Date | null;
  /** Text to render in place of the computed date, for states (WA) whose
   * exact day isn't a public formula. When set, ignores `date`. */
  text?: string;
}

interface Props {
  /** One row per deposit. States that load SNAP and cash on different days
   * pass two — the rows share a single card, split by a hairline, rather
   * than sitting in separate cards. */
  entries: DayEntry[];
  variant?: 'mobile' | 'desktop';
  /** "Every month" copy, rendered at the bottom of the card below a hairline. */
  subtext?: ReactNode;
}

export function DayCard({ entries, variant = 'mobile', subtext }: Props) {
  const isDesktop = variant === 'desktop';
  // Text mode uses a slightly smaller font so longer copy ("Between the 1st
  // and 20th") fits without wrapping awkwardly.
  const baseSize = isDesktop ? 52 : 40;
  const textModeSize = isDesktop ? 36 : 30;

  const eyebrowStyle = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: TRACK_EYEBROW,
    color: C.inkMute,
    textTransform: 'uppercase' as const,
  };

  // Everything inside the card is separated by whitespace only — no rules.
  // The labels already read as separate rows, and the "every month" copy
  // reads as a footnote to the dates above it without one.
  const blockSpacing = { marginTop: isDesktop ? 34 : 26 };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 22,
        padding: isDesktop ? '24px 28px 26px' : '20px 24px 22px',
        border: `1px solid ${C.line}`,
        boxShadow: isDesktop ? '0 1px 2px rgba(21,20,15,0.04)' : undefined,
      }}
    >
      {entries.map((entry, i) => {
        const month = entry.date
          ? entry.date.toLocaleDateString('en-US', { month: 'long' })
          : null;
        const day = entry.date ? entry.date.getDate() : null;

        return (
          <div
            key={entry.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isDesktop ? 10 : 6,
              ...(i > 0 ? blockSpacing : null),
            }}
          >
            <div style={eyebrowStyle}>{entry.label}</div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: entry.text ? textModeSize : baseSize,
                lineHeight: entry.text ? 1.1 : isDesktop ? 1.02 : 1.05,
                letterSpacing: '-0.025em',
                color: C.ink,
              }}
            >
              {entry.text ? (
                entry.text
              ) : entry.date && day != null ? (
                <>
                  {month}{' '}
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{day}</span>
                  <span
                    style={{ fontSize: isDesktop ? 26 : 22, marginLeft: isDesktop ? 3 : 2 }}
                  >
                    {ordinalSuffix(day)}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        );
      })}

      {subtext && (
        <div style={{ marginTop: isDesktop ? 14 : 12 }}>
          <p
            style={{
              fontSize: isDesktop ? 14 : 13,
              color: C.inkSoft,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {subtext}
          </p>
        </div>
      )}
    </div>
  );
}
