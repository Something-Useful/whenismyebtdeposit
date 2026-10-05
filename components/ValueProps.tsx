import { C, SERIF } from '@/lib/tokens';

export function ValueProps({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' } = {}) {
  const isDesktop = variant === 'desktop';
  const items = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z"
            stroke={C.ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke={C.ink}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: 'Private',
      body: "We don't store or share any of your info.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"
            stroke={C.ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.5" stroke={C.ink} strokeWidth="1.7" />
        </svg>
      ),
      title: 'Every state',
      body: 'Deposit schedules for all 50 states.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 3L5 13.5h5.5L11 21l8-10.5h-5.5L13 3z"
            stroke={C.ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: 'Free & instant',
      body: 'No sign-up, no download, takes 1-min.',
    },
  ];

  return (
    <div
      style={
        isDesktop
          ? { display: 'flex', gap: 32, marginTop: 24, padding: '0 8px' }
          : { display: 'flex', flexDirection: 'column', gap: 22, marginTop: 36 }
      }
    >
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: isDesktop ? 1 : undefined }}>
          <div
            style={{
              width: isDesktop ? 36 : 40,
              height: isDesktop ? 36 : 40,
              borderRadius: isDesktop ? 10 : 12,
              flexShrink: 0,
              background: '#fff',
              border: `1px solid ${C.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {it.icon}
          </div>
          <div style={{ paddingTop: 2 }}>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: isDesktop ? 16 : 18,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                color: C.ink,
              }}
            >
              {it.title}
            </div>
            <div style={{ fontSize: isDesktop ? 13 : 13.5, color: C.inkSoft, lineHeight: isDesktop ? 1.35 : 1.4, marginTop: 2 }}>
              {it.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
