// Quick verification of FL/DE/CO calculations. Runs after `npm run build` or
// directly against compiled state rules via a dev-time import. We re-implement
// the band lookup here in plain JS so the script doesn't depend on TS tooling.

function bandLookup(bands, v) {
  for (const [lo, hi, day] of bands) if (v >= lo && v <= hi) return day;
  return null;
}

const FL_SNAP_BANDS = [
  [0, 3, 1], [4, 6, 2], [7, 10, 3], [11, 13, 4], [14, 17, 5], [18, 20, 6],
  [21, 24, 7], [25, 27, 8], [28, 31, 9], [32, 34, 10], [35, 38, 11], [39, 41, 12],
  [42, 45, 13], [46, 48, 14], [49, 53, 15], [54, 57, 16], [58, 60, 17], [61, 64, 18],
  [65, 67, 19], [68, 71, 20], [72, 74, 21], [75, 78, 22], [79, 81, 23], [82, 85, 24],
  [86, 88, 25], [89, 92, 26], [93, 95, 27], [96, 99, 28],
];
const FL_CASH_BANDS = [[0, 33, 1], [34, 66, 2], [67, 99, 3]];

function flCompute(caseNo, hasCash) {
  const digits = String(caseNo).replace(/\D/g, '');
  if (digits.length < 9) return { snapDay: null, cashDay: null };
  const trimmed = digits.slice(0, 9);
  const d8 = trimmed[7], d9 = trimmed[8];
  return {
    snapDay: bandLookup(FL_SNAP_BANDS, parseInt(d9 + d8, 10)),
    cashDay: hasCash ? bandLookup(FL_CASH_BANDS, parseInt(d8 + d9, 10)) : null,
  };
}

const DE_MAP = {
  A:2,B:3,C:4,D:5,E:6,F:7,G:8,H:9,I:10,J:11,K:12,L:13,M:14,N:15,O:16,P:17,
  Q:18,R:18,S:19,T:20,U:21,V:21,W:22,X:23,Y:23,Z:23,
};
function deCompute(name) {
  const l = name.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 1);
  return { snapDay: DE_MAP[l] ?? null, cashDay: null };
}

function coCompute(s, hasCash) {
  const digits = s.replace(/\D/g, '');
  if (!digits) return { snapDay: null, cashDay: null };
  const d = parseInt(digits.slice(-1), 10);
  const snapDay = d === 0 ? 10 : d;
  let cashDay = null;
  if (hasCash) {
    if ([7, 8, 9, 0].includes(d)) cashDay = 1;
    else if ([4, 5, 6].includes(d)) cashDay = 2;
    else cashDay = 3;
  }
  return { snapDay, cashDay };
}

const tests = [
  ['FL 123456735 + cash', flCompute('123456735', true), { snapDay: 15, cashDay: 2 }],
  ['FL 123456735 SNAP only', flCompute('123456735', false), { snapDay: 15, cashDay: null }],
  ['FL 111111100 (digits 8,9 = 0,0)', flCompute('111111100', true), { snapDay: 1, cashDay: 1 }],
  ['FL 999999999 (digits 8,9 = 9,9)', flCompute('999999999', true), { snapDay: 28, cashDay: 3 }],
  ['FL too short', flCompute('12345', true), { snapDay: null, cashDay: null }],

  ['DE Martinez', deCompute('Martinez'), { snapDay: 14, cashDay: null }],
  ['DE adams (lowercase)', deCompute('adams'), { snapDay: 2, cashDay: null }],
  ['DE Quinn (Q=18)', deCompute('Quinn'), { snapDay: 18, cashDay: null }],
  ['DE Rivera (R=18)', deCompute('Rivera'), { snapDay: 18, cashDay: null }],
  ['DE Zhang (Z=23)', deCompute('Zhang'), { snapDay: 23, cashDay: null }],

  ['CO 5 SNAP only', coCompute('5', false), { snapDay: 5, cashDay: null }],
  ['CO 5 + cash', coCompute('5', true), { snapDay: 5, cashDay: 2 }],
  ['CO 0 (last digit) + cash', coCompute('123456780', true), { snapDay: 10, cashDay: 1 }],
  ['CO 1 + cash', coCompute('1', true), { snapDay: 1, cashDay: 3 }],
  ['CO 7 + cash', coCompute('7', true), { snapDay: 7, cashDay: 1 }],
];

let failed = 0;
for (const [name, got, want] of tests) {
  const ok = got.snapDay === want.snapDay && got.cashDay === want.cashDay;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
