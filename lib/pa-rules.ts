// Pennsylvania SNAP issuance is county-specific and counted in issuance days
// (business days, excluding weekends and holidays). Where PA DHS's published
// calendar covers the month we use its dates verbatim (PA_ISSUANCE_DAYS
// below); otherwise we count business days via lib/business-days.ts, which
// uses the Commonwealth's own holiday calendar (Administrative Circular 25-13).
//
// Three rule shapes (sourced from the USDA all-states schedule PDF):
//
//   'single'    — every case lands on the Nth business day.       (36 counties)
//   'twoBucket' — case # last digit 1-5 → Nth BD, 6-9 or 0 → Mth BD. (15)
//   'tenDigit'  — digit 1 → 1st BD, …, digit 9 → 9th BD, digit 0 → 10th BD. (16)
//
// The two digit-dependent shapes cover 31 of the 67 counties, which is why
// the PA field asks for the last digit of the case record number once the
// user picks one of them.
//
// The `lookup`-style names are kept stable so the URL fragment after
// `/pa#?county=adams` (if we ever add deep links) stays predictable.

import { nthBusinessDay } from './business-days.ts';

export type PaRule =
  | { kind: 'single'; day: number }
  | { kind: 'twoBucket'; lowDay: number; highDay: number }
  | { kind: 'tenDigit' };

export interface PaCounty {
  name: string;
  rule: PaRule;
}

export const PA_COUNTIES: ReadonlyArray<PaCounty> = [
  { name: 'Adams', rule: { kind: 'single', day: 5 } },
  { name: 'Allegheny', rule: { kind: 'tenDigit' } },
  { name: 'Armstrong', rule: { kind: 'single', day: 4 } },
  { name: 'Beaver', rule: { kind: 'single', day: 3 } },
  { name: 'Bedford', rule: { kind: 'single', day: 2 } },
  { name: 'Berks', rule: { kind: 'twoBucket', lowDay: 4, highDay: 9 } },
  { name: 'Blair', rule: { kind: 'tenDigit' } },
  { name: 'Bradford', rule: { kind: 'single', day: 8 } },
  { name: 'Bucks', rule: { kind: 'tenDigit' } },
  { name: 'Butler', rule: { kind: 'single', day: 2 } },
  { name: 'Cambria', rule: { kind: 'tenDigit' } },
  { name: 'Cameron', rule: { kind: 'single', day: 7 } },
  { name: 'Carbon', rule: { kind: 'single', day: 3 } },
  { name: 'Centre', rule: { kind: 'twoBucket', lowDay: 5, highDay: 7 } },
  { name: 'Chester', rule: { kind: 'tenDigit' } },
  { name: 'Clarion', rule: { kind: 'single', day: 5 } },
  { name: 'Clearfield', rule: { kind: 'twoBucket', lowDay: 6, highDay: 10 } },
  { name: 'Clinton', rule: { kind: 'twoBucket', lowDay: 4, highDay: 9 } },
  { name: 'Columbia', rule: { kind: 'single', day: 3 } },
  { name: 'Crawford', rule: { kind: 'single', day: 8 } },
  { name: 'Cumberland', rule: { kind: 'twoBucket', lowDay: 1, highDay: 7 } },
  { name: 'Dauphin', rule: { kind: 'tenDigit' } },
  { name: 'Delaware', rule: { kind: 'tenDigit' } },
  { name: 'Elk', rule: { kind: 'single', day: 4 } },
  { name: 'Erie', rule: { kind: 'tenDigit' } },
  { name: 'Fayette', rule: { kind: 'tenDigit' } },
  { name: 'Forest', rule: { kind: 'single', day: 8 } },
  { name: 'Franklin', rule: { kind: 'twoBucket', lowDay: 1, highDay: 7 } },
  { name: 'Fulton', rule: { kind: 'single', day: 4 } },
  { name: 'Greene', rule: { kind: 'single', day: 2 } },
  { name: 'Huntingdon', rule: { kind: 'single', day: 6 } },
  { name: 'Indiana', rule: { kind: 'single', day: 10 } },
  { name: 'Jefferson', rule: { kind: 'twoBucket', lowDay: 6, highDay: 10 } },
  { name: 'Juniata', rule: { kind: 'single', day: 4 } },
  { name: 'Lackawanna', rule: { kind: 'twoBucket', lowDay: 1, highDay: 7 } },
  { name: 'Lancaster', rule: { kind: 'tenDigit' } },
  { name: 'Lawrence', rule: { kind: 'twoBucket', lowDay: 4, highDay: 9 } },
  { name: 'Lebanon', rule: { kind: 'single', day: 6 } },
  { name: 'Lehigh', rule: { kind: 'tenDigit' } },
  { name: 'Luzerne', rule: { kind: 'twoBucket', lowDay: 6, highDay: 10 } },
  { name: 'Lycoming', rule: { kind: 'twoBucket', lowDay: 4, highDay: 9 } },
  { name: 'McKean', rule: { kind: 'single', day: 6 } },
  { name: 'Mercer', rule: { kind: 'twoBucket', lowDay: 1, highDay: 7 } },
  { name: 'Mifflin', rule: { kind: 'single', day: 5 } },
  { name: 'Monroe', rule: { kind: 'twoBucket', lowDay: 4, highDay: 9 } },
  { name: 'Montgomery', rule: { kind: 'tenDigit' } },
  { name: 'Montour', rule: { kind: 'single', day: 7 } },
  { name: 'Northampton', rule: { kind: 'tenDigit' } },
  { name: 'Northumberland', rule: { kind: 'single', day: 9 } },
  { name: 'Perry', rule: { kind: 'single', day: 4 } },
  { name: 'Philadelphia', rule: { kind: 'tenDigit' } },
  { name: 'Pike', rule: { kind: 'single', day: 6 } },
  { name: 'Potter', rule: { kind: 'single', day: 3 } },
  { name: 'Schuylkill', rule: { kind: 'tenDigit' } },
  { name: 'Snyder', rule: { kind: 'single', day: 3 } },
  { name: 'Somerset', rule: { kind: 'single', day: 9 } },
  { name: 'Sullivan', rule: { kind: 'single', day: 7 } },
  { name: 'Susquehanna', rule: { kind: 'single', day: 9 } },
  { name: 'Tioga', rule: { kind: 'single', day: 2 } },
  { name: 'Union', rule: { kind: 'single', day: 8 } },
  { name: 'Venango', rule: { kind: 'single', day: 4 } },
  { name: 'Warren', rule: { kind: 'single', day: 2 } },
  { name: 'Washington', rule: { kind: 'twoBucket', lowDay: 5, highDay: 7 } },
  { name: 'Wayne', rule: { kind: 'single', day: 9 } },
  { name: 'Westmoreland', rule: { kind: 'twoBucket', lowDay: 6, highDay: 8 } },
  { name: 'Wyoming', rule: { kind: 'single', day: 8 } },
  { name: 'York', rule: { kind: 'tenDigit' } },
];

export function findPaCounty(name: string): PaCounty | null {
  const n = name.trim().toLowerCase();
  return PA_COUNTIES.find((c) => c.name.toLowerCase() === n) ?? null;
}

/** True when the county's rule can't be resolved without the case digit. */
export function paNeedsDigit(county: PaCounty): boolean {
  return county.rule.kind !== 'single';
}

/**
 * Which business day (1-10) this household lands on, or null when the county
 * needs a digit we don't have yet.
 *
 * `digit` is the last digit of the 7-digit case record number.
 */
export function paBusinessDay(county: PaCounty, digit: number | null): number | null {
  switch (county.rule.kind) {
    case 'single':
      return county.rule.day;
    case 'twoBucket':
      if (digit == null) return null;
      // Digits 1-5 take the earlier day; 6-9 and 0 take the later one.
      return digit >= 1 && digit <= 5 ? county.rule.lowDay : county.rule.highDay;
    case 'tenDigit':
      if (digit == null) return null;
      // Digit 1 → 1st business day … digit 9 → 9th, digit 0 → 10th.
      return digit === 0 ? 10 : digit;
  }
}

// Calendar dates of issuance days 1-10 (the SNAP days), from PA DHS's
// "Cash and SNAP Payment Issuance Schedule" (PA FS 855, rev. 11/25):
// http://services.dpw.state.pa.us/oimpolicymanuals/snap/assets/docs/PA%20FS%200855.pdf
// It matches business-day counting except in months too short for 20
// issuance days, and PA doesn't compress those consistently: November 2026
// puts days 1-3 all on Nov 2, while February 2026 doubles up its last day.
export const PA_ISSUANCE_DAYS: Record<string, readonly number[]> = {
  '2026-01': [2, 5, 6, 7, 8, 9, 12, 13, 14, 15],
  '2026-02': [2, 3, 4, 5, 6, 9, 10, 11, 12, 13],
  '2026-03': [2, 3, 4, 5, 6, 9, 10, 11, 12, 13],
  '2026-04': [1, 2, 3, 6, 7, 8, 9, 10, 13, 14],
  '2026-05': [1, 4, 5, 6, 7, 8, 11, 12, 13, 14],
  '2026-06': [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
  '2026-07': [1, 2, 6, 7, 8, 9, 10, 13, 14, 15],
  '2026-08': [3, 4, 5, 6, 7, 10, 11, 12, 13, 14],
  '2026-09': [1, 2, 3, 4, 8, 9, 10, 11, 14, 15],
  '2026-10': [1, 2, 5, 6, 7, 8, 9, 13, 14, 15],
  '2026-11': [2, 2, 2, 3, 4, 5, 6, 9, 10, 12],
  '2026-12': [1, 2, 3, 4, 7, 8, 9, 10, 11, 14],
};

/** Calendar date of issuance day N (1-10) in a month: the published
 * calendar when we have it, otherwise the Nth business day. */
export function paIssuanceDate(year: number, month0: number, n: number): Date | null {
  const published = PA_ISSUANCE_DAYS[`${year}-${String(month0 + 1).padStart(2, '0')}`];
  if (published) return n >= 1 && n <= published.length ? new Date(year, month0, published[n - 1]) : null;
  return nthBusinessDay(year, month0, n);
}

/** The next actual deposit date, or null when we can't resolve the rule. */
export function paDepositDate(
  county: PaCounty,
  digit: number | null,
  today: Date,
): Date | null {
  const n = paBusinessDay(county, digit);
  if (n == null) return null;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonth = paIssuanceDate(today.getFullYear(), today.getMonth(), n);
  if (thisMonth && thisMonth >= todayMidnight) return thisMonth;
  const nextY = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  return paIssuanceDate(nextY, (today.getMonth() + 1) % 12, n);
}

export function ordinal(n: number): string {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
