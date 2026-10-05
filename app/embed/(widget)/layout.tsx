import type { ReactNode } from 'react';

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Transparent so the partner's page shows around the card; no
          reserved scrollbar gutter, since the iframe never scrolls. */}
      <style>{`
        html, body { background: transparent !important; }
        html { scrollbar-gutter: auto; }
      `}</style>
      {/* GoatCounter: count inside cross-origin iframes, record ?partner=<slug>
          as a /p/<slug> path segment (GoatCounter strips unknown query
          params), and report ?host=<domain> (set by embed.js) as the
          referrer, so the Referrers table breaks views out by hosting site.
          Must run before the loader in app/layout.tsx. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.goatcounter = window.goatcounter || {};
            window.goatcounter.allow_frame = true;
            window.goatcounter.path = function(p) {
              try {
                var pathOnly = (p || location.pathname).split('?')[0];
                var partner = (new URLSearchParams(location.search).get('partner') || '')
                  .toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
                return partner ? pathOnly + '/p/' + partner : pathOnly;
              } catch (e) { return p; }
            };
            window.goatcounter.referrer = function(r) {
              try {
                var host = (new URLSearchParams(location.search).get('host') || '')
                  .toLowerCase().replace(/[^a-z0-9.-]/g, '').slice(0, 253);
                return host ? 'https://' + host + '/' : r;
              } catch (e) { return r; }
            };
          `,
        }}
      />
      <div
        data-embed-outer
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '16px 0',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
      {/* Posts { type: 'ebtcalc:embed-height', height } to the parent, where
          public/embed.js sizes the iframe. Measures the wrapper, not the
          viewport, so the height can shrink as well as grow. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              if (window.parent === window) return;
              var el = document.querySelector('[data-embed-outer]');
              if (!el || typeof ResizeObserver === 'undefined') return;
              var last = 0;
              var post = function () {
                var r = el.getBoundingClientRect();
                var h = r.height;
                // Open dropdowns and popovers are absolutely positioned.
                var overlays = el.querySelectorAll('[role="listbox"], [role="dialog"]');
                for (var i = 0; i < overlays.length; i++) {
                  var lr = overlays[i].getBoundingClientRect();
                  if (lr.height > 0) h = Math.max(h, lr.bottom - r.top + 16);
                }
                h = Math.ceil(h);
                if (h === last) return;
                last = h;
                window.parent.postMessage({ type: 'ebtcalc:embed-height', height: h }, '*');
              };
              new ResizeObserver(post).observe(el);
              if (typeof MutationObserver !== 'undefined') {
                new MutationObserver(post).observe(el, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['style'],
                });
              }
              post();
            })();
          `,
        }}
      />
    </>
  );
}
