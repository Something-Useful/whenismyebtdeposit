'use client';
import { C } from '@/lib/tokens';

interface Props {
  onBack?: () => void;
  step?: number;
  totalSteps?: number;
}

export function AppTopBar({ onBack, step, totalSteps }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0 4px',
        height: 44,
      }}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            all: 'unset',
            cursor: 'pointer',
            width: 36,
            height: 36,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(21,20,15,0.06)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke={C.ink}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
      {step != null && totalSteps != null ? (
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= step ? C.ink : 'rgba(21,20,15,0.18)',
                transition: 'width .2s',
              }}
            />
          ))}
        </div>
      ) : (
        <div />
      )}
      <div style={{ width: 36 }} />
    </div>
  );
}
