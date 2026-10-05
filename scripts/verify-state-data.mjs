// Verifies lib/state-data.ts — the canonical per-state program data.
//
// Run: node --experimental-strip-types scripts/verify-state-data.mjs
//
// Three kinds of checks:
//   1. Coverage — every state rule in lib/state-rules.tsx has a data entry, and
//      vice versa (no orphans in either direction).
//   2. Shape — dates are real ISO dates in the past, hotlines are dialable,
//      URLs are https, scheduleSource indexes into sources.
//   3. Cross-consistency with the UI layer — where states.tsx still owns
//      phrasing that embeds a program name (cash toggle labels), the name
//      must match cashProgram here, so the two files can't drift apart.

import { readFileSync } from 'node:fs';
import { STATE_DATA, USDA_SOURCE, scheduleSourceFor, snapDisplayLabel } from '../lib/state-data.ts';

const statesSrc = readFileSync(new URL('../lib/state-rules.tsx', import.meta.url), 'utf8');

const checks = [];
const eq = (name, got, want) => checks.push([name, got, want]);

// ── 1. Coverage ─────────────────────────────────────────────────────
const ruleAbbrs = [...statesSrc.matchAll(/^  abbr: '([A-Z]{2})',$/gm)].map((m) => m[1]).sort();
const dataAbbrs = Object.keys(STATE_DATA).sort();
eq('rule count', ruleAbbrs.length, 51);
eq('every rule has data', ruleAbbrs.filter((a) => !STATE_DATA[a]), []);
eq('every data entry has a rule', dataAbbrs.filter((a) => !ruleAbbrs.includes(a)), []);

// ── 1b. Field copy lives in state-data, not the rules ────────────────
eq('rules file has no inline (i) help', /infoModal: \{/.test(statesSrc), false);
eq('rules file has no inline field labels', /(digits|letter|singleDigit)Field\('[A-Z]/.test(statesSrc), false);
// Every rule with an input has a label; rules with no input have no field copy.
for (const block of statesSrc.split(/\nconst \w+: StateRule = \{/).slice(1)) {
  const abbr = block.match(/abbr: '([A-Z]{2})'/)?.[1];
  const noInput = /field: NO_FIELD,/.test(block);
  const hasCopy = !!STATE_DATA[abbr]?.field?.label;
  eq(`${abbr}: field copy ${noInput ? 'absent' : 'present'}`, hasCopy, !noInput);
}

// ── 2. Shape ────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
for (const [abbr, d] of Object.entries(STATE_DATA)) {
  const bad = (label, cond) => { if (!cond) eq(`${abbr}: ${label}`, false, true); };
  bad('name present', typeof d.name === 'string' && d.name.length > 1);
  bad('verified is YYYY-MM-DD', /^\d{4}-\d{2}-\d{2}$/.test(d.verified.date));
  bad('verified not in the future', d.verified.date <= today);
  bad('hotline is dialable', /^1-\d{3}-\d{3}-\d{4}$/.test(d.contact.hotline));
  if (d.contact.portal) {
    bad('portal has name and https url',
      d.contact.portal.name.length > 0 && d.contact.portal.url.startsWith('https://'));
  }
  bad('schedule source has name and https url',
    d.scheduleSource.name.length > 0 && d.scheduleSource.url.startsWith('https://'));
  if (d.snapProgramName != null) bad('snapProgramName non-empty', d.snapProgramName.length > 0);
  const explainers = typeof d.explainer === 'string' ? [d.explainer] : [d.explainer.yes, d.explainer.no];
  for (const e of explainers) {
    bad('explainer present', typeof e === 'string' && e.length > 40);
    bad('explainer names the state or program', e.includes(d.name) || /SNAP|EBT|NYC|HRA/.test(e));
    // Plain text except [label](https://url) links, which the UI renders
    // as anchors (components/Popover.tsx linkifyText).
    const stripped = e.replace(/\[[^\]]+\]\(https:\/\/[^\s)]+\)/g, 'link');
    bad('explainer is plain text (links only)', !/[<>\[\]{}]|\*[^ ]/.test(stripped));
  }
}
eq('shape checks ran', true, true);

// ── 3. Cross-consistency with states.tsx phrasing ───────────────────
// Named cash programs must appear in that state's cash labels; states
// whose rule has cash: null must not claim a cashProgram. The generic
// specs (cash on EBT, no program name) map to cashProgram.name === null.
const blocks = statesSrc.split(/(?=^  abbr: '[A-Z]{2}',$)/m).slice(1);
for (const block of blocks) {
  const abbr = block.match(/abbr: '([A-Z]{2})'/)[1];
  const d = STATE_DATA[abbr];
  const cashRef = block.match(/\n  cash: ([A-Za-z]+|null|\{)/)?.[1];
  const named = d.cashProgram?.name;
  if (named) {
    // The program name must show up in this rule's cash phrasing —
    // inline spec or one of the shared spec constants.
    const specSrc = cashRef === '{' ? block : statesSrc;
    eq(`${abbr}: cash labels mention ${named}`, specSrc.includes(named), true);
  }
  if (cashRef === 'null') {
    eq(`${abbr}: no cashProgram when rule has no cash`, d.cashProgram, undefined);
  }
}

// Named programs are where we expect them, and nowhere else.
eq('named cash programs',
  Object.entries(STATE_DATA).filter(([, d]) => d.cashProgram?.name).map(([a, d]) => `${a}:${d.cashProgram.name}`).sort(),
  ['CA:CalWORKs', 'IN:TANF', 'TX:TANF']);
eq('unnamed EBT-cash states',
  Object.entries(STATE_DATA).filter(([, d]) => d.cashProgram && d.cashProgram.name === null).map(([a]) => a).sort(),
  ['CO', 'CT', 'FL', 'KS', 'MI', 'WV']);
eq('SNAP program names',
  Object.entries(STATE_DATA).filter(([, d]) => d.snapProgramName).map(([a, d]) => `${a}:${d.snapProgramName}`).sort(),
  ['AZ:Nutrition Assistance', 'CA:CalFresh', 'VT:3SquaresVT', 'WA:Basic Food', 'WI:FoodShare']);

// ── Helpers ─────────────────────────────────────────────────────────
eq('snapDisplayLabel CA', snapDisplayLabel('CA'), 'SNAP (CalFresh)');
eq('snapDisplayLabel FL', snapDisplayLabel('FL'), 'SNAP (food stamps)');
eq('scheduleSourceFor MA is the DTA page', scheduleSourceFor('MA').url.includes('mass.gov'), true);
eq('scheduleSourceFor PA falls back to USDA', scheduleSourceFor('PA'), USDA_SOURCE);
eq('scheduleSourceFor null falls back to USDA', scheduleSourceFor(null), USDA_SOURCE);

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
