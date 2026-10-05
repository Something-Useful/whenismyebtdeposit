'use client';
import { useRef, useState } from 'react';
import { C } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import {
  STATE_DATA,
  SUPPORT_HELP_TITLE,
  supportHelpBody,
  snapDisplayLabel,
} from '@/lib/state-data';
import { nextDateForDay } from '@/lib/format';
import { DayCard, type DayEntry } from './DayCard';
import { Popover, linkifyText } from './Popover';

interface Props {
  stateAbbr: string;
  inputValue: string;
  hasCash: boolean;
  variant?: 'mobile' | 'desktop';
}

/** The deposit-date card on every result screen (mobile, desktop, embed):
 * the dates, the "every month" line, and the "Didn't get your benefits?"
 * link with its popover. */
export function ResultCard({ stateAbbr, inputValue, hasCash, variant = 'mobile' }: Props) {
  const [supportOpen, setSupportOpen] = useState(false);
  const supportRef = useRef<HTMLSpanElement>(null);
  const rule = STATE_RULES[stateAbbr];
  if (!rule) return null;

  const support = STATE_DATA[stateAbbr].contact;
  const result = rule.compute(inputValue, hasCash);
  const { snapDay, cashDay, snapText, cashText } = result;
  const sameDay = hasCash && snapDay != null && cashDay != null && snapDay === cashDay;
  // NYC and MI return absolute dates; everyone else is a fixed day of the month.
  const snapDate = result.snapDate ?? nextDateForDay(snapDay);
  const cashDate = result.cashDate ?? nextDateForDay(cashDay);
  // CA's cashText (a range, no day) and MI's cashDate (no single day) still
  // count as cash info to show.
  const showTwoRows = hasCash && (cashDay != null || cashText || result.cashDate) && !sameDay;

  const entries: DayEntry[] = showTwoRows
    ? [
        { label: result.snapLabel ?? snapDisplayLabel(stateAbbr), date: snapDate, text: snapText },
        { label: rule.cash?.cashLabel ?? 'EBT cash', date: cashDate, text: cashText },
      ]
    : [
        {
          label:
            hasCash && sameDay && rule.cash
              ? (result.combinedLabel ?? rule.cash.combinedLabel)
              : (result.snapLabel ?? snapDisplayLabel(stateAbbr)),
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
    <div style={{ position: 'relative' }}>
      <DayCard
        entries={entries}
        variant={variant}
        subtext={
          everyMonth && (
            <>
              {everyMonth}{' '}
              {support && (
                /* A span, not a button: buttons can't wrap across lines. */
                <span
                  ref={supportRef}
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
      {support && (
        <Popover
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          anchorRef={supportRef}
          title={SUPPORT_HELP_TITLE}
        >
          <p style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>
            {linkifyText(supportHelpBody(stateAbbr))}
          </p>
        </Popover>
      )}
    </div>
  );
}
