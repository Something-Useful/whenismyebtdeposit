import { ImageResponse } from 'next/og';

// Site-wide OG image for shared links. 1200x630 is the de facto OG size
// (Twitter, LinkedIn, iMessage, Slack, Discord all render at this aspect).
// Per-state pages inherit this image unless they ship their own.
export const alt = 'When is my EBT deposit?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand tokens duplicated inline since this runs in the Edge/Node OG runtime
// which can't import from arbitrary TS modules. Keep these in sync with
// lib/tokens.ts.
const SAGE = '#d6e8c9';
const INK = '#15140f';
const INK_MUTE = '#8a8676';
const LINE = 'rgba(21,20,15,0.10)';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: SAGE,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: logo mark */}
        <CalendarMark />

        {/* Middle: headline */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: INK,
            lineHeight: 1.02,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>When is my next</span>
          <span>EBT deposit?</span>
        </div>

        {/* Bottom: stylized state picker */}
        <StatePickerMark />
      </div>
    ),
    { ...size },
  );
}

// Same SVG as components/AppLogo.tsx, scaled up for the OG canvas.
function CalendarMark() {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        background: '#fff',
        borderRadius: 24,
        border: '1px solid rgba(21,20,15,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="66" height="66" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="15" rx="3" fill="#f4a96b" />
        <rect x="3" y="6" width="18" height="5" rx="3" fill="#1a1a1a" />
        <rect x="3" y="9" width="18" height="2" fill="#1a1a1a" />
        <rect x="7" y="3.5" width="2" height="4.5" rx="1" fill="#1a1a1a" />
        <rect x="15" y="3.5" width="2" height="4.5" rx="1" fill="#1a1a1a" />
        <circle cx="12" cy="16" r="3" fill="#77CB46" />
      </svg>
    </div>
  );
}

// Mirrors the resting state of components/StatePicker.tsx: white field,
// hairline border, location pin, placeholder text, chevron.
function StatePickerMark() {
  return (
    <div
      style={{
        width: 620,
        background: '#fff',
        borderRadius: 24,
        border: `2px solid ${LINE}`,
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z"
          stroke={INK}
          strokeWidth="1.8"
        />
        <circle cx="12" cy="9" r="2.5" stroke={INK} strokeWidth="1.8" />
      </svg>
      <div
        style={{
          flex: 1,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: INK_MUTE,
          display: 'flex',
        }}
      >
        Choose your state
      </div>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9l6 6 6-6"
          stroke={INK_MUTE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
