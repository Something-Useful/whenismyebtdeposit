import type { ReactNode } from 'react';
import Link from 'next/link';
import { C, SERIF } from '@/lib/tokens';
import { AppLogo } from './AppLogo';
import { AppFooter } from './AppFooter';

interface Props {
  title: string;
  children: ReactNode;
}

function BackLink() {
  return (
    <Link
      href="/"
      style={{
        fontSize: 14,
        color: C.inkSoft,
        textDecoration: 'none',
        fontWeight: 500,
      }}
    >
      ← Back
    </Link>
  );
}

// Minimal layout for /privacy and /terms. Sage hero with logo + title, cream
// body with readable prose, "← Back" link at the bottom, shared footer.
export function StaticPage({ title, children }: Props) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: C.paper,
        color: C.ink,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ background: C.sage, padding: '40px 24px 28px' }}>
        <div className="static-page-column">
          <AppLogo />
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 28,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px 24px 24px' }}>
        <div
          className="static-page-column"
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: C.inkSoft,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <BackLink />
          </div>

          {children}

          <div style={{ marginTop: 40 }}>
            <BackLink />
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
