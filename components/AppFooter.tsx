import { C } from '@/lib/tokens';
import { OPERATOR } from '@/lib/operator';

export function AppFooter({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' }) {
  const isDesktop = variant === 'desktop';
  // Links sit a shade darker than the surrounding muted text and carry a
  // faint offset underline so they read as links without shouting.
  const linkStyle = {
    color: C.inkSoft,
    textDecoration: 'underline',
    textDecorationColor: 'rgba(21,20,15,0.25)',
    textUnderlineOffset: 3,
  };
  return (
    <div
      style={{
        marginTop: isDesktop ? 'auto' : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: isDesktop ? '24px 32px 28px' : '20px 24px 24px',
        fontSize: isDesktop ? 12.5 : 12,
        color: C.inkMute,
        borderTop: isDesktop ? `1px solid ${C.line}` : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isDesktop ? 22 : 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <a href="/privacy" style={linkStyle}>
          Privacy
        </a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="/terms" style={linkStyle}>
          Terms
        </a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
          Contact
        </a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="/partner" style={linkStyle}>
          Partner
        </a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="https://github.com/Something-Useful/whenismyebtdeposit" style={linkStyle}>
          GitHub
        </a>
      </div>
      <div style={{ textAlign: 'center' }}>
        Supported by the Gates Foundation and Propel&rsquo;s AI Residency
      </div>
      <div>© 2026 {OPERATOR.legalName}</div>
    </div>
  );
}
