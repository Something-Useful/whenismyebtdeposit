'use client';
import { OPERATOR } from '@/lib/operator';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { STATE_DATA, snapDisplayLabel } from '@/lib/state-data';
import { STATE_RULES } from '@/lib/state-rules';
import { nextDateForDay } from '@/lib/format';
import { EmbedShell } from './EmbedShell';
import { DayCard, type DayEntry } from './DayCard';
import { linkifyText } from './Popover';

interface Props {
  stateAbbr: string;
  inputValue: string;
  hasCash: boolean;
  onBack: () => void;
}

const EYEBROW_STYLE = {
  fontSize: 13,
  fontWeight: 700 as const,
  letterSpacing: TRACK_EYEBROW,
  color: C.inkSoft,
  textTransform: 'uppercase' as const,
  marginBottom: 14,
};

/**
 * Result screen for the embed. Same calculation as ScreenResult but:
 *   - no app logo / no big saffron hero
 *   - no "Report outdated information" / "Didn't get your benefits?" links
 *     (those make sense on the canonical site, not when nested inside a
 *     partner's page)
 *   - no Privacy/Terms/Contact footer
 *   - "Start over" instead of "Back" (no parent screen to go back to)
 *   - tiny USDA source line at the bottom for credibility
 */
function explainerFor(abbr: string, hasCash: boolean): string {
  const e = STATE_DATA[abbr].explainer;
  return typeof e === 'string' ? e : hasCash ? e.yes : e.no;
}

export function ScreenResultEmbed({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  const rule = STATE_RULES[stateAbbr];
  if (!rule) return null;

  const result = rule.compute(inputValue, hasCash);
  const { snapDay, cashDay, snapText, cashText } = result;
  const sameDay = hasCash && snapDay != null && cashDay != null && snapDay === cashDay;
  const snapDate = result.snapDate ?? nextDateForDay(snapDay);
  const cashDate = result.cashDate ?? nextDateForDay(cashDay);

  // `cashText` (CA CalWORKs) counts as "cash info to show" even without a day.
  // `cashDate` alone (MI: two cash days a month, next one precomputed)
  // also counts as having cash info to show.
  const showTwoRows = hasCash && (cashDay != null || cashText || result.cashDate) && !sameDay;

  // SNAP and cash always share one card, split by a hairline when they land
  // on different days.
  const entries: DayEntry[] = showTwoRows
    ? [
        { label: snapDisplayLabel(stateAbbr), date: snapDate, text: snapText },
        {
          label: rule.cash?.cashLabel ?? 'EBT cash',
          date: cashDate,
          text: cashText,
        },
      ]
    : [
        {
          label:
            hasCash && sameDay && rule.cash ? rule.cash.combinedLabel : snapDisplayLabel(stateAbbr),
          date: snapDate,
          text: snapText,
        },
      ];

  const everyMonthNode =
    snapDay != null || snapText
      ? (result.everyMonthOverride ??
          rule.everyMonth({ snapDay: snapDay ?? 0, cashDay, sameDay, hasCash }))
      : null;

  return (
    <EmbedShell tint={C.sage}>
      <div style={EYEBROW_STYLE}>Your next EBT deposit is</div>

      <DayCard variant="mobile" entries={entries} subtext={everyMonthNode ?? undefined} />

      {/* "How {state} calculates this" — collapsible (saves vertical space in
          the embed, which is height-constrained inside a partner iframe). */}
      <details
        style={{
          marginTop: 12,
          background: 'rgba(255,255,255,0.55)',
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: '14px 16px',
        }}
      >
        <summary
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: TRACK_EYEBROW,
            color: C.inkMute,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            listStyle: 'none',
            userSelect: 'none',
          }}
        >
          <span>How {rule.name} calculates this</span>
          <svg
            className="caret"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transition: 'transform 0.18s ease' }}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke={C.inkMute}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5, margin: '10px 0 0' }}>
          {linkifyText(explainerFor(stateAbbr, hasCash))}{' '}
          <a
            href={`mailto:${OPERATOR.contactEmail}?subject=${encodeURIComponent(
              `Report inaccurate info — ${rule.name}`,
            )}`}
            style={{ color: C.inkSoft, textDecoration: 'underline' }}
          >
            Report inaccurate info
          </a>
          .
        </p>
      </details>

      <button
        type="button"
        onClick={onBack}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'block',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          marginTop: 16,
          padding: '12px 22px',
          borderRadius: 999,
          border: `1.5px solid ${C.line}`,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: FONT,
          color: C.ink,
          background: '#fff',
        }}
      >
        ← Start over
      </button>

      <a
        href={`/${stateAbbr.toLowerCase()}`}
        target="_blank"
        rel="noopener"
        style={{
          display: 'block',
          textAlign: 'right',
          marginTop: 14,
          fontSize: 11.5,
          color: C.inkMute,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(21,20,15,0.25)',
          textUnderlineOffset: 2,
        }}
      >
        When is my EBT deposit?
      </a>
    </EmbedShell>
  );
}
