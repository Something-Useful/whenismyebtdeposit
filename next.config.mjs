/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export is opt-in via NEXT_EXPORT=true so `next dev` stays a normal
  // dev server. The export path requires generateStaticParams on every
  // dynamic route and Next's dev mode is finicky about it with optional
  // catch-alls like [[...slug]]. `npm run build:static` flips the flag.
  ...(process.env.NEXT_EXPORT === 'true'
    ? {
        output: 'export',
        // Where the exported static site lands. NOTE: in export mode Next
        // still uses `.next` as its build WORKSPACE and deletes whatever a
        // running dev server compiled there ("Cannot find module
        // './vendor-chunks/next.js'", black screen). That's why dev runs
        // from `.next-dev` below — builds and dev can then coexist.
        distDir: '.next-export',
        // next/image optimization needs a Node server; disable for export.
        images: { unoptimized: true },
        // Emit /al/index.html instead of /al.html so static hosts serve
        // clean URLs without custom routing rules.
        trailingSlash: true,
      }
    : {
        // Keep the dev server's workspace out of `.next`, which
        // `npm run build:static` clobbers (see above).
        distDir: '.next-dev',
      }),
};

export default nextConfig;
