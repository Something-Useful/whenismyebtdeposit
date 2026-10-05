export const C = {
  paper: '#f8f5ee',
  ink: '#15140f',
  inkSoft: '#5a574c',
  inkMute: '#8a8676',
  sage: '#d6e8c9',
  sageDeep: '#b6cfa3',
  line: 'rgba(21,20,15,0.10)',
  card: '#ffffff',
  saffron: '#e8c069',
  saffronTint: '#fbeec9',
} as const;

export const FONT = `var(--font-dm-sans), -apple-system, system-ui, sans-serif`;
export const SERIF = `var(--font-source-serif), 'Source Serif 4', Georgia, serif`;

/** Tracking for the small uppercase "eyebrow" labels (section headers, field
 * labels, card labels). Uppercase needs some tracking to breathe, but the
 * longer labels get hard to read when it's too loose. */
export const TRACK_EYEBROW = '0.03em';

/** Screen-level eyebrow ("YOUR NEXT EBT DEPOSIT IS"). */
export const EYEBROW = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: TRACK_EYEBROW,
  color: C.inkSoft,
  textTransform: 'uppercase',
} as const;
