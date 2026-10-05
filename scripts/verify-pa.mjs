// Verifies Pennsylvania's business-day deposit algorithm.
//
// Run: node --experimental-strip-types scripts/verify-pa.mjs
//
// Two things are checked:
//   1. The generated PA holiday calendar matches Administrative Circular
//      25-13 (Governor's Office, 2025-08-19) for 2026, date for date. This
//      is the citation the whole computation rests on — see #35 on keeping
//      it current.
//   2. County rules resolve to the right business day, and business-day
//      counting lands on the right calendar date across tricky months.

import { paHolidays, nthBusinessDay, isPaNonBusinessDay } from '../lib/business-days.ts';
import {
  PA_COUNTIES,
  PA_ISSUANCE_DAYS,
  findPaCounty,
  paBusinessDay,
  paDepositDate,
  paIssuanceDate,
  paNeedsDigit,
} from '../lib/pa-rules.ts';

const iso = (d) =>
  d == null
    ? null
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;

// ── AC 25-13, verbatim ──────────────────────────────────────────────
const AC_25_13_2026 = [
  ['New Year\'s Day', '2026-01-01'],
  ['Dr. Martin Luther King, Jr. Day', '2026-01-19'],
  ['Presidents\' Day', '2026-02-16'],
  ['Memorial Day', '2026-05-25'],
  ['Juneteenth National Freedom Day', '2026-06-19'],
  ['Independence Day', '2026-07-03'], // July 4 2026 is a Saturday
  ['Labor Day', '2026-09-07'],
  ['Indigenous People\'s Day', '2026-10-12'],
  ['Veterans Day', '2026-11-11'],
  ['Thanksgiving Day', '2026-11-26'],
  ['Day After Thanksgiving', '2026-11-27'],
  ['Christmas Day', '2026-12-25'],
];

const checks = [];
const eq = (name, got, want) => checks.push([name, got, want]);

const generated = paHolidays(2026).map(iso);
eq('holiday count 2026', generated.length, AC_25_13_2026.length);
AC_25_13_2026.forEach(([name, date], i) => {
  eq(`AC 25-13: ${name}`, generated[i], date);
});

// Observance shifts for other years.
eq('New Year 2027 (Fri Jan 1)', iso(paHolidays(2027)[0]), '2027-01-01');
// Jan 1 2028 is a Saturday → observed Friday Dec 31 2027.
eq('Dec 31 2027 is a non-business day', isPaNonBusinessDay(new Date(2027, 11, 31)), true);
// July 4 2027 is a Sunday → observed Monday July 5.
eq('July 4 2027 observed Mon', iso(paHolidays(2027)[5]), '2027-07-05');

// ── Business-day counting ───────────────────────────────────────────
// Jan 2026: Thu 1st is New Year's (holiday) → 1st BD is Fri Jan 2.
eq('Jan 2026 1st BD', iso(nthBusinessDay(2026, 0, 1)), '2026-01-02');
// then Mon 5, Tue 6, Wed 7, Thu 8 …
eq('Jan 2026 2nd BD', iso(nthBusinessDay(2026, 0, 2)), '2026-01-05');
eq('Jan 2026 10th BD', iso(nthBusinessDay(2026, 0, 10)), '2026-01-15');
// MLK (Mon Jan 19) sits after the 10th BD, so it can't affect the window.
eq('Jan 2026 MLK is skipped', isPaNonBusinessDay(new Date(2026, 0, 19)), true);

// Jul 2026: Wed 1, Thu 2, Fri 3 is Independence Day (observed) → skipped.
eq('Jul 2026 1st BD', iso(nthBusinessDay(2026, 6, 1)), '2026-07-01');
eq('Jul 2026 3rd BD', iso(nthBusinessDay(2026, 6, 3)), '2026-07-06');
eq('Jul 3 2026 is a holiday', isPaNonBusinessDay(new Date(2026, 6, 3)), true);

// Aug 2026 starts on a Saturday → 1st BD is Mon Aug 3.
eq('Aug 2026 1st BD', iso(nthBusinessDay(2026, 7, 1)), '2026-08-03');
eq('Aug 2026 5th BD', iso(nthBusinessDay(2026, 7, 5)), '2026-08-07');

// Sep 2026: Tue 1 – Fri 4 are BDs 1-4, then the weekend and Labor Day
// (Mon Sep 7) are all skipped, so BD 5 is Tue Sep 8.
eq('Sep 2026 4th BD', iso(nthBusinessDay(2026, 8, 4)), '2026-09-04');
eq('Sep 2026 5th BD', iso(nthBusinessDay(2026, 8, 5)), '2026-09-08');

// Every month has at least 10 business days (the widest PA rule).
for (let m = 0; m < 12; m++) {
  eq(`2026-${m + 1} has a 10th BD`, nthBusinessDay(2026, m, 10) != null, true);
}

// ── County rules ────────────────────────────────────────────────────
eq('county count', PA_COUNTIES.length, 67);
eq(
  'counties needing a digit',
  PA_COUNTIES.filter(paNeedsDigit).length,
  31,
);

// single — same business day for everyone, digit irrelevant.
eq('Adams (single 5)', paBusinessDay(findPaCounty('Adams'), null), 5);
eq('Indiana (single 10)', paBusinessDay(findPaCounty('Indiana'), null), 10);

// twoBucket — digits 1-5 → low, 6-9/0 → high.
const berks = findPaCounty('Berks'); // low 4, high 9
eq('Berks digit 1', paBusinessDay(berks, 1), 4);
eq('Berks digit 5', paBusinessDay(berks, 5), 4);
eq('Berks digit 6', paBusinessDay(berks, 6), 9);
eq('Berks digit 9', paBusinessDay(berks, 9), 9);
eq('Berks digit 0', paBusinessDay(berks, 0), 9);
eq('Berks no digit', paBusinessDay(berks, null), null);

// tenDigit — digit d → dth BD, 0 → 10th.
const philly = findPaCounty('Philadelphia');
eq('Philadelphia digit 1', paBusinessDay(philly, 1), 1);
eq('Philadelphia digit 9', paBusinessDay(philly, 9), 9);
eq('Philadelphia digit 0', paBusinessDay(philly, 0), 10);
eq('Philadelphia no digit', paBusinessDay(philly, null), null);

// Every county resolves for every digit — no rule shape falls through.
for (const county of PA_COUNTIES) {
  for (let d = 0; d <= 9; d++) {
    const n = paBusinessDay(county, d);
    if (!(Number.isInteger(n) && n >= 1 && n <= 10)) {
      eq(`${county.name} digit ${d} in range`, n, '1-10');
    }
  }
}

// ── Published calendar (PA FS 855) ──────────────────────────────────
// The transcription agrees with business-day counting in every 2026 month
// except November, which PA compresses (days 1-3 all on Nov 2).
for (let m = 0; m < 12; m++) {
  const published = PA_ISSUANCE_DAYS[`2026-${String(m + 1).padStart(2, '0')}`];
  const counted = [...Array(10)].map((_, i) => nthBusinessDay(2026, m, i + 1).getDate());
  eq(`2026-${m + 1} published ${m === 10 ? 'differs from' : 'matches'} counted`, JSON.stringify(published) === JSON.stringify(counted), m !== 10);
}
eq('Nov 2026 issuance day 10 (published)', iso(paIssuanceDate(2026, 10, 10)), '2026-11-12');
eq('Nov 2026 issuance day 3 (published)', iso(paIssuanceDate(2026, 10, 3)), '2026-11-02');
eq('Philadelphia digit 0, from Nov 1 2026', iso(paDepositDate(philly, 0, new Date(2026, 10, 1))), '2026-11-12');
eq('Philadelphia digit 0, from Oct 20 2026 (Oct passed)', iso(paDepositDate(philly, 0, new Date(2026, 9, 20))), '2026-11-12');
eq('Philadelphia digit 2, from Nov 1 2026', iso(paDepositDate(philly, 2, new Date(2026, 10, 1))), '2026-11-02');
// Months the calendar doesn't cover fall back to counting business days.
eq('Jan 2027 issuance day 1 (counted)', iso(paIssuanceDate(2027, 0, 1)), '2027-01-04');
eq('Philadelphia digit 0, from Dec 20 2026', iso(paDepositDate(philly, 0, new Date(2026, 11, 20))), iso(nthBusinessDay(2027, 0, 10)));

// ── Report ──────────────────────────────────────────────────────────
let failed = 0;
for (const [name, got, want] of checks) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
