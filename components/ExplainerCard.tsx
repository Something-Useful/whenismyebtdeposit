import { OPERATOR } from '@/lib/operator';
import { C, TRACK_EYEBROW } from '@/lib/tokens';
import { STATE_RULES } from '@/lib/state-rules';
import { STATE_DATA, explainerFor, scheduleSourceFor } from '@/lib/state-data';
import { ScheduleVerifiedRow } from './UpdatedPill';
import { linkifyText } from './Popover';

interface Props {
  stateAbbr: string;
  hasCash: boolean;
  variant?: 'mobile' | 'desktop';
  /** Start closed with a tappable heading (the embed, where height costs the
   * partner page space). */
  collapsible?: boolean;
}

/** "How {state} calculates this" card on every result screen. */
export function ExplainerCard({ stateAbbr, hasCash, variant = 'mobile', collapsible = false }: Props) {
  const rule = STATE_RULES[stateAbbr];
  if (!rule) return null;
  const isDesktop = variant === 'desktop';
  const fontSize = isDesktop ? 16 : 15;

  const cardStyle = {
    background: C.card,
    border: `1px solid ${C.line}`,
    borderRadius: isDesktop ? 16 : 14,
    padding: isDesktop ? '22px 26px' : '14px 16px',
  };
  const titleStyle = {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: TRACK_EYEBROW,
    color: C.inkMute,
    textTransform: 'uppercase' as const,
  };
  const title = `How ${rule.name} calculates this`;

  const body = (
    <>
      <p style={{ fontSize, color: C.inkSoft, lineHeight: isDesktop ? 1.55 : 1.5, margin: 0 }}>
        {linkifyText(explainerFor(stateAbbr, hasCash))}{' '}
        <a
          href={`mailto:${OPERATOR.contactEmail}?subject=${encodeURIComponent(
            `Report inaccurate info — ${rule.name}`,
          )}`}
          style={{ color: C.inkSoft, textDecoration: 'underline' }}
        >
          Report inaccurate info
        </a>
        .
      </p>
      <ScheduleVerifiedRow
        iso={STATE_DATA[stateAbbr].verified.date}
        source={scheduleSourceFor(stateAbbr)}
        fontSize={fontSize - 1}
      />
    </>
  );

  if (collapsible) {
    return (
      <details style={cardStyle}>
        <summary
          style={{
            ...titleStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            listStyle: 'none',
            userSelect: 'none',
          }}
        >
          <span>{title}</span>
          <svg
            className="caret"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transition: 'transform 0.18s ease' }}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke={C.inkMute}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div style={{ marginTop: 10 }}>{body}</div>
      </details>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ ...titleStyle, marginBottom: 10 }}>{title}</div>
      {body}
    </div>
  );
}
