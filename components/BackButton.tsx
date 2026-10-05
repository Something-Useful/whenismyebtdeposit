import { C, FONT } from '@/lib/tokens';

/** "← Back" from a result screen to the form. */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        padding: '12px 22px',
        borderRadius: 999,
        border: `1.5px solid ${C.line}`,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: FONT,
        color: C.ink,
        background: C.card,
      }}
    >
      ← Back
    </button>
  );
}
