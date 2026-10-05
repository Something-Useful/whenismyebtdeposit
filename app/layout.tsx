import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { DM_Sans, Source_Serif_4 } from 'next/font/google';
import { SITE_URL } from '@/lib/site-url';
import { DevClickToComponent } from '@/components/DevClickToComponent';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  // Used by Next.js to resolve relative OG image / canonical URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'When is my EBT deposit?',
    // State pages override `title` directly; this template applies if any
    // child route sets a string title without using the {default, template}
    // shape. Kept short so the suffix doesn't bloat in social previews.
    template: '%s — whenismyebtdeposit.org',
  },
  description:
    'Find your next EBT deposit date. Pick your state, enter the info your state uses, and get a plain-English answer. Free, no signup, no tracking of your case info.',
  applicationName: 'When is my EBT deposit?',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'When is my EBT deposit?',
    title: 'When is my EBT deposit?',
    description:
      'Find your next EBT deposit date. Pick your state, get a plain-English answer.',
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'When is my EBT deposit?',
    description:
      'Find your next EBT deposit date. Pick your state, get a plain-English answer.',
  },
  // Keep the result-screen embed URLs out of Google. The canonical site
  // pages are the SEO surface — `/embed/*` is set noindex in its own
  // metadata, this is belt-and-braces via robots.ts.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Stub `window.__firefox__.reader` so Firefox iOS's reader-mode user script
// doesn't throw when it injects on top of our page. Their script assumes
// the object exists; on Firefox iOS / various WebViews it sometimes doesn't.
const firefoxReaderShim = `
(function(){
  try {
    var w = window;
    w.__firefox__ = w.__firefox__ || {};
    if (!w.__firefox__.reader) {
      w.__firefox__.reader = {
        checkReadability: function(){},
        parseDocument: function(){},
        readerize: function(){}
      };
    }
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: firefoxReaderShim }} />
      </head>
      <body>
        {/* Dev-only click-to-source: Option/Alt+click any element to open
            its component source in the editor. No-ops entirely in
            production builds. */}
        <DevClickToComponent />
        {children}
        {/* GoatCounter — privacy-friendly, cookie-free page view counts.
            Only rendered when NEXT_PUBLIC_GOATCOUNTER_URL is set at build
            time (see .env.example); with it unset — the default for a fresh
            clone — the site ships no analytics at all. Loads on every route
            (canonical pages + /embed/* + /partner). Localhost is auto-blocked
            by GoatCounter's built-in filter, so dev traffic never reaches the
            dashboard. See app/privacy/page.tsx and app/partner/page.tsx for
            the user-facing disclosures of what this collects. */}
        {process.env.NEXT_PUBLIC_GOATCOUNTER_URL && (
          <Script
            src="https://gc.zgo.at/count.js"
            data-goatcounter={process.env.NEXT_PUBLIC_GOATCOUNTER_URL}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
