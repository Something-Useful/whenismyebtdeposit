import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // `/embed/*` is deliberately NOT disallowed here even though we keep
        // it out of the index: crawlers must be able to fetch those pages to
        // see their noindex (meta robots in app/embed/layout.tsx plus an
        // X-Robots-Tag header in public/_headers). A robots.txt block would
        // hide the noindex, and blocked-but-referenced URLs can still get
        // indexed as bare URLs.
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
