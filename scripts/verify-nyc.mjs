// Verifies the ingested NYC EBT pick-up schedule (Form EBT-52).
//
// Run: node --experimental-strip-types scripts/verify-nyc.mjs
//
// The tables below are transcribed independently of lib/nyc-schedule.ts —
// re-read off the PDFs, in the PDF's own "M/D" notation — so a typo in
// either copy shows up as a failure rather than agreeing with itself.
//
// Three things are checked:
//   1. Every ingested month matches the published table, date for date.
//   2. Structural invariants that hold across every real edition, applied to
//      the whole table — the standing check on whatever edition gets
//      transcribed next (#26).
//   3. The fallback formula's shape, and that lookup prefers the table.

import {
  NYC_EDITIONS,
  NYC_TABLE_THROUGH,
  isNycSkipDay,
  nycFormulaDay,
  nycIssuance,
  nycNextIssuance,
} from '../lib/nyc-schedule.ts';

const checks = [];
const eq = (name, got, want) => checks.push([name, got, want]);

// ── 1. Published tables, SNAP ("A") column ──────────────────────────
// Form EBT-52a Rev. 12/11/2024 — January–June 2025 (FNS mirror).
const EBT_52a_2024_12_11 = {
  '2025-01': ['1/2', '1/3', '1/4', '1/6', '1/7', '1/8', '1/9', '1/10', '1/13', '1/14'],
  '2025-02': ['2/1', '2/3', '2/4', '2/5', '2/6', '2/7', '2/10', '2/11', '2/13', '2/14'],
  '2025-03': ['3/1', '3/3', '3/4', '3/5', '3/6', '3/7', '3/10', '3/11', '3/12', '3/13'],
  '2025-04': ['4/1', '4/2', '4/3', '4/4', '4/7', '4/8', '4/9', '4/10', '4/11', '4/14'],
  '2025-05': ['5/1', '5/2', '5/3', '5/5', '5/6', '5/7', '5/8', '5/9', '5/12', '5/13'],
  '2025-06': ['6/2', '6/3', '6/4', '6/5', '6/6', '6/9', '6/10', '6/11', '6/12', '6/13'],
};

// Form EBT-52 Rev. 06/03/2025 — July–December 2025 (Wayback capture).
const EBT_52_2025_06_03 = {
  '2025-07': ['7/1', '7/2', '7/3', '7/5', '7/7', '7/8', '7/9', '7/10', '7/11', '7/12'],
  '2025-08': ['8/1', '8/2', '8/4', '8/5', '8/6', '8/7', '8/8', '8/9', '8/11', '8/12'],
  '2025-09': ['9/2', '9/3', '9/4', '9/5', '9/6', '9/8', '9/9', '9/10', '9/11', '9/12'],
  '2025-10': ['10/1', '10/2', '10/3', '10/4', '10/6', '10/7', '10/8', '10/9', '10/10', '10/11'],
  '2025-11': ['11/1', '11/3', '11/5', '11/6', '11/7', '11/8', '11/10', '11/12', '11/13', '11/14'],
  '2025-12': ['12/1', '12/2', '12/3', '12/4', '12/5', '12/6', '12/8', '12/9', '12/11', '12/12'],
};

// Form EBT-52 Rev. 06/16/2026 — July–December 2026 (PDF opened in a browser;
// otda.ny.gov blocks scripted fetches — see the note in lib/nyc-schedule.ts).
const EBT_52_2026_06_16 = {
  '2026-07': ['7/1', '7/2', '7/4', '7/6', '7/7', '7/8', '7/9', '7/10', '7/13', '7/14'],
  '2026-08': ['8/1', '8/3', '8/4', '8/5', '8/6', '8/7', '8/10', '8/11', '8/12', '8/13'],
  '2026-09': ['9/1', '9/2', '9/3', '9/4', '9/5', '9/8', '9/9', '9/10', '9/11', '9/12'],
  '2026-10': ['10/1', '10/2', '10/3', '10/5', '10/6', '10/7', '10/8', '10/9', '10/10', '10/13'],
  '2026-11': ['11/2', '11/4', '11/5', '11/6', '11/7', '11/9', '11/10', '11/12', '11/13', '11/14'],
  '2026-12': ['12/1', '12/2', '12/3', '12/4', '12/7', '12/8', '12/9', '12/10', '12/11', '12/14'],
};

const PUBLISHED = {
  ...EBT_52a_2024_12_11,
  ...EBT_52_2025_06_03,
  ...EBT_52_2026_06_16,
};

const ingested = Object.fromEntries(
  NYC_EDITIONS.flatMap((e) => Object.entries(e.months)),
);

eq('ingested month count', Object.keys(ingested).length, Object.keys(PUBLISHED).length);
eq('table covers through', NYC_TABLE_THROUGH, '2026-12');

for (const [key, cells] of Object.entries(PUBLISHED)) {
  const [year, month] = key.split('-').map(Number);
  // "7/14" → 14, and assert the month prefix while we're at it.
  const want = cells.map((cell) => {
    const [m, d] = cell.split('/').map(Number);
    return m === month ? d : `wrong month in ${cell}`;
  });
  eq(`${key} A column`, ingested[key], want);

  // Read it back out through the real lookup, per digit.
  for (let digit = 0; digit <= 9; digit++) {
    const got = nycIssuance(year, month - 1, digit);
    if (got?.date.getDate() !== want[digit] || got?.published !== true) {
      eq(`${key} digit ${digit} via nycIssuance`, {
        day: got?.date.getDate(),
        published: got?.published,
      }, { day: want[digit], published: true });
    }
  }
}

// ── 2. Invariants that hold across every real edition ───────────────
// These are the standing guard on any future transcription — especially the
// Jul–Dec 2026 edition, which is one step removed from the source.
for (const [key, days] of Object.entries(ingested)) {
  const [year, month] = key.split('-').map(Number);
  const label = `${key} invariant`;

  eq(`${label}: 10 digits`, days.length, 10);
  eq(`${label}: strictly ascending`, days.every((d, i) => i === 0 || d > days[i - 1]), true);
  eq(`${label}: inside days 1-14`, days[0] >= 1 && days[9] <= 14, true);

  const bad = days.filter((d) => isNycSkipDay(new Date(year, month - 1, d)));
  eq(`${label}: no Sundays or holidays`, bad, []);

  // Digit 0 always gets the first day of the month HRA can issue on.
  eq(`${label}: digit 0 is the first eligible day`, days[0], nycFormulaDay(year, month - 1, 0));
}

// ── 3. Fallback formula and lookup precedence ───────────────────────
// The formula reproduces Jul–Dec 2025 exactly and then breaks down — which
// is the whole reason the table exists. Pin both halves of that so nobody
// "simplifies" the table away.
const formulaMonth = (year, month, digits = 10) =>
  [...Array(digits).keys()].map((d) => nycFormulaDay(year, month - 1, d));

eq('formula matches Oct 2025', formulaMonth(2025, 10), ingested['2025-10']);
eq('formula matches Nov 2025', formulaMonth(2025, 11), ingested['2025-11']);
// …and disagrees here, by the irregular Saturday skips no rule reproduces.
eq('formula disagrees with Jan 2025', formulaMonth(2025, 1), [2, 3, 4, 6, 7, 8, 9, 10, 11, 13]);
eq('formula disagrees with Apr 2025', formulaMonth(2025, 4), [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);

// Holiday skips the formula must get right.
eq('formula skips Labor Day 2027', isNycSkipDay(new Date(2027, 8, 6)), true);
eq('formula skips Columbus Day 2027', isNycSkipDay(new Date(2027, 9, 11)), true);
eq('formula skips Election Day 2027', isNycSkipDay(new Date(2027, 10, 2)), true);
eq("formula skips Lincoln's Birthday", isNycSkipDay(new Date(2027, 1, 12)), true);
// Observance: July 4 2026 is a Saturday, so Friday July 3 closes and the
// Saturday itself stays a pickup day — the Jul–Dec 2026 table does exactly
// that. July 4 2027 is a Sunday, observed the Monday after.
eq('Jul 3 2026 skipped (observed)', isNycSkipDay(new Date(2026, 6, 3)), true);
eq('Jul 4 2026 is a pickup day', isNycSkipDay(new Date(2026, 6, 4)), false);
eq('Jul 5 2027 skipped (observed)', isNycSkipDay(new Date(2027, 6, 5)), true);

// Months past the table fall back, and say so.
const beyond = nycIssuance(2027, 0, 3);
eq('2027 falls back to the formula', beyond?.published, false);
eq('2027 still returns a date', beyond?.date.getMonth(), 0);

// Next-occurrence: on the day itself we keep today's date; the day after we
// roll to next month. Digit 5 in Aug 2026 is the 7th.
eq('on the day', nycNextIssuance(5, new Date(2026, 7, 7))?.date.getDate(), 7);
eq('day after rolls to September', nycNextIssuance(5, new Date(2026, 7, 8))?.date.getMonth(), 8);
eq('day after rolls to the 8th', nycNextIssuance(5, new Date(2026, 7, 8))?.date.getDate(), 8);
// December rolls into the next year, past the end of the table.
const rollover = nycNextIssuance(0, new Date(2026, 11, 2));
eq('December rolls into 2027', rollover?.date.getFullYear(), 2027);
eq('…and is flagged unpublished', rollover?.published, false);

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
