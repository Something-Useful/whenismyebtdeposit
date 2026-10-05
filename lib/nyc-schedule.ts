// New York City EBT pick-up schedule.
//
// NYC does not compute a deposit date from a rule — HRA publishes the actual
// dates as a table (Form EBT-52, "EBT Pick-up Schedule"), 10 toe digits ×
// 6 months, republished every January and July. SNAP is the "A" column of
// each month; the "B" column is the second Cash Assistance issuance.
//
// This module holds the transcribed tables, and falls back to an approximate
// formula for months no ingested edition covers. It is kept JSX-free so
// scripts/verify-nyc.mjs can import and test the real implementation.
//
// ── Why a table and not a formula ───────────────────────────────────
// The obvious rule — "the first 10 days of the month that aren't Sundays or
// holidays" — reproduces all six months of the Jul–Dec 2025 edition exactly
// and then fails on six of six months in Jan–Jun 2025, because HRA drops an
// irregular subset of Saturdays. Which Saturdays get dropped tracks nothing
// we could find: not the weekday the month starts on, not the number of
// holidays in the window, not a minimum-Saturdays or shortest-span rule.
// December 2025 goes further and skips Wednesday 12/10 outright, with no
// weekend or holiday anywhere near it.
//
// So the formula below is a fallback, not a model. Where an edition is
// ingested we use its dates verbatim; where one isn't, callers get
// `published: false` and should hedge the copy accordingly. See #26.

export type NycProvenance = 'primary' | 'secondary';

export interface NycEdition {
  /** Form number and revision exactly as printed on the PDF. */
  form: string;
  /** `primary` = transcribed from the PDF itself. `secondary` = transcribed
   * from someone else's transcription, because the PDF was unreachable. */
  provenance: NycProvenance;
  /** Where this transcription came from, for the next person to re-check. */
  source: string;
  /** `YYYY-MM` → SNAP (A-column) day of month for toe digits 0…9, in order. */
  months: Readonly<Record<string, readonly number[]>>;
}

export const NYC_EDITIONS: readonly NycEdition[] = [
  {
    form: 'EBT-52a Rev. 12/11/2024',
    provenance: 'primary',
    source:
      'https://fns-prod.azureedge.us/sites/default/files/media/file/NYC-Issuance-Schedule.pdf (FNS mirror)',
    months: {
      '2025-01': [2, 3, 4, 6, 7, 8, 9, 10, 13, 14],
      '2025-02': [1, 3, 4, 5, 6, 7, 10, 11, 13, 14],
      '2025-03': [1, 3, 4, 5, 6, 7, 10, 11, 12, 13],
      '2025-04': [1, 2, 3, 4, 7, 8, 9, 10, 11, 14],
      '2025-05': [1, 2, 3, 5, 6, 7, 8, 9, 12, 13],
      '2025-06': [2, 3, 4, 5, 6, 9, 10, 11, 12, 13],
    },
  },
  {
    form: 'EBT-52 Rev. 06/03/2025',
    provenance: 'primary',
    source:
      'https://web.archive.org/web/20251031063801id_/https://otda.ny.gov/workingfamilies/ebt/nyc-issuance-schedule.pdf',
    months: {
      '2025-07': [1, 2, 3, 5, 7, 8, 9, 10, 11, 12],
      '2025-08': [1, 2, 4, 5, 6, 7, 8, 9, 11, 12],
      '2025-09': [2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
      '2025-10': [1, 2, 3, 4, 6, 7, 8, 9, 10, 11],
      '2025-11': [1, 3, 5, 6, 7, 8, 10, 12, 13, 14],
      '2025-12': [1, 2, 3, 4, 5, 6, 8, 9, 11, 12],
    },
  },
  {
    // Read off the PDF itself. Note for whoever refreshes this next:
    // otda.ny.gov sits behind a bot wall that blocks every non-browser fetch
    // (direct, proxied, and archived — the Wayback Machine's 2026-07-09
    // capture is the block page, not the PDF). Open it in a real browser,
    // download it, and transcribe the "A" column of each month.
    form: 'EBT-52 Rev. 06/16/2026',
    provenance: 'primary',
    source: 'https://otda.ny.gov/workingfamilies/ebt/nyc-issuance-schedule.pdf',
    months: {
      '2026-07': [1, 2, 4, 6, 7, 8, 9, 10, 13, 14],
      '2026-08': [1, 3, 4, 5, 6, 7, 10, 11, 12, 13],
      '2026-09': [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
      '2026-10': [1, 2, 3, 5, 6, 7, 8, 9, 10, 13],
      '2026-11': [2, 4, 5, 6, 7, 9, 10, 12, 13, 14],
      '2026-12': [1, 2, 3, 4, 7, 8, 9, 10, 11, 14],
    },
  },
];

const monthKey = (year: number, month0: number) =>
  `${year}-${String(month0 + 1).padStart(2, '0')}`;

const TABLE: ReadonlyMap<string, readonly number[]> = new Map(
  NYC_EDITIONS.flatMap((edition) => Object.entries(edition.months)),
);

/** The last month any ingested edition covers, as `YYYY-MM`. Ops signal:
 * once today passes this, every NYC answer is coming from the fallback. */
export const NYC_TABLE_THROUGH = [...TABLE.keys()].sort().at(-1)!;

// ── Fallback formula ────────────────────────────────────────────────
// Fixed-date holidays HRA skips inside the issuance window. Lincoln's
// Birthday is a New York State holiday, not a federal one; OTDA skipped it
// in the Feb 2025 table. MLK and Presidents' Day (3rd Mondays), Memorial
// Day, Thanksgiving, and Christmas all fall after the 14th.
const NYC_HOLIDAYS_MMDD: ReadonlyArray<readonly [number, number]> = [
  [1, 1], // New Year's Day
  [2, 12], // Lincoln's Birthday
  [6, 19], // Juneteenth
  [7, 4], // Independence Day
  [11, 11], // Veterans Day
];

/**
 * True when `d` is the *observed* date of a fixed-date holiday — Saturday
 * holidays are observed the Friday before, Sunday ones the Monday after.
 * Saturdays are ordinary pickup days in NYC, so the distinction is real:
 * July 4 2026 is a Saturday, and the Jul–Dec 2026 table skips Friday July 3
 * and issues on Saturday July 4.
 */
function isObservedNycHoliday(d: Date): boolean {
  return NYC_HOLIDAYS_MMDD.some(([hm, hd]) => {
    const holiday = new Date(d.getFullYear(), hm - 1, hd);
    const dow = holiday.getDay();
    if (dow === 6) holiday.setDate(hd - 1);
    else if (dow === 0) holiday.setDate(hd + 1);
    return holiday.getMonth() === d.getMonth() && holiday.getDate() === d.getDate();
  });
}

/** True when HRA would not issue on this date: a Sunday or a holiday. */
export function isNycSkipDay(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0) return true; // Sunday
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (isObservedNycHoliday(d)) return true;
  // Labor Day — 1st Monday of September (always days 1-7).
  if (m === 9 && dow === 1 && day <= 7) return true;
  // Columbus Day — 2nd Monday of October (always days 8-14).
  if (m === 10 && dow === 1 && day >= 8 && day <= 14) return true;
  // Election Day — 1st Tuesday after the 1st Monday of November (days 2-8).
  if (m === 11 && dow === 2 && day >= 2 && day <= 8) return true;
  return false;
}

/**
 * Toe digit d → the (d+1)th non-Sunday, non-holiday day of the month: digit
 * 0 gets the earliest date and digits ascend. Right shape, approximate
 * dates — see the note at the top of this file.
 */
export function nycFormulaDay(year: number, month0: number, digit: number): number | null {
  let count = 0;
  for (let day = 1; day <= 28; day++) {
    if (isNycSkipDay(new Date(year, month0, day))) continue;
    count++;
    if (count === digit + 1) return day;
  }
  return null;
}

// ── Lookup ──────────────────────────────────────────────────────────

export interface NycIssuance {
  date: Date;
  /** True when the date came from HRA's published table, false when it was
   * derived from the fallback formula. Callers should hedge the copy on
   * false — the fallback is known to disagree with the real schedule. */
  published: boolean;
}

/** The SNAP issuance date for a toe digit in a specific month. */
export function nycIssuance(year: number, month0: number, digit: number): NycIssuance | null {
  const published = TABLE.get(monthKey(year, month0));
  const day = published ? published[digit] : nycFormulaDay(year, month0, digit);
  if (day == null) return null;
  return { date: new Date(year, month0, day), published: published != null };
}

/**
 * The next `count` issuance dates (today or later), drawn from the published
 * table ONLY — returns null if any of them would have to come from the
 * fallback formula, so callers can simply omit the list rather than show
 * estimates next to real dates.
 */
export function nycNextPublishedDates(
  digit: number,
  today: Date,
  count: number,
): Date[] | null {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const out: Date[] = [];
  let year = today.getFullYear();
  let month0 = today.getMonth();
  while (out.length < count) {
    if (!TABLE.has(monthKey(year, month0))) return null;
    const issuance = nycIssuance(year, month0, digit);
    if (!issuance) return null;
    if (issuance.date >= midnight) out.push(issuance.date);
    month0++;
    if (month0 === 12) {
      month0 = 0;
      year++;
    }
  }
  return out;
}

/** This month's issuance if it hasn't passed, otherwise next month's. */
export function nycNextIssuance(digit: number, today: Date): NycIssuance | null {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonth = nycIssuance(today.getFullYear(), today.getMonth(), digit);
  if (thisMonth && thisMonth.date >= midnight) return thisMonth;
  const nextY = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  return nycIssuance(nextY, (today.getMonth() + 1) % 12, digit);
}
