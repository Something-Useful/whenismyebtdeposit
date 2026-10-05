// Sanity-check the new state compute functions. Re-implements the rules in
// plain JS (so we don't bring in TS tooling). Each block mirrors lib/state-rules.tsx.

function bandLookup(bands, v) {
  for (const [lo, hi, day] of bands) if (v >= lo && v <= hi) return day;
  return null;
}

const tests = [];
const expect = (name, got, want) => tests.push([name, got, want]);

// AL — last 2 digits → 4-23
const AL_BANDS = [
  [0,4,4],[5,9,5],[10,14,6],[15,19,7],[20,24,8],[25,29,9],[30,34,10],
  [35,39,11],[40,44,12],[45,49,13],[50,54,14],[55,59,15],[60,64,16],
  [65,69,17],[70,74,18],[75,79,19],[80,84,20],[85,89,21],[90,94,22],[95,99,23],
];
expect('AL 100', bandLookup(AL_BANDS, parseInt('00')), 4);
expect('AL ...37', bandLookup(AL_BANDS, parseInt('37')), 11);
expect('AL 99', bandLookup(AL_BANDS, parseInt('99')), 23);

// AR — SSN last digit → 4-13
const AR_MAP = { 0:4,1:4,2:5,3:5,4:8,5:9,6:10,7:11,8:12,9:13 };
expect('AR 0', AR_MAP[0], 4);
expect('AR 4', AR_MAP[4], 8);
expect('AR 9', AR_MAP[9], 13);

// AZ — letter
const AZ_MAP = { A:1,B:1,C:2,D:2,E:3,F:3,G:4,H:4,I:5,J:5,K:6,L:6,M:7,N:7,O:8,P:8,Q:9,R:9,S:10,T:10,U:11,V:11,W:12,X:12,Y:13,Z:13 };
expect('AZ A', AZ_MAP['A'], 1);
expect('AZ M', AZ_MAP['M'], 7);
expect('AZ Z', AZ_MAP['Z'], 13);

// CA — last digit (0 → 10)
function caCompute(d) { return d === 0 ? 10 : d; }
expect('CA 0', caCompute(0), 10);
expect('CA 5', caCompute(5), 5);

// CT — letter → 1/2/3
function ctCompute(l) {
  if (l >= 'A' && l <= 'F') return 1;
  if (l >= 'G' && l <= 'N') return 2;
  return 3;
}
expect('CT A', ctCompute('A'), 1);
expect('CT F', ctCompute('F'), 1);
expect('CT G', ctCompute('G'), 2);
expect('CT O', ctCompute('O'), 3);
expect('CT Z', ctCompute('Z'), 3);

// DC — letter groups
const DC_MAP = { A:1,B:1,C:2,D:3,E:3,F:3,G:4,H:4,I:5,J:5,K:5,L:6,M:6,N:7,O:7,P:7,Q:7,R:8,S:8,T:9,U:9,V:9,W:10,X:10,Y:10,Z:10 };
expect('DC C', DC_MAP['C'], 2);
expect('DC W', DC_MAP['W'], 10);

// GA — last 2 → odd days 5-23 (bands of 10)
const GA_BANDS = [[0,9,5],[10,19,7],[20,29,9],[30,39,11],[40,49,13],[50,59,15],[60,69,17],[70,79,19],[80,89,21],[90,99,23]];
expect('GA 00', bandLookup(GA_BANDS, 0), 5);
expect('GA 55', bandLookup(GA_BANDS, 55), 15);
expect('GA 99', bandLookup(GA_BANDS, 99), 23);

// HI — A-I → 3, J-Z → 5
expect('HI A', ('A' <= 'I' ? 3 : 5), 3);
expect('HI J', ('J' <= 'I' ? 3 : 5), 5);

// ID — last digit of birth year → 1-10 (0→10)
function idCompute(d) { return d === 0 ? 10 : d; }
expect('ID 1989', idCompute(9), 9);
expect('ID 1990', idCompute(0), 10);

// IN — letter → days 5-23 (odd)
const IN_MAP = { A:5,B:5,C:7,D:7,E:9,F:9,G:9,H:11,I:11,J:13,K:13,L:13,M:15,N:15,O:17,P:17,Q:17,R:17,S:19,T:21,U:21,V:21,W:23,X:23,Y:23,Z:23 };
expect('IN S', IN_MAP['S'], 19);
expect('IN W', IN_MAP['W'], 23);

// KY — last digit → odd days 1-19
const KY_MAP = [1,3,5,7,9,11,13,15,17,19];
expect('KY 0', KY_MAP[0], 1);
expect('KY 7', KY_MAP[7], 15);
expect('KY 9', KY_MAP[9], 19);

// MA — last digit → 1-14
const MA_MAP = [1,2,4,5,7,8,10,11,13,14];
expect('MA 0', MA_MAP[0], 1);
expect('MA 6', MA_MAP[6], 10);
expect('MA 9', MA_MAP[9], 14);

// MD — first 3 letters → range
const MD_RANGES = [
  ['AAA','BAO',4],['BAP','BQZ',5],['BRA','CAQ',6],['CAR','COQ',7],['COR','DIZ',8],
  ['DJA','FIS',9],['FIT','GON',10],['GOO','HAX',11],['HAY','JAB',12],['JAC','KIM',13],
  ['KIN','LOX',14],['LOY','MCO',15],['MCP','NEF',16],['NEG','PGZ',17],['PHA','RIC',18],
  ['RID','SDZ',19],['SEA','STC',20],['STD','TRA',21],['TRB','WES',22],['WET','ZZZ',23],
];
function mdCompute(letters) {
  for (const [lo, hi, day] of MD_RANGES) if (letters >= lo && letters <= hi) return day;
  return null;
}
expect('MD SMI (Smith)', mdCompute('SMI'), 20);
expect('MD JON (Jones)', mdCompute('JON'), 13);
expect('MD AAA', mdCompute('AAA'), 4);
expect('MD ZZZ', mdCompute('ZZZ'), 23);

// MN — case digit → 4-13
const MN_MAP = { 4:4,5:5,6:6,7:7,8:8,9:9,0:10,1:11,2:12,3:13 };
expect('MN 4', MN_MAP[4], 4);
expect('MN 0', MN_MAP[0], 10);
expect('MN 3', MN_MAP[3], 13);

// NJ — 7th digit → 1-5 (paired)
const NJ_MAP = { 1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:4,9:5,0:5 };
expect('NJ 1', NJ_MAP[1], 1);
expect('NJ 5', NJ_MAP[5], 3);
expect('NJ 0', NJ_MAP[0], 5);
const njDay = (caseNo, warren) => (warren ? 1 : NJ_MAP[parseInt(caseNo[6], 10)]);
expect('NJ 1234569, not Warren (7th digit 9)', njDay('1234569', false), 5);
expect('NJ 1234569, Warren County', njDay('1234569', true), 1);

// NM — SSN last 2 → 1-20 (formula)
function nmCompute(last2) {
  const tens = parseInt(last2[0]), units = parseInt(last2[1]);
  const position = units === 0 ? 9 : units - 1;
  return position * 2 + (tens % 2 === 1 ? 1 : 2);
}
expect('NM 11', nmCompute('11'), 1);
expect('NM 01', nmCompute('01'), 2);
expect('NM 92', nmCompute('92'), 3);
expect('NM 00', nmCompute('00'), 20);
expect('NM 10', nmCompute('10'), 19);

// TX — last 2 digits → bands (current HHSC B-251 table, post-May-2023
// certifications; see scripts/verify-audit-fixes.mjs for the full cases)
const TX_BANDS = [
  [0,3,1],[4,6,2],[7,10,3],[11,13,4],[14,17,5],[18,20,6],[21,24,7],[25,27,8],
  [28,31,9],[32,34,10],[35,38,11],[39,41,12],[42,45,13],[46,49,14],[50,53,15],
  [54,57,16],[58,60,17],[61,64,18],[65,67,19],[68,71,20],[72,74,21],[75,78,22],
  [79,81,23],[82,85,24],[86,88,25],[89,92,26],[93,95,27],[96,99,28],
];
expect('TX 00', bandLookup(TX_BANDS, 0), 1);
expect('TX 50', bandLookup(TX_BANDS, 50), 15);
expect('TX 99', bandLookup(TX_BANDS, 99), 28);

// TN — last 2 → 1-20 (bands of 5)
const TN_BANDS = [
  [0,4,1],[5,9,2],[10,14,3],[15,19,4],[20,24,5],[25,29,6],[30,34,7],[35,39,8],
  [40,44,9],[45,49,10],[50,54,11],[55,59,12],[60,64,13],[65,69,14],[70,74,15],
  [75,79,16],[80,84,17],[85,89,18],[90,94,19],[95,99,20],
];
expect('TN 0', bandLookup(TN_BANDS, 0), 1);
expect('TN 99', bandLookup(TN_BANDS, 99), 20);

// WI — 8th digit of SSN (3rd of last 4) → mapping
const WI_MAP = { 0:2,1:3,2:5,3:6,4:8,5:9,6:11,7:12,8:14,9:15 };
function wiCompute(last4) {
  return WI_MAP[parseInt(last4[2])];
}
expect('WI 6789 → 3rd is 8 → 14', wiCompute('6789'), 14);
expect('WI 1234 → 3rd is 3 → 6', wiCompute('1234'), 6);

// WY — letter → 1-4
function wyCompute(l) {
  if (l <= 'D') return 1;
  if (l <= 'K') return 2;
  if (l <= 'R') return 3;
  return 4;
}
expect('WY A', wyCompute('A'), 1);
expect('WY L', wyCompute('L'), 3);
expect('WY Z', wyCompute('Z'), 4);

// VA — last digit → 1, 4, 7
function vaCompute(d) {
  if (d <= 3) return 1;
  if (d <= 5) return 4;
  return 7;
}
expect('VA 0', vaCompute(0), 1);
expect('VA 5', vaCompute(5), 4);
expect('VA 9', vaCompute(9), 7);

// UT — letter → 5, 11, 15
function utCompute(l) {
  if (l <= 'G') return 5;
  if (l <= 'O') return 11;
  return 15;
}
expect('UT A', utCompute('A'), 5);
expect('UT H', utCompute('H'), 11);
expect('UT Z', utCompute('Z'), 15);

// OR — last digit (0 & 1 → 1)
const OR_MAP = { 0:1,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9 };
expect('OR 0', OR_MAP[0], 1);
expect('OR 9', OR_MAP[9], 9);

// OK — last digit → 1, 5, 10
function okCompute(d) { if (d <= 3) return 1; if (d <= 6) return 5; return 10; }
expect('OK 0', okCompute(0), 1);
expect('OK 5', okCompute(5), 5);
expect('OK 9', okCompute(9), 10);

let failed = 0;
for (const [name, got, want] of tests) {
  const ok = got === want;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}  got=${got} want=${want}`);
  if (!ok) failed++;
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
