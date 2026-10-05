import Link from 'next/link';

export function AppLogo() {
  return (
    <Link
      href="/"
      aria-label="When is my EBT deposit — home"
      style={{
        display: 'inline-flex',
        width: 40,
        height: 40,
        borderRadius: 10,
        background: '#ffffff',
        border: '1px solid rgba(21,20,15,0.08)',
        boxShadow: '0 1px 2px rgba(21,20,15,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="15" rx="3" fill="#f4a96b" />
        <rect x="3" y="6" width="18" height="5" rx="3" fill="#1a1a1a" />
        <rect x="3" y="9" width="18" height="2" fill="#1a1a1a" />
        <rect x="7" y="3.5" width="2" height="4.5" rx="1" fill="#1a1a1a" />
        <rect x="15" y="3.5" width="2" height="4.5" rx="1" fill="#1a1a1a" />
        <circle cx="12" cy="16" r="3" fill="#77CB46" />
      </svg>
    </Link>
  );
}
