import type { MetadataRoute } from 'next';
import { STATES } from '@/lib/state-rules';
import { SITE_URL } from '@/lib/site-url';

// Generates /sitemap.xml. Includes every canonical URL search engines should
// index: the homepage, all 51 state pages, and the static pages. `/embed/*`
// is intentionally omitted — those URLs are noindex (see app/embed page
// metadata) and aren't part of the SEO surface.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 1,
  };

  const statePages: MetadataRoute.Sitemap = STATES.map(([abbr]) => ({
    url: `${SITE_URL}/${abbr.toLowerCase()}`,
    lastModified: now,
    // SNAP issuance schedules change rarely; weekly polling by crawlers is
    // overkill, but "monthly" tells them we're maintained without
    // promising more than we deliver.
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/partner`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  return [homepage, ...statePages, ...staticPages];
}
