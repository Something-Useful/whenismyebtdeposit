// Per-state embed iframe heights, measured empirically by loading
// /embed/{state} in an iframe, filling each state's form with valid
// sample input (and toggling cash=Yes where applicable), submitting,
// and taking max(welcomeHeight, welcomeWithFormHeight, resultHeight)
// of the widget shell. The values below are that measurement + 32px
// iframe padding (16px top + 16px bottom from app/embed/layout.tsx)
// + ~8px breathing room, rounded to the nearest 10.
//
// Buckets that emerged from the measurement pass:
//   • 410 — no-cash states (single-input or no-input). Most states.
//   • 430 — OR (no-cash but has an "I don't have an SSN" secondary action).
//   • 490 — NY (NYC/upstate toggle adds welcome-screen height). Welcome-
//           constrained — taller than the result.
//   • 570 — CA. CalWORKs cash now renders as its own row ("Between the 1st
//           and 3rd") instead of living only in the "every month" copy, so
//           the result is the constraint here, not the welcome screen.
//   • 520 — MO (birthMonthAndLetter — two stacked inputs on welcome).
//           Welcome-constrained.
//   • 500 — WA (no input but result is text card "1st–20th" with explainer).
//   • 580 — TX. The TANF toggle reveals a second EDG input, so the welcome
//           screen with both inputs showing is the constraint (554 shell),
//           calibrated against FL's 495 → 520.
//   • 520 — states whose cash prompt produces a two-deposit result (CO, CT,
//           FL, IN, KS, MI, WV). These were 580 when SNAP, cash, and "every
//           month" each had their own card; they now share one card, which
//           drops three borders and two inter-card gaps.
//
// Re-run the measurement when state rules change or when the result-page
// layout changes significantly.
export const EMBED_HEIGHTS: Record<string, number> = {
  AL: 410,
  AK: 410,
  AZ: 410,
  AR: 410,
  CA: 570,
  CO: 520,
  CT: 520,
  DE: 410,
  DC: 410,
  FL: 520,
  GA: 410,
  HI: 410,
  ID: 410,
  IL: 410,
  IN: 520,
  IA: 410,
  KS: 520,
  KY: 410,
  LA: 410,
  ME: 410,
  MD: 410,
  MA: 410,
  MI: 520,
  MN: 410,
  MS: 410,
  MO: 520,
  MT: 410,
  NE: 410,
  NV: 410,
  NH: 410,
  NJ: 410,
  NM: 410,
  NY: 490,
  NC: 410,
  ND: 410,
  OH: 410,
  OK: 410,
  OR: 430,
  PA: 410,
  RI: 410,
  SC: 410,
  SD: 410,
  TN: 410,
  TX: 580,
  UT: 410,
  VT: 410,
  VA: 410,
  WA: 500,
  WV: 520,
  WI: 410,
  WY: 410,
};

// Height for `/embed` with no state pre-selected — needs to fit any state
// the user might pick. Set to the max of every state's height.
export const EMBED_HEIGHT_NO_STATE = Math.max(...Object.values(EMBED_HEIGHTS));

/**
 * Returns the recommended iframe height for embedding a given state, or for
 * the generic picker-only embed when `abbr` is null. Falls back to the
 * largest height if a state slug is unknown (defensive — keeps partner
 * snippets safe even if our embed-heights table drifts from STATE_RULES).
 */
export function embedHeightFor(abbr: string | null): number {
  if (!abbr) return EMBED_HEIGHT_NO_STATE;
  return EMBED_HEIGHTS[abbr.toUpperCase()] ?? EMBED_HEIGHT_NO_STATE;
}
