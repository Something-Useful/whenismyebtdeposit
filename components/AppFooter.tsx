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
    // Padding widens the tap target on mobile without moving the text.
    padding: isDesktop ? undefined : '6px 8px',
    display: isDesktop ? undefined : ('inline-block' as const),
  };
  // On mobile the links wrap (balanced, so 320px gets 3 + 2 rather than a
  // lone "GitHub"), and dot separators would dangle at line ends; padding
  // alone separates them there.
  const dot = isDesktop ? <span style={{ opacity: 0.4 }}>·</span> : null;
  return (
    <div
      style={{
        marginTop: isDesktop ? 'auto' : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isDesktop ? 6 : 10,
        padding: isDesktop ? '24px 32px 28px' : '24px 24px 32px',
        fontSize: isDesktop ? 12.5 : 14,
        lineHeight: 1.5,
        color: C.inkMute,
        borderTop: isDesktop ? `1px solid ${C.line}` : undefined,
      }}
    >
      <div
        style={
          isDesktop
            ? { display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }
            : { textAlign: 'center', textWrap: 'balance' }
        }
      >
        <a href="/privacy" style={linkStyle}>
          Privacy
        </a>
        {dot}
        <a href="/terms" style={linkStyle}>
          Terms
        </a>
        {dot}
        <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
          Contact
        </a>
        {dot}
        <a href="/partner" style={linkStyle}>
          Partner
        </a>
        {dot}
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
