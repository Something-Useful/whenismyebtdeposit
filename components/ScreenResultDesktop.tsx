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
import { DesktopShell, DESKTOP_COLUMN } from './DesktopShell';
import { DesktopNav } from './DesktopNav';
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

export function ScreenResultDesktop({ stateAbbr, inputValue, hasCash, onBack }: Props) {
  const rule = STATE_RULES[stateAbbr];
  const support = STATE_DATA[stateAbbr].contact;
  const [supportOpen, setSupportOpen] = useState(false);
  const supportBtnRef = useRef<HTMLSpanElement>(null);
  if (!rule) return null;

  const result = rule.compute(inputValue, hasCash);
  const { snapDay, cashDay, snapText, cashText } = result;
  const sameDay = hasCash && snapDay != null && cashDay != null && snapDay === cashDay;
  // Honor any absolute-date overrides from the state's compute (NYC).
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

  const everyMonth =
    snapDay != null || snapText
      ? (result.everyMonthOverride ??
          rule.everyMonth({ snapDay: snapDay ?? 0, cashDay, sameDay, hasCash }))
      : undefined;

  return (
    <DesktopShell>
      {/* Saffron hero — full width, DayCards live here */}
      <div style={{ background: C.sage, padding: '40px 32px 48px' }}>
        <div style={{ maxWidth: DESKTOP_COLUMN, margin: '0 auto' }}>
          <DesktopNav />
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: TRACK_EYEBROW,
              color: C.inkSoft,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Your next EBT deposit is
          </div>

          <DayCard
            entries={entries}
            variant="desktop"
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
        </div>
      </div>

      {/* Body — cards stacked in centered column */}
      <div style={{ flex: 1, padding: '32px 32px 56px' }}>
        <div
          style={{
            maxWidth: DESKTOP_COLUMN,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            // Containing block for the support Popover (the outer div has
            // padding; this inner div has none, so the popover doesn't
            // overlap the padding zone).
            position: 'relative',
          }}
        >
          {/* "Every month" is now shown inside the DayCard in the hero above */}

          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              border: `1px solid ${C.line}`,
              padding: '22px 26px',
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
            <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
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
              fontSize={14}
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

          <div style={{ marginTop: 12 }}>
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
                background: '#fff',
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <AppFooter variant="desktop" />
    </DesktopShell>
  );
}
