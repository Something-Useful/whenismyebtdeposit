import type { ReactNode } from 'react';

/**
 * Embed layout. Strips the global page background and sets `html`/`body`
 * to transparent so partners' surfaces show through behind the rounded
 * embed card. The DM Sans + Source Serif fonts are still loaded by the
 * root layout — this just nests inside it.
 */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Override the body background from globals.css with a scoped style.
          Using a global style here so we don't have to fight specificity on
          inline body styles. */}
      {/* globals.css backgrounds BOTH html and body — override both, or the
          iframe renders as an opaque paper rectangle on partner sites. */}
      <style>{`
        html, body { background: transparent !important; }
      `}</style>
      {/* GoatCounter config for /embed/*:
            1. `allow_frame` — count even when loaded in a cross-origin iframe
               (the whole point of this surface). Built-in `frame` filter
               otherwise blocks counts when location !== parent.location.
            2. `path` — encode the `?partner=<value>` query param as a
               trailing path segment on the recorded path. We use a path
               segment instead of a query string because GoatCounter's
               server-side strips unknown query parameters by default,
               which would erase our per-partner attribution. The actual
               browser URL keeps `?partner=...` (so EmbedApp can read it
               client-side and partners can copy/paste the snippet) — only
               the value sent to GoatCounter is rewritten.
               Recorded shape:
                 /embed/az/p/food-bank-nyc  (with partner)
                 /embed/az                  (without)
               The partner value is a plain org-name slug ([a-z0-9-]);
               anything outside that charset is stripped so malformed
               values can't pollute the dashboard. Org contact details
               live in our own records, keyed by this slug — never in
               the URL.
          This inline <script> runs at parse time, before the GoatCounter
          loader in app/layout.tsx fires, so the config is in place when
          count.js checks it. */}
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
          `,
        }}
      />
      <div
        data-embed-outer
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
      {/* Auto-resize: report the widget's rendered height to the parent page
          so an embedding site can size the iframe with a small script instead
          of a fixed height. The wrapper (not the viewport) is measured — it
          deliberately has no min-height, so its border-box tracks the card
          through welcome → result screen changes. The open state-picker
          listbox is absolutely positioned (doesn't grow the wrapper), so its
          extent is measured explicitly — otherwise a snug iframe would clip
          the dropdown. Message shape:
            { type: 'wimebt:embed-height', height: <px number> }
          posted with targetOrigin '*' (embed pages carry no user data). */}
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
                // Absolutely-positioned overlays (the state-picker listbox)
                // extend past the wrapper's border-box — include them.
                var lb = document.getElementById('state-picker-listbox');
                if (lb) {
                  var lr = lb.getBoundingClientRect();
                  if (lr.height > 0) h = Math.max(h, lr.bottom - r.top + 16);
                }
                h = Math.ceil(h);
                if (h === last) return;
                last = h;
                window.parent.postMessage({ type: 'wimebt:embed-height', height: h }, '*');
              };
              new ResizeObserver(post).observe(el);
              // The listbox mounts/unmounts without resizing the wrapper —
              // watch the DOM so opening/closing it re-measures.
              if (typeof MutationObserver !== 'undefined') {
                new MutationObserver(post).observe(el, { childList: true, subtree: true });
              }
              // Re-post on request: the parent's listener may attach after our
              // initial post (hydration race) — it asks, we answer. Without
              // this the iframe can stay stuck at its fallback height.
              window.addEventListener('message', function (e) {
                if (e && e.data && e.data.type === 'wimebt:embed-height:request') { last = 0; post(); }
              });
              post();
            })();
          `,
        }}
      />
    </>
  );
}
