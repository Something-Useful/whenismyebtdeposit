'use client';
import { OPERATOR } from '@/lib/operator';
import { ScheduleVerifiedRow } from './UpdatedPill';
import { useRef, useState } from 'react';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import {
  STATE_DATA,
  scheduleSourceFor,
  SUPPORT_HELP_TITLE,
  supportHelpBody,
  snapDisplayLabel,
} from '@/lib/state-data';
import { nextDateForDay } from '@/lib/format';
import { ScreenChrome } from './ScreenChrome';
import { HeaderArea } from './HeaderArea';
import { AppLogo } from './AppLogo';
import { DayCard, type DayEntry } from './DayCard';
import { AppFooter } from './AppFooter';
import { Popover, linkifyText } from './Popover';

interface Props {
  stateAbbr: string;
  inputValue: string;
  hasCash: boolean;
  onBack: () => void;
}

function explainerFor(abbr: string, hasCash: boolean): string {
  const e = STATE_DATA[abbr].explainer;
  return typeof e === 'string' ? e : hasCash ? e.yes : e.no;
}

export function ScreenResult({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  const rule = STATE_RULES[stateAbbr];
  const support = STATE_DATA[stateAbbr].contact;
  const [supportOpen, setSupportOpen] = useState(false);
  const supportBtnRef = useRef<HTMLSpanElement>(null);
  if (!rule) return null;

  const result = rule.compute(inputValue, hasCash);
  const { snapDay, cashDay, snapText, cashText } = result;
  const sameDay = hasCash && snapDay != null && cashDay != null && snapDay === cashDay;
  // Some states (NYC) return an absolute Date because the day-of-month shifts
  // by month. Honor those overrides instead of falling back to nextDateForDay.
  const snapDate = result.snapDate ?? nextDateForDay(snapDay);
  const cashDate = result.cashDate ?? nextDateForDay(cashDay);

  // `cashText` (CA CalWORKs) is treated as "we have cash info to show"
  // even though there's no specific day.
  // `cashDate` alone (MI: two cash days a month, next one precomputed)
  // also counts as having cash info to show.
  const showTwoRows = hasCash && (cashDay != null || cashText || result.cashDate) && !sameDay;

  // SNAP and cash always share one card. States that load them on different
  // days get two rows split by a hairline; everyone else gets one.
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

  const everyMonth =
    snapDay != null || snapText
      ? (result.everyMonthOverride ??
          rule.everyMonth({ snapDay: snapDay ?? 0, cashDay, sameDay, hasCash }))
      : undefined;

  return (
    <ScreenChrome>
      <HeaderArea tint={C.sage}>
        <AppLogo />
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: TRACK_EYEBROW,
            color: C.inkSoft,
            marginBottom: 14,
          }}
        >
          YOUR NEXT EBT DEPOSIT IS
        </div>

        <DayCard
          entries={entries}
          subtext={
            everyMonth && (
              <>
                {everyMonth}{' '}
                {support && (
                  /* A span, not a button: buttons can't break across lines, so the
                      whole label would jump to its own row instead of wrapping. */
                  <span
                    ref={supportBtnRef}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSupportOpen((o) => !o)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSupportOpen((o) => !o);
                      }
                    }}
                    aria-expanded={supportOpen}
                    style={{ cursor: 'pointer', color: C.inkSoft, textDecoration: 'underline' }}
                  >
                    {SUPPORT_HELP_TITLE}
                  </span>
                )}
              </>
            )
          }
        />
      </HeaderArea>

      <div
        style={{
          padding: '20px 24px 0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      {/* Inner wrapper: position:relative WITHOUT horizontal padding so the
          support Popover (left:0/right:0 spans the padding box) ends up the
          same width as the (i) popover in StateFields. */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* "Every month" is now shown inside the DayCard above */}

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: TRACK_EYEBROW,
              color: C.inkMute,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            How {rule.name} calculates this
          </div>
          <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
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
          <ScheduleVerifiedRow
            iso={STATE_DATA[stateAbbr].verified.date}
            source={scheduleSourceFor(stateAbbr)}
          />
        </div>


        {support && (
          <Popover
            open={supportOpen}
            onClose={() => setSupportOpen(false)}
            anchorRef={supportBtnRef}
            title={SUPPORT_HELP_TITLE}
          >
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>
              {linkifyText(supportHelpBody(stateAbbr))}
            </p>
          </Popover>
        )}

        <div style={{ height: 28 }} />

        {/* Same compact, left-aligned button as the desktop result screen. */}
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: '12px 22px',
              borderRadius: 999,
              border: `1.5px solid ${C.line}`,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: FONT,
              color: C.ink,
              background: C.card,
            }}
          >
            ← Back
          </button>
        </div>
        </div>
      </div>

      <AppFooter />
    </ScreenChrome>
  );
}
