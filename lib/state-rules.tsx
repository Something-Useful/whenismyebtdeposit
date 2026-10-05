import type { ReactNode } from 'react';
import { nextDateForDay, ordinal } from './format';
import { STATE_DATA, type InfoModalContent } from './state-data';
import {
  PA_COUNTIES,
  findPaCounty,
  paEveryMonthCopy,
  paNeedsDigit,
  paDepositDate,
} from './pa';
import { type NycIssuance, nycNextIssuance, nycNextPublishedDates } from './nyc-schedule';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface SecondaryAction {
  /** Link label shown below the input. */
  label: string;
  /** The `inputValue` to set when the link is clicked. The state's `compute`
   * and `validate` must understand this sentinel. Submit fires immediately. */
  inputValue: string;
}

export interface FieldSpec {
  kind:
    | 'digits'
    | 'letter'
    | 'singleDigit'
    | 'none'
    | 'birthMonthAndLetter'
    | 'comboboxSelect'
    | 'countyAndDigit';
  /** Filled from STATE_DATA[abbr].field — see withFieldCopy(). */
  label?: string;
  placeholder: string;
  helperText?: string;
  minLength?: number;
  inputMode: 'numeric' | 'text';
  autoCapitalize?: 'characters' | 'none';
  secondaryAction?: SecondaryAction;
  infoModal?: InfoModalContent;
  /** Used by `comboboxSelect` kind — list of selectable values/labels. */
  comboboxOptions?: ReadonlyArray<readonly [value: string, label: string]>;
  /** Friendly singular noun used in empty-state copy ("No counties match…"). */
  comboboxNoun?: string;
  /** Used by `countyAndDigit`: given the currently-selected combobox value,
   * does the second (digit) input apply? Lets StateFields stay ignorant of
   * which PA counties split by case digit. */
  secondInputApplies?: (selected: string) => boolean;
  /** Label + (i) content for the second (digit) input of `countyAndDigit`
   * (PA) or the second input of `birthMonthAndLetter` (MO). Filled from
   * STATE_DATA[abbr].field.secondInput. */
  secondInputLabel?: string;
  secondInputInfoModal?: InfoModalContent;
  /** A second input shown only when the cash toggle is "Yes" (e.g. TX's
   * TANF EDG number). Encoded as "primary|cash" via MULTI_DELIM. */
  cashInput?: CashInputSpec;
}

export interface CashInputSpec {
  /** Filled from STATE_DATA[abbr].field.cashInput. */
  label?: string;
  placeholder: string;
  minLength: number;
  infoModal?: InfoModalContent;
}

// Multi-input states encode all their values into the single `inputValue`
// string using `MULTI_DELIM` as a separator. Missouri uses "MM|L" — month +
// first letter. This avoids changing the page-level state shape.
export const MULTI_DELIM = '|';

export interface CashSpec {
  promptLabel: string;
  snapOnlyLabel: string;
  hasCashLabel: string;
  cashLabel: string;
  combinedLabel: string;
  /** When true, the toggle is pre-selected to the `hasCashLabel` side
   *  (the "Yes" position) on initial render rather than the default
   *  `snapOnlyLabel`. Used by states where the more-common answer is
   *  "yes" — e.g. NY, where this toggle stands in for "Are you in NYC?"
   *  and NYC's population dwarfs upstate's. */
  defaultHasCash?: boolean;
}

export interface ComputeResult {
  snapDay: number | null;
  cashDay: number | null;
  /** Optional absolute date override. When set, the result page uses this
   * directly instead of running the snapDay through next-occurrence logic.
   * Use for states whose deposit day varies per month (NYC). */
  snapDate?: Date | null;
  cashDate?: Date | null;
  /** When the state has no public formula for the exact day, the result
   * screen shows this short text in place of a date (e.g. WA: "1st–20th"). */
  snapText?: string;
  /** Same idea as `snapText`, but for the cash card. Used by CA — CalWORKs
   * cash loads on the 1st–3rd but California publishes no per-recipient
   * formula, so we render "Between the 1st and 3rd" as a text card. */
  cashText?: string;
  /** When set, the result screen renders this in the "Every month" card
   * instead of calling `rule.everyMonth(args)`. Useful for states (PA) that
   * need to embed user-input-derived data (county) into the explanation. */
  everyMonthOverride?: ReactNode;
}

export interface EveryMonthArgs {
  snapDay: number;
  cashDay: number | null;
  sameDay: boolean;
  hasCash: boolean;
}

export interface StateRule {
  abbr: string;
  name: string;
  field: FieldSpec;
  cash: CashSpec | null;
  /** Returns a user-facing error string when the input isn't usable, or null
   * when it is. Called on submit; the welcome screen surfaces the result
   * inline as red text below the field. */
  validate(input: string): string | null;
  /** Validates the `cashInput` field. Only called when the cash toggle is
   * "Yes"; runs alongside `validate` so both errors can show at once. */
  validateCash?(input: string): string | null;
  normalize(input: string): string;
  compute(input: string, hasCash: boolean, today?: Date): ComputeResult;
  everyMonth(args: EveryMonthArgs): ReactNode;
}

// ─────────────────────────────────────────────────────────────
// Helpers (shared field shapes, sentence builders, lookups)
// ─────────────────────────────────────────────────────────────

const bold = (text: ReactNode) => (
  <strong style={{ fontWeight: 700, color: '#15140f' }}>{text}</strong>
);

type Band = readonly [number, number, number];

function bandLookup(bands: ReadonlyArray<Band>, v: number): number | null {
  for (const [lo, hi, day] of bands) if (v >= lo && v <= hi) return day;
  return null;
}

function digitsField(placeholder: string, minLength: number): FieldSpec {
  return { kind: 'digits', placeholder, minLength, inputMode: 'numeric' };
}

function letterField(minLength = 1): FieldSpec {
  return {
    kind: 'letter',
    placeholder: 'e.g. Smith',
    minLength,
    inputMode: 'text',
    autoCapitalize: 'characters',
  };
}

function singleDigitField(): FieldSpec {
  return {
    kind: 'singleDigit',
    placeholder: 'e.g. 7',
    minLength: 1,
    inputMode: 'numeric',
  };
}

const NO_FIELD: FieldSpec = {
  kind: 'none',
  placeholder: '',
  minLength: 0,
  inputMode: 'text',
};

const genericCashSpec: CashSpec = {
  promptLabel: 'Do you get EBT cash?',
  snapOnlyLabel: 'No, SNAP only',
  hasCashLabel: 'Yes',
  cashLabel: 'EBT cash',
  combinedLabel: 'SNAP + EBT cash, both on',
};

const tanfCashSpec: CashSpec = {
  promptLabel: 'Do you get EBT cash (TANF)?',
  snapOnlyLabel: 'No, SNAP only',
  hasCashLabel: 'Yes',
  cashLabel: 'EBT cash (TANF)',
  combinedLabel: 'SNAP + EBT cash, both on',
};

// CA's CalWORKs cash loads on the 1st–3rd of every month, but California
// publishes no per-recipient formula like CalFresh has. The result page
// renders "Between the 1st and 3rd" via `cashText`. combinedLabel won't
// fire (the cash day is never set, so sameDay is never true).
const calworksCashSpec: CashSpec = {
  promptLabel: 'Do you get EBT cash (CalWORKs)?',
  snapOnlyLabel: 'No, SNAP only',
  hasCashLabel: 'Yes',
  cashLabel: 'EBT cash (CalWORKs)',
  combinedLabel: 'SNAP + EBT cash, both on',
};

function snapOnlyEveryMonth({ snapDay }: EveryMonthArgs): ReactNode {
  return (
    <>
      Your SNAP loads on the {bold(ordinal(snapDay))} of every month.
    </>
  );
}

function snapAndCashEveryMonth(
  { snapDay, cashDay, sameDay, hasCash }: EveryMonthArgs,
  cashName = 'EBT cash',
): ReactNode {
  return (
    <>
      Your SNAP loads on the {bold(ordinal(snapDay))} of every month
      {hasCash && cashDay != null && !sameDay && (
        <>
          , and your {cashName} loads on the {bold(ordinal(cashDay))}
        </>
      )}
      {hasCash && sameDay && <> — your {cashName} arrives the same day</>}.
    </>
  );
}

function firstLetter(input: string): string | null {
  const m = input.match(/[A-Za-z]/);
  return m ? m[0].toUpperCase() : null;
}

function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

function lastDigit(input: string): number | null {
  const d = digitsOnly(input);
  if (!d) return null;
  return parseInt(d.slice(-1), 10);
}

function lastTwoDigits(input: string): number | null {
  const d = digitsOnly(input);
  if (d.length < 2) return null;
  return parseInt(d.slice(-2), 10);
}

// ── Validation helpers ───────────────────────────────────────
// Each returns a validate function that yields `null` when the input is
// usable, or a short red-text error otherwise. Per-state validate methods
// pick the right helper and pass a natural-language label.

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function vDigits(itemName: string, min: number) {
  return (input: string): string | null => {
    const d = digitsOnly(input);
    if (d.length === 0) return `Enter ${itemName}`;
    if (d.length < min) return `${cap(itemName)} needs at least ${min} digits`;
    return null;
  };
}

function vLetter(itemName: string, min = 1) {
  return (input: string): string | null => {
    const l = input.replace(/[^A-Za-z]/g, '');
    if (l.length === 0) return `Enter ${itemName}`;
    if (l.length < min) return `${cap(itemName)} needs at least ${min} letters`;
    return null;
  };
}

function vSingleDigit(itemName: string) {
  return (input: string): string | null =>
    /\d/.test(input) ? null : `Enter ${itemName}`;
}

const vNone = (): string | null => null;

function vMo(input: string): string | null {
  const [month, name] = input.split(MULTI_DELIM);
  const m = parseInt(month ?? '', 10);
  if (!(m >= 1 && m <= 12)) return 'Pick your birth month';
  if (!name || !/[A-Za-z]/.test(name)) return 'Enter your last name';
  return null;
}

// ─────────────────────────────────────────────────────────────
// FLORIDA
// SNAP: 1st-28th, digits 9 then 8 (read backward), dropping the 10th.
// Cash aid or SUNCAP (SNAP for SSI recipients): 1st-3rd, same digits 9 then 8.
// ─────────────────────────────────────────────────────────────
const FL_SNAP_BANDS: Band[] = [
  [0, 3, 1], [4, 6, 2], [7, 10, 3], [11, 13, 4], [14, 17, 5], [18, 20, 6],
  [21, 24, 7], [25, 27, 8], [28, 31, 9], [32, 34, 10], [35, 38, 11], [39, 41, 12],
  [42, 45, 13], [46, 48, 14], [49, 53, 15], [54, 57, 16], [58, 60, 17], [61, 64, 18],
  [65, 67, 19], [68, 71, 20], [72, 74, 21], [75, 78, 22], [79, 81, 23], [82, 85, 24],
  [86, 88, 25], [89, 92, 26], [93, 95, 27], [96, 99, 28],
];
const FL_CASH_BANDS: Band[] = [[0, 33, 1], [34, 66, 2], [67, 99, 3]];

const florida: StateRule = {
  abbr: 'FL',
  name: 'Florida',
  field: {
    ...digitsField('e.g. 1234567890', 9),
  },
  cash: {
    promptLabel: 'Do you get cash aid or SUNCAP?',
    snapOnlyLabel: 'No, SNAP only',
    hasCashLabel: 'Yes',
    cashLabel: 'Cash aid or SUNCAP',
    combinedLabel: 'SNAP + cash aid or SUNCAP, both on',
  },
  normalize: digitsOnly,
  validate: vDigits('your case number', 9),
  compute(input, hasCash) {
    const d = digitsOnly(input);
    if (d.length < 9) return { snapDay: null, cashDay: null };
    const t = d.slice(0, 9);
    return {
      snapDay: bandLookup(FL_SNAP_BANDS, parseInt(t[8] + t[7], 10)),
      cashDay: hasCash ? bandLookup(FL_CASH_BANDS, parseInt(t[8] + t[7], 10)) : null,
    };
  },
  everyMonth: (args) => snapAndCashEveryMonth(args, 'cash aid or SUNCAP'),
};

// ─────────────────────────────────────────────────────────────
// DELAWARE — first letter of last name → days 2-23
// ─────────────────────────────────────────────────────────────
const DE_MAP: Record<string, number> = {
  A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8, H: 9, I: 10,
  J: 11, K: 12, L: 13, M: 14, N: 15, O: 16, P: 17,
  Q: 18, R: 18, S: 19, T: 20, U: 21, V: 21, W: 22,
  X: 23, Y: 23, Z: 23,
};

const delaware: StateRule = {
  abbr: 'DE',
  name: 'Delaware',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    return { snapDay: l ? DE_MAP[l] ?? null : null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// COLORADO — last digit of SSN → days 1-10 (SNAP), 1-3 (cash)
// ─────────────────────────────────────────────────────────────
const colorado: StateRule = {
  abbr: 'CO',
  name: 'Colorado',
  field: singleDigitField(),
  cash: genericCashSpec,
  normalize: (input) => digitsOnly(input).slice(-1),
  validate: vSingleDigit('the last digit of your SSN'),
  compute(input, hasCash) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    const snapDay = d === 0 ? 10 : d;
    let cashDay: number | null = null;
    if (hasCash) {
      if ([7, 8, 9, 0].includes(d)) cashDay = 1;
      else if ([4, 5, 6].includes(d)) cashDay = 2;
      else cashDay = 3;
    }
    return { snapDay, cashDay };
  },
  everyMonth: snapAndCashEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// ALABAMA — last 2 digits of case number → days 4-23 (bands of 5)
// ─────────────────────────────────────────────────────────────
const AL_BANDS: Band[] = [
  [0, 4, 4], [5, 9, 5], [10, 14, 6], [15, 19, 7], [20, 24, 8], [25, 29, 9],
  [30, 34, 10], [35, 39, 11], [40, 44, 12], [45, 49, 13], [50, 54, 14],
  [55, 59, 15], [60, 64, 16], [65, 69, 17], [70, 74, 18], [75, 79, 19],
  [80, 84, 20], [85, 89, 21], [90, 94, 22], [95, 99, 23],
];
const alabama: StateRule = {
  abbr: 'AL',
  name: 'Alabama',
  field: {
    ...digitsField('e.g. 1234567890', 2),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 2),
  compute(input) {
    const v = lastTwoDigits(input);
    return { snapDay: v == null ? null : bandLookup(AL_BANDS, v), cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// ALASKA — fixed 1st
// ─────────────────────────────────────────────────────────────
const alaska: StateRule = {
  abbr: 'AK',
  name: 'Alaska',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 1, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// ARIZONA — first letter of last name → days 1-13 (pairs)
// ─────────────────────────────────────────────────────────────
const AZ_MAP: Record<string, number> = {
  A: 1, B: 1, C: 2, D: 2, E: 3, F: 3, G: 4, H: 4, I: 5, J: 5,
  K: 6, L: 6, M: 7, N: 7, O: 8, P: 8, Q: 9, R: 9, S: 10, T: 10,
  U: 11, V: 11, W: 12, X: 12, Y: 13, Z: 13,
};
const arizona: StateRule = {
  abbr: 'AZ',
  name: 'Arizona',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    return { snapDay: l ? AZ_MAP[l] ?? null : null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// ARKANSAS — last digit of SSN → days 4-13
// ─────────────────────────────────────────────────────────────
const AR_MAP: Record<number, number> = {
  0: 4, 1: 4, 2: 5, 3: 5, 4: 8, 5: 9, 6: 10, 7: 11, 8: 12, 9: 13,
};
const arkansas: StateRule = {
  abbr: 'AR',
  name: 'Arkansas',
  field: singleDigitField(),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-1),
  validate: vSingleDigit('the last digit of your SSN'),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : AR_MAP[d] ?? null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// CALIFORNIA — last digit of case number → days 1-10 (0 → 10)
// Case numbers are 7 characters and can include letters, so the field takes
// alphanumerics; the schedule still keys off the last numeric digit.
// ─────────────────────────────────────────────────────────────
const caAlnum = (input: string) => input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
const california: StateRule = {
  abbr: 'CA',
  name: 'California',
  field: {
    ...digitsField('e.g. 1234567', 7),
    inputMode: 'text',
    autoCapitalize: 'characters',
  },
  cash: calworksCashSpec,
  normalize: caAlnum,
  validate: (input) => {
    const v = caAlnum(input);
    if (v.length === 0) return 'Enter your case number';
    if (v.length < 7) return 'Your case number needs 7 characters';
    if (!/\d/.test(v)) return 'Your case number needs at least one number';
    return null;
  },
  compute(input, hasCash) {
    const d = lastDigit(input);
    const snapDay = d == null ? null : d === 0 ? 10 : d;
    if (!hasCash) return { snapDay, cashDay: null };
    // CalWORKs cash: California publishes no per-recipient formula for the
    // 1st–3rd window, so the cash row shows the range as text instead of a
    // date. The "every month" copy carries the caveat.
    return {
      snapDay,
      cashDay: null,
      cashText: 'Between the 1st and 3rd',
      everyMonthOverride:
        snapDay != null ? (
          <>
            Your SNAP loads on the {bold(ordinal(snapDay))} of every month.
            Your EBT cash loads between the {bold('1st')} and{' '}
            {bold('3rd')}, but California doesn&rsquo;t say the exact day.
          </>
        ) : undefined,
    };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// CONNECTICUT — last 2 digits of Client ID → days 1-8.
// New schedule effective March 2026 (replacing the old letter-based rule).
// Cash benefits always arrive on the 1st.
// ─────────────────────────────────────────────────────────────
const CT_BANDS: Band[] = [
  [0, 12, 1], [13, 24, 2], [25, 37, 3], [38, 49, 4],
  [50, 62, 5], [63, 74, 6], [75, 87, 7], [88, 99, 8],
];
const connecticut: StateRule = {
  abbr: 'CT',
  name: 'Connecticut',
  field: {
    // Per CT DSS, the stagger key is the 9-digit Client ID — NOT the
    // 18-digit EBT card number across the front of the card.
    ...digitsField('e.g. 89', 2),
  },
  cash: genericCashSpec,
  normalize: (input) => digitsOnly(input).slice(-2),
  validate: vDigits('the last 2 of your Client ID', 2),
  compute(input, hasCash) {
    const v = lastTwoDigits(input);
    return {
      snapDay: v == null ? null : bandLookup(CT_BANDS, v),
      cashDay: hasCash ? 1 : null,
    };
  },
  everyMonth: snapAndCashEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// DC — first letter of last name → days 1-10 (groups)
// ─────────────────────────────────────────────────────────────
const DC_MAP: Record<string, number> = {
  A: 1, B: 1, C: 2, D: 3, E: 3, F: 3, G: 4, H: 4, I: 5, J: 5, K: 5,
  L: 6, M: 6, N: 7, O: 7, P: 7, Q: 7, R: 8, S: 8, T: 9, U: 9, V: 9,
  W: 10, X: 10, Y: 10, Z: 10,
};
const dc: StateRule = {
  abbr: 'DC',
  name: 'Washington D.C.',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    return { snapDay: l ? DC_MAP[l] ?? null : null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// GEORGIA — last 2 digits of ID → days 5-23 (odd days)
// ─────────────────────────────────────────────────────────────
const GA_BANDS: Band[] = [
  [0, 9, 5], [10, 19, 7], [20, 29, 9], [30, 39, 11], [40, 49, 13],
  [50, 59, 15], [60, 69, 17], [70, 79, 19], [80, 89, 21], [90, 99, 23],
];
const georgia: StateRule = {
  abbr: 'GA',
  name: 'Georgia',
  field: {
    ...digitsField('e.g. 1234567', 2),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your ID number', 2),
  compute(input) {
    const v = lastTwoDigits(input);
    return { snapDay: v == null ? null : bandLookup(GA_BANDS, v), cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// HAWAII — first letter of last name → day 3 or 5
// ─────────────────────────────────────────────────────────────
const hawaii: StateRule = {
  abbr: 'HI',
  name: 'Hawaii',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    if (!l) return { snapDay: null, cashDay: null };
    return { snapDay: l <= 'I' ? 3 : 5, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// IDAHO — last digit of birth year → days 1-10 (0 → 10)
// ─────────────────────────────────────────────────────────────
const idaho: StateRule = {
  abbr: 'ID',
  name: 'Idaho',
  field: digitsField('e.g. 1989', 4),
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your birth year', 4),
  compute(input) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    return { snapDay: d === 0 ? 10 : d, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// ILLINOIS — last digit of Head of Household ID → days 1-10 (0 → 10).
// Applies to households created after October 2017. Older cases have a
// legacy 1st/2nd/.../10th/13th/17th/20th schedule we don't compute.
// ─────────────────────────────────────────────────────────────
const illinois: StateRule = {
  abbr: 'IL',
  name: 'Illinois',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your ID number', 1),
  compute(input) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    return { snapDay: d === 0 ? 10 : d, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// INDIANA — first letter of last name → days 5-23 (odd). TANF on 1st.
// ─────────────────────────────────────────────────────────────
const IN_MAP: Record<string, number> = {
  A: 5, B: 5, C: 7, D: 7, E: 9, F: 9, G: 9, H: 11, I: 11,
  J: 13, K: 13, L: 13, M: 15, N: 15, O: 17, P: 17, Q: 17, R: 17,
  S: 19, T: 21, U: 21, V: 21, W: 23, X: 23, Y: 23, Z: 23,
};
const indiana: StateRule = {
  abbr: 'IN',
  name: 'Indiana',
  field: letterField(),
  cash: tanfCashSpec,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input, hasCash) {
    const l = firstLetter(input);
    return {
      snapDay: l ? IN_MAP[l] ?? null : null,
      cashDay: hasCash ? 1 : null,
    };
  },
  everyMonth: (args) => snapAndCashEveryMonth(args, 'EBT cash (TANF)'),
};

// ─────────────────────────────────────────────────────────────
// IOWA — first letter of last name → days 1-10 (groups)
// ─────────────────────────────────────────────────────────────
const IA_MAP: Record<string, number> = {
  A: 1, B: 1, C: 2, D: 2, E: 3, F: 3, G: 3, H: 4, I: 4,
  J: 5, K: 5, L: 5, M: 6, N: 6, O: 6, P: 7, Q: 7, R: 7,
  S: 8, T: 9, U: 9, V: 9, W: 10, X: 10, Y: 10, Z: 10,
};
const iowa: StateRule = {
  abbr: 'IA',
  name: 'Iowa',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    return { snapDay: l ? IA_MAP[l] ?? null : null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// KANSAS — first letter of last name → days 1-10. Cash on 1st.
// ─────────────────────────────────────────────────────────────
const KS_MAP: Record<string, number> = {
  A: 1, B: 1, C: 2, D: 2, E: 3, F: 3, G: 3, H: 4, I: 4, J: 4,
  K: 5, L: 5, M: 6, N: 7, O: 7, P: 7, Q: 7, R: 7, S: 8,
  T: 9, U: 9, V: 9, W: 10, X: 10, Y: 10, Z: 10,
};
const kansas: StateRule = {
  abbr: 'KS',
  name: 'Kansas',
  field: letterField(),
  cash: genericCashSpec,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input, hasCash) {
    const l = firstLetter(input);
    return {
      snapDay: l ? KS_MAP[l] ?? null : null,
      cashDay: hasCash ? 1 : null,
    };
  },
  everyMonth: snapAndCashEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// KENTUCKY — last digit of case number → days 1-19 (odd)
// ─────────────────────────────────────────────────────────────
const KY_MAP: number[] = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const kentucky: StateRule = {
  abbr: 'KY',
  name: 'Kentucky',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : KY_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// LOUISIANA — last digit of the head of household's SSN → days 5-23 (odd)
// Households whose head is elderly or with any disabled member instead get
// benefits the 1st-4th (per LDH);
// no public formula assigns the exact day within that window, so we reuse
// the cash-toggle UI to ask and show a text range — same repurposing
// pattern as NY's "Are you in NYC?" toggle.
// ─────────────────────────────────────────────────────────────
const LA_MAP: number[] = [5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
const louisiana: StateRule = {
  abbr: 'LA',
  name: 'Louisiana',
  field: singleDigitField(),
  cash: {
    promptLabel: 'Are you 60+, or is anyone in your household disabled?',
    snapOnlyLabel: 'No',
    hasCashLabel: 'Yes',
    cashLabel: '',
    combinedLabel: '',
  },
  normalize: (input) => digitsOnly(input).slice(-1),
  validate: vSingleDigit('the last digit of your SSN'),
  compute(input, elderlyOrDisabledHousehold) {
    if (elderlyOrDisabledHousehold) {
      return {
        snapDay: null,
        cashDay: null,
        snapText: 'Between the 1st and the 4th',
        everyMonthOverride: (
          <>
            Your SNAP loads between the {bold('1st')} and the {bold('4th')}{' '}
            of every month, but Louisiana doesn&rsquo;t say the exact day.
          </>
        ),
      };
    }
    const d = lastDigit(input);
    return { snapDay: d == null ? null : LA_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MAINE — last digit of birth day → days 10-14
// ─────────────────────────────────────────────────────────────
const ME_MAP: Record<number, number> = {
  0: 10, 9: 10, 1: 11, 8: 11, 2: 12, 3: 12, 4: 13, 7: 13, 5: 14, 6: 14,
};
const maine: StateRule = {
  abbr: 'ME',
  name: 'Maine',
  field: digitsField('e.g. 15', 1),
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('the day of the month you were born', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : ME_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MARYLAND — first 3 letters of last name → days 4-23 (alphabetic ranges)
// ─────────────────────────────────────────────────────────────
const MD_RANGES: Array<[string, string, number]> = [
  ['AAA', 'BAO', 4],  ['BAP', 'BQZ', 5],  ['BRA', 'CAQ', 6],  ['CAR', 'COQ', 7],
  ['COR', 'DIZ', 8],  ['DJA', 'FIS', 9],  ['FIT', 'GON', 10], ['GOO', 'HAX', 11],
  ['HAY', 'JAB', 12], ['JAC', 'KIM', 13], ['KIN', 'LOX', 14], ['LOY', 'MCO', 15],
  ['MCP', 'NEF', 16], ['NEG', 'PGZ', 17], ['PHA', 'RIC', 18], ['RID', 'SDZ', 19],
  ['SEA', 'STC', 20], ['STD', 'TRA', 21], ['TRB', 'WES', 22], ['WET', 'ZZZ', 23],
];
const maryland: StateRule = {
  abbr: 'MD',
  name: 'Maryland',
  // minLength 2 (not 3): real two-letter surnames (Ng, Li) exist, and the
  // lexicographic range compare below handles them correctly ("NG" sorts
  // inside NEG-PGZ → 17th), matching how MD DHS alphabetizes.
  field: letterField(2),
  cash: null,
  normalize: (input) => input.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3),
  validate: vLetter('your last name', 2),
  compute(input) {
    const letters = input.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    if (letters.length < 2) return { snapDay: null, cashDay: null };
    for (const [lo, hi, day] of MD_RANGES) {
      if (letters >= lo && letters <= hi) return { snapDay: day, cashDay: null };
    }
    return { snapDay: null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MASSACHUSETTS — last digit of SSN → days 1-14, shifted to the previous
// business day when the scheduled day lands on a Sunday or holiday (per
// DTA: mass.gov/info-details/using-your-ebt-card). Only holidays that can
// fall on days 1-14 matter: New Year's, July 4, Labor Day (1st Mon Sep),
// Columbus Day (2nd Mon Oct), Veterans Day. The ambiguous MA-only holidays
// (Patriots' Day etc.) all fall after the 14th, outside the window.
// Saturdays are normal deposit days, so a shift can land on one.
// ─────────────────────────────────────────────────────────────
const MA_MAP: number[] = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];

function isMaSkipDay(d: Date): boolean {
  if (d.getDay() === 0) return true; // Sunday
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 1 && day === 1) || (m === 7 && day === 4) || (m === 11 && day === 11))
    return true; // New Year's, July 4, Veterans Day
  const dow = d.getDay();
  if (m === 9 && dow === 1 && day <= 7) return true; // Labor Day
  if (m === 10 && dow === 1 && day >= 8 && day <= 14) return true; // Columbus Day
  return false;
}

/** Next occurrence of the scheduled day, shifted back to the previous
 * non-Sunday/non-holiday day per DTA. If shifting moves the date into the
 * past, rolls forward to next month's (shifted) occurrence. */
function maNextDate(day: number, today: Date): Date {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (let add = 0; ; add++) {
    let date = new Date(today.getFullYear(), today.getMonth() + add, day);
    while (isMaSkipDay(date)) date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    if (date >= todayMidnight) return date;
  }
}

const massachusetts: StateRule = {
  abbr: 'MA',
  name: 'Massachusetts',
  field: singleDigitField(),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-1),
  validate: vSingleDigit('the last digit of your SSN'),
  compute(input, _hasCash, today = new Date()) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    // snapDay stays the scheduled day (for the "every month" copy);
    // snapDate carries the Sunday/holiday shift for the date card.
    return { snapDay: MA_MAP[d], cashDay: null, snapDate: maNextDate(MA_MAP[d], today) };
  },
  everyMonth({ snapDay }) {
    return (
      <>
        Your SNAP loads on the {bold(ordinal(snapDay))} of every month — or
        the previous business day when that falls on a Sunday or holiday.
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────
// MICHIGAN — last digit of recipient ID → days 3-21 (odd)
// ─────────────────────────────────────────────────────────────
// Cash (FIP/SDA/RCA, per RFS 305) is split 50/50 across two days: digit
// pairs 0-1 → 5th & 15th, 2-3 → 6th & 16th, … 8-9 → 9th & 19th. We show
// whichever half comes next as the cash date and spell out both days in
// the "every month" copy.
const MI_MAP: number[] = [3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
const michigan: StateRule = {
  abbr: 'MI',
  name: 'Michigan',
  field: {
    ...digitsField('e.g. 1234567890', 1),
  },
  cash: genericCashSpec,
  normalize: digitsOnly,
  validate: vDigits('your recipient ID number', 1),
  compute(input, hasCash, today = new Date()) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    const snapDay = MI_MAP[d];
    if (!hasCash) return { snapDay, cashDay: null };
    const firstHalf = 5 + Math.floor(d / 2);
    const secondHalf = firstHalf + 10;
    const a = nextDateForDay(firstHalf, today)!;
    const b = nextDateForDay(secondHalf, today)!;
    return {
      snapDay,
      cashDay: null,
      cashDate: a < b ? a : b,
      everyMonthOverride: (
        <>
          Your SNAP loads on the {bold(ordinal(snapDay))} of every month. Your
          EBT cash loads in two halves, on the {bold(ordinal(firstHalf))} and
          the {bold(ordinal(secondHalf))}.
        </>
      ),
    };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MINNESOTA — last digit of case number → days 4-13
// ─────────────────────────────────────────────────────────────
const MN_MAP: Record<number, number> = {
  4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 0: 10, 1: 11, 2: 12, 3: 13,
};
const minnesota: StateRule = {
  abbr: 'MN',
  name: 'Minnesota',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : MN_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MISSISSIPPI — last 2 digits of case # → days 4-21
// ─────────────────────────────────────────────────────────────
const MS_BANDS: Band[] = [
  [0, 4, 4], [5, 10, 5], [11, 16, 6], [17, 22, 7], [23, 28, 8], [29, 34, 9],
  [35, 40, 10], [41, 46, 11], [47, 52, 12], [53, 58, 13], [59, 64, 14],
  [65, 69, 15], [70, 74, 16], [75, 79, 17], [80, 84, 18], [85, 89, 19],
  [90, 94, 20], [95, 99, 21],
];
const mississippi: StateRule = {
  abbr: 'MS',
  name: 'Mississippi',
  field: {
    ...digitsField('e.g. 1234567890', 2),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 2),
  compute(input) {
    const v = lastTwoDigits(input);
    return { snapDay: v == null ? null : bandLookup(MS_BANDS, v), cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MISSOURI — birth month + first letter of last name → days 1-22
// ─────────────────────────────────────────────────────────────
type MoEntry = { all: number } | { ak: number; lz: number };
const MO_TABLE: Record<number, MoEntry> = {
  1: { ak: 1, lz: 2 },
  2: { ak: 3, lz: 4 },
  3: { ak: 5, lz: 6 },
  4: { all: 7 },
  5: { ak: 8, lz: 9 },
  6: { ak: 10, lz: 11 },
  7: { ak: 12, lz: 13 },
  8: { ak: 14, lz: 15 },
  9: { ak: 16, lz: 17 },
  10: { ak: 18, lz: 19 },
  11: { ak: 20, lz: 21 },
  12: { all: 22 },
};

const missouri: StateRule = {
  abbr: 'MO',
  name: 'Missouri',
  field: {
    kind: 'birthMonthAndLetter',
    placeholder: '',
    minLength: 0,
    inputMode: 'text',
  },
  cash: null,
  normalize: (input) => input,
  validate: vMo,
  compute(input) {
    const [month, name] = input.split(MULTI_DELIM);
    const m = parseInt(month ?? '', 10);
    if (!(m >= 1 && m <= 12)) return { snapDay: null, cashDay: null };
    const letter = firstLetter(name ?? '');
    if (!letter) return { snapDay: null, cashDay: null };
    const entry = MO_TABLE[m];
    if ('all' in entry) return { snapDay: entry.all, cashDay: null };
    const day = letter >= 'A' && letter <= 'K' ? entry.ak : entry.lz;
    return { snapDay: day, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// MONTANA — last digit of case number → days 2-6 (pairs)
// ─────────────────────────────────────────────────────────────
const MT_MAP: number[] = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
const montana: StateRule = {
  abbr: 'MT',
  name: 'Montana',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : MT_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEBRASKA — last digit of SSN → days 1-5 (pairs)
// ─────────────────────────────────────────────────────────────
const NE_MAP: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 0: 5,
};
const nebraska: StateRule = {
  abbr: 'NE',
  name: 'Nebraska',
  field: singleDigitField(),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-1),
  validate: vSingleDigit('the last digit of your SSN'),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : NE_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEVADA — last digit of birth year → days 1-10 (0 → 10)
// ─────────────────────────────────────────────────────────────
const nevada: StateRule = {
  abbr: 'NV',
  name: 'Nevada',
  field: digitsField('e.g. 1989', 4),
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your birth year', 4),
  compute(input) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    return { snapDay: d === 0 ? 10 : d, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEW HAMPSHIRE — fixed 5th
// ─────────────────────────────────────────────────────────────
const newHampshire: StateRule = {
  abbr: 'NH',
  name: 'New Hampshire',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 5, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEW JERSEY — 7th digit of case number → days 1-5 (paired)
// Warren County gets the 1st regardless (USDA). Asked with the repurposed
// cash toggle, like NY's NYC/Upstate question.
// ─────────────────────────────────────────────────────────────
const NJ_MAP: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 0: 5,
};
const newJersey: StateRule = {
  abbr: 'NJ',
  name: 'New Jersey',
  field: {
    ...digitsField('e.g. 1234567', 7),
  },
  cash: {
    promptLabel: 'Do you live in Warren County?',
    snapOnlyLabel: 'No',
    hasCashLabel: 'Yes',
    cashLabel: '',
    combinedLabel: '',
  },
  normalize: digitsOnly,
  validate: vDigits('your case number', 7),
  compute(input, inWarrenCounty) {
    if (inWarrenCounty) return { snapDay: 1, cashDay: null };
    const d = digitsOnly(input);
    if (d.length < 7) return { snapDay: null, cashDay: null };
    const seventh = parseInt(d[6], 10);
    return { snapDay: NJ_MAP[seventh] ?? null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEW YORK — last digit of case number. Two modes:
//
//   Upstate: simple — digits 0/1 → 1st, 2 → 2nd, …, 9 → 9th.
//
//   NYC: there is no rule. HRA publishes the actual dates as a table
//   (Form EBT-52), 10 toe digits × 6 months, reissued every January and
//   July. lib/nyc-schedule.ts holds the transcribed editions and falls back
//   to an approximate formula for months no edition covers; the copy below
//   says which of the two the user is looking at.
//
// We reuse the cash toggle UI for "Are you in NYC?" — same widget shape,
// different semantic.
// ─────────────────────────────────────────────────────────────

/** The block under the date. NYC's date moves month to month, so this names
 * the pattern rather than a fixed day — and admits it when the date came
 * from the fallback formula instead of HRA's table. The schedule source
 * itself is cited in the "How New York calculates this" explainer.
 * `nextDates` (published-table dates only) is listed when available and
 * omitted entirely once the table runs out. */
function nycEveryMonthCopy(issuance: NycIssuance, nextDates: Date[] | null): ReactNode {
  if (issuance.published) {
    return (
      <>
        Your exact date changes each month, but it&rsquo;s always in the first
        two weeks.
        {nextDates && nextDates.length === 3 && (
          <>
            {' '}Your next three deposit dates are{' '}
            <strong>
              {nextDates
                .map((d) => `${d.getMonth() + 1}/${d.getDate()}`)
                .join(', ')}
            </strong>
            .
          </>
        )}
      </>
    );
  }
  return (
    <>
      Your SNAP arrives during the first two weeks of every month, on a date
      that changes each month. HRA hasn&rsquo;t published this month&rsquo;s
      schedule yet, so this is our best estimate — confirm it in{' '}
      <a
        href="https://otda.ny.gov/workingfamilies/ebt/nyc-issuance-schedule.pdf"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'underline' }}
      >
        HRA&rsquo;s official schedule
      </a>{' '}
      once it&rsquo;s out.
    </>
  );
}

const newYork: StateRule = {
  abbr: 'NY',
  name: 'New York',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: {
    promptLabel: 'Where do you live?',
    snapOnlyLabel: 'Upstate',
    hasCashLabel: 'NYC',
    cashLabel: '',
    combinedLabel: '',
    // NYC dwarfs upstate by population, so pre-select "Yes, NYC".
    defaultHasCash: true,
  },
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input, isNyc, today = new Date()) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    if (!isNyc) {
      // Upstate: digit 0 or 1 → 1st, otherwise day = digit.
      return { snapDay: d === 0 ? 1 : d, cashDay: null };
    }
    // NYC: look the date up in HRA's published table.
    const issuance = nycNextIssuance(d, today);
    if (!issuance) return { snapDay: null, cashDay: null };
    return {
      snapDay: issuance.date.getDate(),
      cashDay: null,
      snapDate: issuance.date,
      everyMonthOverride: nycEveryMonthCopy(
        issuance,
        nycNextPublishedDates(d, today, 3),
      ),
    };
  },
  // NYC always supplies `everyMonthOverride`, so this only runs upstate.
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NEW MEXICO — last 2 digits of SSN → days 1-20
// ─────────────────────────────────────────────────────────────
const newMexico: StateRule = {
  abbr: 'NM',
  name: 'New Mexico',
  field: digitsField('e.g. 89', 2),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-2),
  validate: vDigits('the last 2 of your SSN', 2),
  compute(input) {
    const d = digitsOnly(input);
    if (d.length < 2) return { snapDay: null, cashDay: null };
    const last2 = d.slice(-2);
    const tens = parseInt(last2[0], 10);
    const units = parseInt(last2[1], 10);
    const position = units === 0 ? 9 : units - 1;
    const day = position * 2 + (tens % 2 === 1 ? 1 : 2);
    return { snapDay: day, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NORTH CAROLINA — last digit of SSN → days 3-21 (odd)
// ─────────────────────────────────────────────────────────────
const NC_MAP: Record<number, number> = {
  1: 3, 2: 5, 3: 7, 4: 9, 5: 11, 6: 13, 7: 15, 8: 17, 9: 19, 0: 21,
};
// Households without an SSN get benefits on the 3rd (per NC DHHS).
const NC_NO_SSN = 'NO_SSN';
const northCarolina: StateRule = {
  abbr: 'NC',
  name: 'North Carolina',
  field: {
    ...singleDigitField(),
    secondaryAction: { label: "I don't have an SSN", inputValue: NC_NO_SSN },
  },
  cash: null,
  normalize: (input) =>
    input === NC_NO_SSN ? NC_NO_SSN : digitsOnly(input).slice(-1),
  validate: (input) =>
    input === NC_NO_SSN ? null : vSingleDigit('the last digit of your SSN')(input),
  compute(input) {
    if (input === NC_NO_SSN) return { snapDay: 3, cashDay: null };
    const d = lastDigit(input);
    return { snapDay: d == null ? null : NC_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// NORTH DAKOTA — fixed 1st
// ─────────────────────────────────────────────────────────────
const northDakota: StateRule = {
  abbr: 'ND',
  name: 'North Dakota',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 1, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// OHIO — last digit of case → days 2-20 (even)
// ─────────────────────────────────────────────────────────────
const OH_MAP: number[] = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const ohio: StateRule = {
  abbr: 'OH',
  name: 'Ohio',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : OH_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// OKLAHOMA — last digit of case → days 1, 5, or 10
// ─────────────────────────────────────────────────────────────
const oklahoma: StateRule = {
  abbr: 'OK',
  name: 'Oklahoma',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    if (d <= 3) return { snapDay: 1, cashDay: null };
    if (d <= 6) return { snapDay: 5, cashDay: null };
    return { snapDay: 10, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// OREGON — last digit of SSN → days 1-9 (0 & 1 share the 1st)
// ─────────────────────────────────────────────────────────────
const OR_MAP: Record<number, number> = {
  0: 1, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
};
const OR_NO_SSN = 'NO_SSN';
const oregon: StateRule = {
  abbr: 'OR',
  name: 'Oregon',
  field: {
    ...singleDigitField(),
    secondaryAction: { label: "I don't have an SSN", inputValue: OR_NO_SSN },
  },
  cash: null,
  normalize: (input) =>
    input === OR_NO_SSN ? OR_NO_SSN : digitsOnly(input).slice(-1),
  validate: (input) =>
    input === OR_NO_SSN ? null : vSingleDigit('the last digit of your SSN')(input),
  compute(input) {
    if (input === OR_NO_SSN) return { snapDay: 1, cashDay: null };
    const d = lastDigit(input);
    return { snapDay: d == null ? null : OR_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// PENNSYLVANIA — county-by-county business-day schedule. PA's 67 counties
// each set their own rule (single business day, two buckets by case digit,
// or per-digit across the first 10 business days), and "business day"
// excludes weekends and holidays — so we don't compute a specific date.
// User picks their county; the result page shows a plain-language
// description sourced from the USDA all-states schedule.
// ─────────────────────────────────────────────────────────────
const pennsylvania: StateRule = {
  abbr: 'PA',
  name: 'Pennsylvania',
  field: {
    // County alone resolves 36 of the 67 counties; the other 31 split by the
    // last digit of the case record number, so the digit input appears once
    // the user picks one of those. Encoded as "County|D" via MULTI_DELIM.
    kind: 'countyAndDigit',
    placeholder: 'Choose county',
    minLength: 1,
    inputMode: 'text',
    comboboxOptions: PA_COUNTIES.map((c) => [c.name, c.name] as const),
    comboboxNoun: 'counties',
    secondInputApplies: (countyName) => {
      const county = findPaCounty(countyName);
      return !!county && paNeedsDigit(county);
    },
  },
  cash: null,
  normalize: (input) => input.trim(),
  validate: (input) => {
    const [countyName, rawDigit] = input.split(MULTI_DELIM);
    const county = findPaCounty(countyName ?? '');
    if (!county) return 'Pick your county';
    if (!paNeedsDigit(county)) return null;
    return /^[0-9]$/.test((rawDigit ?? '').trim())
      ? null
      : 'Enter the last digit of your case number';
  },
  compute(input, _hasCash, today = new Date()) {
    const [countyName, rawDigit] = input.split(MULTI_DELIM);
    const county = findPaCounty(countyName ?? '');
    if (!county) return { snapDay: null, cashDay: null };
    const digit = /^[0-9]$/.test((rawDigit ?? '').trim())
      ? parseInt(rawDigit.trim(), 10)
      : null;
    const date = paDepositDate(county, digit, today);
    return {
      // PA counts business days, so the calendar date moves month to month —
      // snapDate carries it; snapDay is just this month's number.
      snapDay: date ? date.getDate() : null,
      cashDay: null,
      snapDate: date,
      everyMonthOverride: paEveryMonthCopy(county, digit),
    };
  },
  everyMonth({ snapDay: _snapDay }) {
    // We can't include real schedule text here because compute can't pass us
    // the county object directly through `EveryMonthArgs`. The result screen
    // calls this with the looked-up day, so we re-fetch the county via the
    // stored input. Workaround: the result screen renders an alternate copy
    // when `snapText` is set; this `everyMonth` is only used as a safety net.
    return (
      <>
        Pennsylvania&rsquo;s schedule is county-specific. Pick your county to
        see the exact business-day rule.
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────
// RHODE ISLAND — fixed 1st
// ─────────────────────────────────────────────────────────────
const rhodeIsland: StateRule = {
  abbr: 'RI',
  name: 'Rhode Island',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 1, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// SOUTH CAROLINA — last digit of case # → days 2-19 (post-Sept 2012).
// Households approved before Sept 2012 use a simpler 1→1st…0→10th schedule,
// noted in the explainer.
// ─────────────────────────────────────────────────────────────
const SC_MAP: Record<number, number> = {
  1: 11, 2: 2, 3: 13, 4: 4, 5: 15, 6: 6, 7: 17, 8: 8, 9: 19, 0: 10,
};
const southCarolina: StateRule = {
  abbr: 'SC',
  name: 'South Carolina',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your case number', 1),
  compute(input) {
    const d = lastDigit(input);
    return { snapDay: d == null ? null : SC_MAP[d], cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// SOUTH DAKOTA — fixed 10th
// ─────────────────────────────────────────────────────────────
const southDakota: StateRule = {
  abbr: 'SD',
  name: 'South Dakota',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 10, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// TENNESSEE — last 2 digits of SSN → days 1-20 (bands of 5)
// ─────────────────────────────────────────────────────────────
const TN_BANDS: Band[] = [
  [0, 4, 1], [5, 9, 2], [10, 14, 3], [15, 19, 4], [20, 24, 5], [25, 29, 6],
  [30, 34, 7], [35, 39, 8], [40, 44, 9], [45, 49, 10], [50, 54, 11],
  [55, 59, 12], [60, 64, 13], [65, 69, 14], [70, 74, 15], [75, 79, 16],
  [80, 84, 17], [85, 89, 18], [90, 94, 19], [95, 99, 20],
];
const tennessee: StateRule = {
  abbr: 'TN',
  name: 'Tennessee',
  field: digitsField('e.g. 89', 2),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-2),
  validate: vDigits('the last 2 of your SSN', 2),
  compute(input) {
    const v = lastTwoDigits(input);
    return { snapDay: v == null ? null : bandLookup(TN_BANDS, v), cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// TEXAS — last 2 digits of EDG # → days 1-28
// Current schedule per HHSC Texas Works Handbook B-251 (Rev 23-4, effective
// Oct 1, 2023): households certified on/after May 1, 2023 (or reapplying
// after a 6+ month break). Older cohorts keep their prior schedules —
// endings 54-99 coincide across cohorts; 00-53 differ. We default to the
// current table. Do NOT refresh TX from the USDA all-states table or
// third-party schedule aggregators — they still publish the stale
// 2020-2023 cohort table (16th-28th).
// ─────────────────────────────────────────────────────────────
const TX_BANDS: Band[] = [
  [0, 3, 1], [4, 6, 2], [7, 10, 3], [11, 13, 4], [14, 17, 5], [18, 20, 6],
  [21, 24, 7], [25, 27, 8], [28, 31, 9], [32, 34, 10], [35, 38, 11],
  [39, 41, 12], [42, 45, 13], [46, 49, 14], [50, 53, 15], [54, 57, 16],
  [58, 60, 17], [61, 64, 18], [65, 67, 19], [68, 71, 20], [72, 74, 21],
  [75, 78, 22], [79, 81, 23], [82, 85, 24], [86, 88, 25], [89, 92, 26],
  [93, 95, 27], [96, 99, 28],
];
// TANF (B-251): staggered over the 1st–3rd by the last digit of the TANF
// EDG number, which can differ from the SNAP EDG — so it gets its own input.
const TX_TANF_BANDS: Band[] = [[0, 3, 1], [4, 6, 2], [7, 9, 3]];
const texas: StateRule = {
  abbr: 'TX',
  name: 'Texas',
  field: {
    ...digitsField('e.g. 1234567890', 2),
    cashInput: {
      placeholder: 'e.g. 1234567890',
      minLength: 1,
    },
  },
  cash: tanfCashSpec,
  normalize: (input) => {
    const [snap = '', tanf = ''] = input.split(MULTI_DELIM);
    return `${digitsOnly(snap)}${MULTI_DELIM}${digitsOnly(tanf)}`;
  },
  validate: (input) => vDigits('your SNAP EDG number', 2)(input.split(MULTI_DELIM)[0] ?? ''),
  validateCash: (input) =>
    vDigits('your TANF EDG number', 1)(input.split(MULTI_DELIM)[1] ?? ''),
  compute(input, hasCash) {
    const [snap = '', tanf = ''] = input.split(MULTI_DELIM);
    const v = lastTwoDigits(snap);
    const d = hasCash ? lastDigit(tanf) : null;
    return {
      snapDay: v == null ? null : bandLookup(TX_BANDS, v),
      cashDay: d == null ? null : bandLookup(TX_TANF_BANDS, d),
    };
  },
  everyMonth: (args) => snapAndCashEveryMonth(args, 'EBT cash (TANF)'),
};

// ─────────────────────────────────────────────────────────────
// UTAH — first letter of last name → days 5, 11, 15
// ─────────────────────────────────────────────────────────────
const utah: StateRule = {
  abbr: 'UT',
  name: 'Utah',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    if (!l) return { snapDay: null, cashDay: null };
    if (l <= 'G') return { snapDay: 5, cashDay: null };
    if (l <= 'O') return { snapDay: 11, cashDay: null };
    return { snapDay: 15, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// VERMONT — fixed 1st
// ─────────────────────────────────────────────────────────────
const vermont: StateRule = {
  abbr: 'VT',
  name: 'Vermont',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({ snapDay: 1, cashDay: null }),
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// VIRGINIA — last digit of case # → days 1, 4, or 7
// ─────────────────────────────────────────────────────────────
const virginia: StateRule = {
  abbr: 'VA',
  name: 'Virginia',
  field: {
    ...digitsField('e.g. 1234567', 1),
  },
  cash: null,
  normalize: digitsOnly,
  validate: vDigits('your FS case number', 1),
  compute(input) {
    const d = lastDigit(input);
    if (d == null) return { snapDay: null, cashDay: null };
    if (d <= 3) return { snapDay: 1, cashDay: null };
    if (d <= 5) return { snapDay: 4, cashDay: null };
    return { snapDay: 7, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// WASHINGTON — no public formula. DSHS assigns each household a day
// between the 1st and 20th based on application + approval dates. The
// result page shows a description in place of a specific date.
// ─────────────────────────────────────────────────────────────
const washington: StateRule = {
  abbr: 'WA',
  name: 'Washington',
  field: NO_FIELD,
  cash: null,
  normalize: () => '',
  validate: vNone,
  compute: () => ({
    snapDay: null,
    cashDay: null,
    snapText: 'Between the 1st and 20th',
  }),
  everyMonth: () => (
    <>
      Your SNAP loads on the same day each month, somewhere between the{' '}
      {bold('1st')} and {bold('20th')}, but Washington doesn&rsquo;t say the
      exact day.
    </>
  ),
};

// ─────────────────────────────────────────────────────────────
// WEST VIRGINIA — first letter of last name → days 1-9 (weird groupings)
// ─────────────────────────────────────────────────────────────
const WV_MAP: Record<string, number> = {
  B: 1, X: 1, Y: 1, Z: 1,
  C: 2, F: 2,
  H: 3, N: 3, V: 3,
  I: 4, M: 4, O: 4, U: 4,
  Q: 5, S: 5,
  A: 6, W: 6,
  J: 7, K: 7, P: 7,
  D: 8, E: 8, R: 8,
  G: 9, L: 9, T: 9,
};
const westVirginia: StateRule = {
  abbr: 'WV',
  name: 'West Virginia',
  field: letterField(),
  cash: genericCashSpec,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input, hasCash) {
    const l = firstLetter(input);
    return {
      snapDay: l ? WV_MAP[l] ?? null : null,
      cashDay: hasCash ? 1 : null,
    };
  },
  everyMonth: snapAndCashEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// WISCONSIN — 8th digit of SSN (3rd of last 4) → days 2-15
// ─────────────────────────────────────────────────────────────
const WI_MAP: Record<number, number> = {
  0: 2, 1: 3, 2: 5, 3: 6, 4: 8, 5: 9, 6: 11, 7: 12, 8: 14, 9: 15,
};
const wisconsin: StateRule = {
  abbr: 'WI',
  name: 'Wisconsin',
  field: digitsField('e.g. 6789', 4),
  cash: null,
  normalize: (input) => digitsOnly(input).slice(-4),
  validate: vDigits('the last 4 of your SSN', 4),
  compute(input) {
    const d = digitsOnly(input);
    if (d.length < 4) return { snapDay: null, cashDay: null };
    const last4 = d.slice(-4);
    const eighthDigit = parseInt(last4[2], 10);
    return { snapDay: WI_MAP[eighthDigit] ?? null, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// WYOMING — first letter of last name → days 1-4
// ─────────────────────────────────────────────────────────────
const wyoming: StateRule = {
  abbr: 'WY',
  name: 'Wyoming',
  field: letterField(),
  cash: null,
  normalize: (input) => firstLetter(input) ?? '',
  validate: vLetter('your last name'),
  compute(input) {
    const l = firstLetter(input);
    if (!l) return { snapDay: null, cashDay: null };
    if (l <= 'D') return { snapDay: 1, cashDay: null };
    if (l <= 'K') return { snapDay: 2, cashDay: null };
    if (l <= 'R') return { snapDay: 3, cashDay: null };
    return { snapDay: 4, cashDay: null };
  },
  everyMonth: snapOnlyEveryMonth,
};

// ─────────────────────────────────────────────────────────────
// Registry — every state with a compute function shows up here.
// Coming soon (not yet in this map): IL, NY, PA, SC, WA.
// ─────────────────────────────────────────────────────────────
const RULES: Record<string, StateRule> = {
  AL: alabama,
  AK: alaska,
  AZ: arizona,
  AR: arkansas,
  CA: california,
  CO: colorado,
  CT: connecticut,
  DE: delaware,
  DC: dc,
  FL: florida,
  GA: georgia,
  HI: hawaii,
  ID: idaho,
  IL: illinois,
  IN: indiana,
  IA: iowa,
  KS: kansas,
  KY: kentucky,
  LA: louisiana,
  ME: maine,
  MD: maryland,
  MA: massachusetts,
  MI: michigan,
  MN: minnesota,
  MS: mississippi,
  MO: missouri,
  MT: montana,
  NE: nebraska,
  NV: nevada,
  NH: newHampshire,
  NJ: newJersey,
  NM: newMexico,
  NY: newYork,
  NC: northCarolina,
  ND: northDakota,
  OH: ohio,
  OK: oklahoma,
  OR: oregon,
  PA: pennsylvania,
  RI: rhodeIsland,
  SC: southCarolina,
  SD: southDakota,
  TN: tennessee,
  TX: texas,
  UT: utah,
  VT: vermont,
  VA: virginia,
  WA: washington,
  WV: westVirginia,
  WI: wisconsin,
  WY: wyoming,
};

/** Field labels and (i) help live in lib/state-data.ts with the rest of the
 * user-facing copy; overlay them onto the logic-only rule here. Throws at
 * module load (so the static build fails) if a state with an input has no
 * copy. */
function withFieldCopy(rule: StateRule): StateRule {
  const copy = STATE_DATA[rule.abbr]?.field;
  if (!copy) {
    if (rule.field.kind !== 'none') {
      throw new Error(`${rule.abbr}: lib/state-data.ts has no field copy for this state`);
    }
    return rule;
  }
  return {
    ...rule,
    field: {
      ...rule.field,
      label: copy.label,
      infoModal: copy.help,
      secondInputLabel: copy.secondInput?.label,
      secondInputInfoModal: copy.secondInput?.help,
      cashInput:
        rule.field.cashInput && copy.cashInput
          ? { ...rule.field.cashInput, label: copy.cashInput.label, infoModal: copy.cashInput.help }
          : rule.field.cashInput,
    },
  };
}

export const STATE_RULES: Record<string, StateRule> = Object.fromEntries(
  Object.entries(RULES).map(([abbr, rule]) => [abbr, withFieldCopy(rule)]),
);

// Master list of all 50 + DC.
export const STATES: ReadonlyArray<readonly [string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['DC', 'Washington D.C.'],
];

export function isSupported(abbr: string): boolean {
  return abbr in STATE_RULES;
}

/**
 * Initial value for the welcome screen's `hasCash` toggle, given the
 * currently-selected state. Most states default to false ("SNAP only");
 * NY uses the toggle for "Are you in NYC?" and pre-selects "Yes, NYC"
 * because NYC is far more populous than upstate.
 */
export function defaultHasCashFor(abbr: string | null): boolean {
  if (!abbr) return false;
  return STATE_RULES[abbr]?.cash?.defaultHasCash ?? false;
}
