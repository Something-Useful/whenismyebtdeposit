// Single source of truth for the site's canonical URL. Drives:
//   - metadataBase + OG/Twitter card URLs (app/layout.tsx)
//   - sitemap.xml entries (app/sitemap.ts)
//   - robots.txt sitemap pointer (app/robots.ts)
//   - the iframe `src` shown in copy-paste embed snippets (PartnersBuilder)
//
// Defaults to the production domain. Override at build time by exporting
// NEXT_PUBLIC_SITE_URL — e.g., for a Netlify preview where the URL is
// `*.netlify.app` instead of the canonical .org. The `NEXT_PUBLIC_` prefix
// is required so Next.js inlines the value into the client bundle.
//
// Don't include a trailing slash; callers append paths directly.
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whenismyebtdeposit.org';
