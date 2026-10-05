// Verification for the July 2026 schedule-accuracy audit fixes
// (TX table, MA Sunday/holiday shift, LA elderly/disabled branch,
// MD two-letter surnames, CT bands sanity).
// Mirrors lib/state-rules.tsx logic in plain JS, per this repo's verify.mjs
// pattern. Run: node scripts/verify-audit-fixes.mjs

function bandLookup(bands, v) {
  for (const [lo, hi, day] of bands) if (v >= lo && v <= hi) return day;
  return null;
}

// ── TX: current HHSC B-251 table (post-May-2023 certifications) ──
const TX_BANDS = [
  [0, 3, 1], [4, 6, 2], [7, 10, 3], [11, 13, 4], [14, 17, 5], [18, 20, 6],
  [21, 24, 7], [25, 27, 8], [28, 31, 9], [32, 34, 10], [35, 38, 11],
  [39, 41, 12], [42, 45, 13], [46, 49, 14], [50, 53, 15], [54, 57, 16],
  [58, 60, 17], [61, 64, 18], [65, 67, 19], [68, 71, 20], [72, 74, 21],
  [75, 78, 22], [79, 81, 23], [82, 85, 24], [86, 88, 25], [89, 92, 26],
  [93, 95, 27], [96, 99, 28],
];

// NYC moved to scripts/verify-nyc.mjs, which imports lib/nyc-schedule.ts
// directly instead of mirroring it — NYC's dates now come from HRA's
// published table, which a mirror can't meaningfully re-derive.

// ── MA: scheduled day shifted back past Sundays/holidays ──
const MA_MAP = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];
function isMaSkipDay(d) {
  if (d.getDay() === 0) return true;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 1 && day === 1) || (m === 7 && day === 4) || (m === 11 && day === 11))
    return true;
  const dow = d.getDay();
  if (m === 9 && dow === 1 && day <= 7) return true;
  if (m === 10 && dow === 1 && day >= 8 && day <= 14) return true;
  return false;
}
function maNextDate(day, today) {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let add = 0; ; add++) {
    let date = new Date(today.getFullYear(), today.getMonth() + add, day);
    while (isMaSkipDay(date)) date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    if (date >= todayMidnight) return date;
  }
}

// ── LA: elderly/disabled branch ──
const LA_MAP = [5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
function laCompute(digit, elderlyOrDisabled) {
  if (elderlyOrDisabled) return { snapText: 'Between the 1st and the 4th' };
  return { snapDay: LA_MAP[digit] };
}

// ── MD: 2-3 letter prefix vs alphabetic ranges ──
const MD_RANGES = [
  ['AAA', 'BAO', 4], ['BAP', 'BQZ', 5], ['BRA', 'CAQ', 6], ['CAR', 'COQ', 7],
  ['COR', 'DIZ', 8], ['DJA', 'FIS', 9], ['FIT', 'GON', 10], ['GOO', 'HAX', 11],
  ['HAY', 'JAB', 12], ['JAC', 'KIM', 13], ['KIN', 'LOX', 14], ['LOY', 'MCO', 15],
  ['MCP', 'NEF', 16], ['NEG', 'PGZ', 17], ['PHA', 'RIC', 18], ['RID', 'SDZ', 19],
  ['SEA', 'STC', 20], ['STD', 'TRA', 21], ['TRB', 'WES', 22], ['WET', 'ZZZ', 23],
];
function mdCompute(name) {
  const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
  if (letters.length < 2) return null;
  for (const [lo, hi, day] of MD_RANGES) if (letters >= lo && letters <= hi) return day;
  return null;
}

// ── CT: bands unchanged (sanity that the relabel didn't touch math) ──
const CT_BANDS = [
  [0, 12, 1], [13, 24, 2], [25, 37, 3], [38, 49, 4],
  [50, 62, 5], [63, 74, 6], [75, 87, 7], [88, 99, 8],
];

const iso = (d) => d && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const tests = [
  // TX — current table. Endings 00-53 moved to days 1-15 (previously 16-28);
  // 46-49 → 14 (the old table's garbled 27); 54-99 unchanged across cohorts.
  ['TX 00', bandLookup(TX_BANDS, 0), 1],
  ['TX 03', bandLookup(TX_BANDS, 3), 1],
  ['TX 04', bandLookup(TX_BANDS, 4), 2],
  ['TX 46', bandLookup(TX_BANDS, 46), 14],
  ['TX 50', bandLookup(TX_BANDS, 50), 15],
  ['TX 53', bandLookup(TX_BANDS, 53), 15],
  ['TX 54', bandLookup(TX_BANDS, 54), 16],
  ['TX 99', bandLookup(TX_BANDS, 99), 28],

  // MA — Sunday/holiday shift to previous business day.
  // Jul 5, 2026 is a Sunday and Jul 4 a Saturday holiday → both skipped → Jul 3 (Fri).
  ['MA digit 3 (day 5) near Jul 4 weekend', iso(maNextDate(MA_MAP[3], new Date(2026, 6, 1))), '2026-07-03'],
  // Feb 1, 2026 is a Sunday → Jan 31 (Sat — Saturdays are normal deposit days).
  ['MA digit 0 (day 1) Feb 2026', iso(maNextDate(MA_MAP[0], new Date(2026, 0, 15))), '2026-01-31'],
  // Nov 8, 2026 is a Sunday → Nov 7 (Sat).
  ['MA digit 5 (day 8) Nov 2026', iso(maNextDate(MA_MAP[5], new Date(2026, 10, 1))), '2026-11-07'],
  // No shift when the scheduled day is a plain weekday.
  ['MA digit 1 (day 2) no shift', iso(maNextDate(MA_MAP[1], new Date(2026, 6, 1))), '2026-07-02'],
  // Shift never produces a date before "today" — rolls to next month instead.
  ['MA shifted date not in past', maNextDate(MA_MAP[3], new Date(2026, 6, 4)) >= new Date(2026, 6, 4), true],

  // LA — elderly/disabled branch and unchanged regular mapping.
  ['LA elderly/disabled → range text', laCompute(7, true).snapText, 'Between the 1st and the 4th'],
  ['LA digit 0', laCompute(0, false).snapDay, 5],
  ['LA digit 9', laCompute(9, false).snapDay, 23],

  // MD — two-letter surnames now resolve; three-letter behavior unchanged.
  ['MD Ng', mdCompute('Ng'), 17],
  ['MD Li', mdCompute('Li'), 14],
  ['MD Smith', mdCompute('Smith'), 20],
  ['MD single letter still blocked', mdCompute('N'), null],

  // CT — bands untouched by the Client ID relabel.
  ['CT 00', bandLookup(CT_BANDS, 0), 1],
  ['CT 12', bandLookup(CT_BANDS, 12), 1],
  ['CT 13', bandLookup(CT_BANDS, 13), 2],
  ['CT 99', bandLookup(CT_BANDS, 99), 8],
];

let failed = 0;
for (const [name, got, want] of tests) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) console.log(`  ok  ${name}`);
  else {
    failed++;
    console.error(`FAIL  ${name}: got ${g}, want ${w}`);
  }
}
console.log(failed ? `\n${failed} FAILURE(S)` : `\nAll ${tests.length} checks passed.`);
process.exit(failed ? 1 : 0);
