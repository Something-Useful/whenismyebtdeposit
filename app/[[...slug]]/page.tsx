import type { Metadata, ResolvingMetadata } from 'next';
import { STATE_RULES, STATES } from '@/lib/state-rules';
import { PageClient } from '@/components/PageClient';

interface PageProps {
  params: { slug?: string[] };
}

function abbrFromSlug(slug: string[] | undefined): string | null {
  const candidate = slug?.[0]?.toUpperCase();
  return candidate && STATE_RULES[candidate] ? candidate : null;
}

// Tell Next.js which slugs to prerender at build time. With `output: 'export'`
// (see next.config.mjs) every route must be statically generated; this list
// produces /, /al, /ak, … /wy. Anything else 404s at the CDN.
export function generateStaticParams() {
  return [
    { slug: [] }, // homepage
    ...STATES.map(([abbr]) => ({ slug: [abbr.toLowerCase()] })),
  ];
}

export const dynamicParams = false;

// Per-state SEO metadata. Each state's URL gets its own title, description,
// and canonical link so Google indexes 51 distinct pages instead of one.
//
// Note: Next.js does NOT merge `openGraph`/`twitter` blocks with the parent
// layout — providing one here replaces the parent's entire object. We
// inherit images from the parent explicitly via the `parent` argument so
// the auto-generated OG image at `app/opengraph-image.tsx` keeps applying.
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const abbr = abbrFromSlug(params.slug);

  if (!abbr) {
    // Homepage — defaults flow through from app/layout.tsx's metadata.
    return { alternates: { canonical: '/' } };
  }

  const rule = STATE_RULES[abbr];
  const stateName = rule.name;
  const title = `When is my ${stateName} EBT deposit?`;
  const description = `Find your next ${stateName} EBT deposit date. Pick the info your state uses (case number, SSN digit, last name letter — varies by state) and get a plain-English answer. Free, no signup, no tracking of your case info.`;

  const parentMeta = await parent;
  const ogImages = parentMeta.openGraph?.images ?? [];

  return {
    title,
    description,
    alternates: { canonical: `/${abbr.toLowerCase()}` },
    openGraph: {
      title,
      description,
      url: `/${abbr.toLowerCase()}`,
      siteName: 'When is my EBT deposit?',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((i) => {
        if (typeof i === 'string') return i;
        if (i instanceof URL) return i.toString();
        return typeof i.url === 'string' ? i.url : i.url.toString();
      }),
    },
  };
}

export default function Page({ params }: PageProps) {
  const initialAbbr = abbrFromSlug(params.slug);
  return <PageClient initialAbbr={initialAbbr} />;
}
