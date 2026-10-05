// Business-day counting for Pennsylvania's county SNAP schedule.
//
// PA issues SNAP on the Nth *business day* of the month, where USDA's
// phrasing is "excludes weekends and holidays" without naming a calendar.
// The calendar used here is the Commonwealth's own: Administrative Circular
// 25-13 (Governor's Office, dated 2025-08-19) lists the days "the
// administrative offices of State Government shall be closed ... for the
// purpose of transacting public business".
//
// That list is the 11 federal holidays plus Day After Thanksgiving. The one
// PA-only addition (Day After Thanksgiving, late November) can never land
// inside the first 10 business days of a month, so within the window that
// matters this calendar and the federal/Federal-Reserve calendar agree —
// which means the "which holiday list?" question doesn't change any result
// we compute. See lib/pa.tsx for the county rules that consume this.
//
// Fixed-date holidays observe the standard shift: Saturday → the Friday
// before, Sunday → the Monday after. AC 25-13 confirms it — July 4 2026
// falls on a Saturday and the circular lists Independence Day as July 3.

/** Observed date for a fixed-date holiday, shifted off the weekend. */
function observed(year: number, month0: number, day: number): Date {
  const d = new Date(year, month0, day);
  const dow = d.getDay();
  if (dow === 6) return new Date(year, month0, day - 1); // Sat → Fri
  if (dow === 0) return new Date(year, month0, day + 1); // Sun → Mon
  return d;
}

/** Nth <weekday> of a month, e.g. nthWeekday(2026, 0, 1, 3) = 3rd Monday of Jan. */
function nthWeekday(year: number, month0: number, weekday: number, n: number): Date {
  const first = new Date(year, month0, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month0, 1 + offset + (n - 1) * 7);
}

/** Last <weekday> of a month, e.g. Memorial Day = last Monday of May. */
function lastWeekday(year: number, month0: number, weekday: number): Date {
  const last = new Date(year, month0 + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month0, last.getDate() - offset);
}

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Commonwealth of Pennsylvania observed holidays for a calendar year, per
 * Administrative Circular 25-13.
 */
export function paHolidays(year: number): Date[] {
  const thanksgiving = nthWeekday(year, 10, 4, 4); // 4th Thursday of November
  return [
    observed(year, 0, 1), // New Year's Day
    nthWeekday(year, 0, 1, 3), // Martin Luther King Jr. Day — 3rd Mon Jan
    nthWeekday(year, 1, 1, 3), // Presidents' Day — 3rd Mon Feb
    lastWeekday(year, 4, 1), // Memorial Day — last Mon May
    observed(year, 5, 19), // Juneteenth
    observed(year, 6, 4), // Independence Day
    nthWeekday(year, 8, 1, 1), // Labor Day — 1st Mon Sep
    nthWeekday(year, 9, 1, 2), // Indigenous People's Day — 2nd Mon Oct
    observed(year, 10, 11), // Veterans Day
    thanksgiving,
    new Date(year, 10, thanksgiving.getDate() + 1), // Day After Thanksgiving
    observed(year, 11, 25), // Christmas Day
  ];
}

const holidayCache = new Map<number, Set<string>>();

function holidaySet(year: number): Set<string> {
  let set = holidayCache.get(year);
  if (!set) {
    set = new Set(paHolidays(year).map(key));
    holidayCache.set(year, set);
  }
  return set;
}

/** True when the date is a weekend or an observed PA holiday. */
export function isPaNonBusinessDay(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return true;
  if (holidaySet(d.getFullYear()).has(key(d))) return true;
  // New Year's Day falling on a Saturday is observed the Friday before —
  // i.e. Dec 31 of the *previous* year, which that year's list won't contain.
  if (d.getMonth() === 11 && d.getDate() === 31) {
    return holidaySet(d.getFullYear() + 1).has(key(d));
  }
  return false;
}

/**
 * The Nth business day of a month (1-indexed), or null if the month somehow
 * has fewer than N business days (impossible for N ≤ 10, guarded anyway).
 */
export function nthBusinessDay(year: number, month0: number, n: number): Date | null {
  if (n < 1) return null;
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month0, day);
    if (isPaNonBusinessDay(date)) continue;
    count++;
    if (count === n) return date;
  }
  return null;
}

/**
 * The next occurrence of "the Nth business day": this month's if it hasn't
 * passed, otherwise next month's.
 */
export function nextNthBusinessDay(n: number, today: Date): Date | null {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonth = nthBusinessDay(today.getFullYear(), today.getMonth(), n);
  if (thisMonth && thisMonth >= todayMidnight) return thisMonth;
  const nextY = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  const nextM = (today.getMonth() + 1) % 12;
  return nthBusinessDay(nextY, nextM, n);
}
