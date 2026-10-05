import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Everything under /embed stays out of search indexes: the widget URLs and
// the snippet builder are utility surfaces — the canonical pages (/, /xx,
// /partner) are the SEO surface. Deliberately NOT paired with a robots.txt
// disallow: a crawler must be able to fetch the page to see this noindex
// (blocked-but-linked URLs can still be indexed as bare URLs). Reinforced
// by an X-Robots-Tag header in public/_headers.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedRootLayout({ children }: { children: ReactNode }) {
  return children;
}
