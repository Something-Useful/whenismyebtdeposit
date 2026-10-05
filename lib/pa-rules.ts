// Pennsylvania SNAP issuance is county-specific and counted in business days
// (excluding weekends and holidays). We resolve that to an actual calendar
// date via lib/business-days.ts, which uses the Commonwealth's own holiday
// calendar (Administrative Circular 25-13).
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

import { nextNthBusinessDay } from './business-days.ts';

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

/** The next actual deposit date, or null when we can't resolve the rule. */
export function paDepositDate(
  county: PaCounty,
  digit: number | null,
  today: Date,
): Date | null {
  const n = paBusinessDay(county, digit);
  return n == null ? null : nextNthBusinessDay(n, today);
}

export function ordinal(n: number): string {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
