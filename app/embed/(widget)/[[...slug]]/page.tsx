import type { Metadata } from 'next';
import { STATE_RULES, STATES } from '@/lib/state-rules';
import { EmbedApp } from '@/components/EmbedApp';

interface PageProps {
  params: { slug?: string[] };
}

function abbrFromSlug(slug: string[] | undefined): string | null {
  const candidate = slug?.[0]?.toUpperCase();
  return candidate && STATE_RULES[candidate] ? candidate : null;
}

// Prerender /embed and /embed/{abbr} for every state at build time so the
// static export covers every URL partners might paste into an iframe.
export function generateStaticParams() {
  return [
    { slug: [] }, // /embed
    ...STATES.map(([abbr]) => ({ slug: [abbr.toLowerCase()] })),
  ];
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: 'When is my EBT deposit? — embed',
  // Prevent search engines from indexing the embed URLs directly — the
  // canonical pages (/, /xx) are the SEO surface. Embeds shouldn't show
  // up in search results above the real pages.
  robots: { index: false, follow: false },
};

/**
 * /embed              → empty-state widget with picker
 * /embed/{abbr}       → widget pre-populated with that state
 *
 * Picker stays visible after a state is pre-selected so partners' users
 * can change states if they need to. Per-state info is rendered client-
 * side; this page is just the seed.
 */
export default function EmbedPage({ params }: PageProps) {
  const initialAbbr = abbrFromSlug(params.slug);
  return <EmbedApp initialAbbr={initialAbbr} />;
}
