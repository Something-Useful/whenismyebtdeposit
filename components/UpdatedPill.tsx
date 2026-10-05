import { C } from '@/lib/tokens';
import { formatUpdated } from '@/lib/format';

export function UpdatedPill({ iso }: { iso: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px 5px 8px',
        borderRadius: 999,
        background: '#fff',
        border: `1px solid ${C.line}`,
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: '0.01em',
        color: C.inkSoft,
        alignSelf: 'flex-start',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12l2 2 4-4"
          stroke="#3a7d3a"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9.5" stroke="#3a7d3a" strokeWidth="1.6" />
      </svg>
      Schedule last changed {formatUpdated(iso)}
    </div>
  );
}

/** Footer of the "How {state} calculates this" card on the result screens
 * (not the embed): a hairline rule, then "Verified {date}" on the left and
 * the report-mailto link on the right. */
/** Footer of the "How {state} calculates this" card: when the schedule was
 * last verified and against which source. */
export function ScheduleVerifiedRow({
  iso,
  source,
  fontSize = 13,
}: {
  iso: string;
  /** The schedule's canonical source, linked inline. */
  source?: { name: string; url: string };
  fontSize?: number;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px solid ${C.line}`,
        fontSize,
        lineHeight: 1.45,
        color: C.inkMute,
      }}
    >
      Verified {formatUpdated(iso)}
      {source && (
        <>
          {' '}from{' '}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: C.inkMute, textDecoration: 'underline' }}
          >
            {source.name}
          </a>
          .
        </>
      )}
    </div>
  );
}
