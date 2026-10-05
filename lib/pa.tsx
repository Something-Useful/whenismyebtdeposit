// Pennsylvania result-page copy. The county data and the business-day
// resolution live in ./pa-rules.ts — kept JSX-free so scripts/verify-pa.mjs
// can import and test the real implementation rather than a mirror of it.

import type { ReactNode } from 'react';
import { type PaCounty, paBusinessDay, ordinal } from './pa-rules';

export * from './pa-rules';

/**
 * Copy for the block under the date. PA's calendar date moves month to month
 * (business-day counting), so this names the rule rather than a fixed day —
 * see #33 on not promising "the same day every month" where it isn't true.
 */
export function paEveryMonthCopy(county: PaCounty, digit: number | null): ReactNode {
  const n = paBusinessDay(county, digit);
  const skipNote = ' (skipping weekends and holidays)';

  // The subtext under the date is just the household's own schedule — how
  // the county assigns it (digit splits, county mechanics) lives in the
  // "How Pennsylvania calculates this" explainer instead.
  const day = county.rule.kind === 'single' ? county.rule.day : n;
  if (day == null) {
    // Digit county without a digit — unreachable from the result screen
    // (validate requires the digit), kept as a safety net.
    return (
      <>
        {county.name} County assigns your business day by the last digit of
        your case number{skipNote}.
      </>
    );
  }
  return (
    <>
      Your SNAP usually loads on the <strong>{ordinal(day)} business day</strong>{' '}
      of the month{skipNote}.
    </>
  );
}
