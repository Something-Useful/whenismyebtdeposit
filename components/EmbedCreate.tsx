'use client';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { STATES } from '@/lib/state-rules';
import { embedHeightFor } from '@/lib/embed-heights';
import { SITE_URL } from '@/lib/site-url';

// Snippet builder at /embed/create: org name + state → copy-paste iframe
// snippet. The org slug rides the URL as `?partner=` for per-partner
// analytics (org contact info lives in our own records, never the URL).

/** "Food Bank NYC" → "food-bank-nyc" (mirrors the embed layout's charset). */
function slugifyPartner(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// "Powered by" phrasings for the attribution line. The default is picked at
// random per visit so the backlink anchor text varies across partner sites
// instead of being one sitewide footprint, and the visitor can choose their
// favorite. Branded/descriptive anchors only — no keyword stuffing. The
// anchor text is the part in <a>…</a>; `label` is the plain-text preview
// shown in the dropdown.
// Each phrase anchors a different real search phrase ("EBT deposit date",
// "food stamp deposit schedule", "SNAP deposit dates"…) so backlinks across
// partner sites cover distinct queries instead of repeating one anchor.
const POWERED_BY: Array<{
  label: string;
  html: (href: string, a: string) => string;
}> = [
  {
    label: 'Powered by When is my EBT deposit?',
    html: (href, a) => `Powered by <a href="${href}"${a}>When is my EBT deposit?</a>`,
  },
  {
    label: 'Check your EBT deposit date',
    html: (href, a) => `<a href="${href}"${a}>Check your EBT deposit date</a>`,
  },
  {
    label: 'Free EBT deposit calculator',
    html: (href, a) => `Free <a href="${href}"${a}>EBT deposit calculator</a>`,
  },
  {
    label: 'See your food stamp deposit schedule',
    html: (href, a) => `See your <a href="${href}"${a}>food stamp deposit schedule</a>`,
  },
  {
    label: 'SNAP deposit dates for every state',
    html: (href, a) => `<a href="${href}"${a}>SNAP deposit dates</a> for every state`,
  },
];

// Where the attribution sits for the national embed: absolutely positioned
// INSIDE the widget card (over the iframe), so it reads as part of the
// card. `?credit=1` makes the widget reserve a 30px strip below the
// combobox on the initial screen (combobox bottom ≈124px, card bottom
// ≈179px); the line centers in that band. When the widget grows past its
// snug height (open dropdown, fields, the result), the snippet's resize
// script hides the line so it never overlaps widget content.
const LINK_TOP = 146;
const LINK_LEFT = 40;

// The resize listener shipped inside the snippet: the widget posts
// { type: 'wimebt:embed-height', height } whenever its content resizes
// (see app/embed/(widget)/layout.tsx), and this keeps the iframe exactly
// that tall. If a CMS strips <script> tags, the iframe's fixed height
// attribute (measured per state) still applies — graceful degradation.
const RESIZE_SCRIPT = `<script>
  (function () {
    window.addEventListener("message", function (e) {
      if (!e.data || e.data.type !== "wimebt:embed-height") return;
      var fs = document.querySelectorAll("iframe[data-wimebt]");
      for (var i = 0; i < fs.length; i++) {
        if (fs[i].contentWindow !== e.source) continue;
        var h = Math.max(180, Math.min(e.data.height, 1200));
        fs[i].style.height = h + "px";
        // The credit line sits inside the widget card's bottom padding.
        // Hide it while the widget is expanded (open dropdown, inputs,
        // result) so it never overlaps widget content.
        var p = fs[i].parentNode.querySelector("[data-wimebt-attrib]");
        if (p) {
          var b = parseInt(p.getAttribute("data-base") || "0", 10);
          if (!b || h < b) { b = h; p.setAttribute("data-base", String(b)); }
          p.style.visibility = h > b + 24 ? "hidden" : "visible";
        }
      }
    });
    var ask = function () {
      var fs = document.querySelectorAll("iframe[data-wimebt]");
      for (var i = 0; i < fs.length; i++)
        try { fs[i].contentWindow.postMessage({ type: "wimebt:embed-height:request" }, "*"); } catch (e) {}
    };
    window.addEventListener("load", ask);
    ask();
  })();
</script>`;

function buildSnippet(opts: {
  origin: string;
  abbr: string | null;
  slug: string;
  phraseIdx: number;
}): string {
  const { origin, abbr, slug, phraseIdx } = opts;
  const params = [
    ...(slug ? [`partner=${slug}`] : []),
    // National embed only: ask the widget to reserve the credit-line strip.
    ...(abbr ? [] : ['credit=1']),
  ];
  const src = `${origin}/embed${abbr ? `/${abbr.toLowerCase()}` : ''}${
    params.length ? `?${params.join('&')}` : ''
  }`;
  const href = abbr ? `${origin}/${abbr.toLowerCase()}` : origin || '/';
  const height = embedHeightFor(abbr);
  // Credit-line type matches the app's UpdatedPill idiom: 11.5px, weight
  // 500, +0.01em tracking, soft ink on the sage card. DM Sans first for
  // hosts that have it; the system stack is a close fallback.
  const creditFont =
    "font:500 11.5px/1.5 'DM Sans',-apple-system,system-ui,sans-serif;letter-spacing:0.01em";
  const linkAttr =
    ' style="color:#5a574c;text-decoration:underline;text-underline-offset:2px"';
  const phrase = POWERED_BY[phraseIdx % POWERED_BY.length].html(href, linkAttr);
  const pStyle = abbr
    ? // State embed: the welcome card is full of fields whose bottom edge
      // varies by state, so the attribution flows below the iframe where it
      // hugs the card once the resize script has snugged the height.
      `margin:8px 0 0 ${LINK_LEFT}px;${creditFont};color:#8a8676`
    : // National embed: layered INSIDE the widget card's reserved strip
      // (above the iframe). The resize script hides it while the widget is
      // expanded so it never sits on top of widget content.
      `position:absolute;top:${LINK_TOP}px;left:${LINK_LEFT}px;z-index:2;margin:0;${creditFont};color:#8a8676`;
  return `<div style="position:relative;max-width:472px">
  <iframe
    data-wimebt
    src="${src}"
    width="100%"
    height="${height}"
    style="border:0;display:block;position:relative;z-index:1"
    title="When is my next EBT deposit?"
    loading="lazy"
  ></iframe>
  <p${abbr ? '' : ' data-wimebt-attrib'} style="${pStyle}">${phrase}</p>
</div>
${RESIZE_SCRIPT}`;
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: TRACK_EYEBROW,
  color: C.inkMute,
  textTransform: 'uppercase',
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: '12px 14px',
  fontFamily: FONT,
  fontSize: 15,
  color: C.ink,
  outline: 'none',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      style={{
        fontFamily: FONT,
        fontSize: 14,
        fontWeight: 600,
        padding: '10px 18px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: copied ? '#3a7d3a' : C.ink,
        color: '#fff',
      }}
    >
      {copied ? 'Copied!' : 'Copy snippet'}
    </button>
  );
}

export function EmbedCreate() {
  const [orgName, setOrgName] = useState('');
  const [abbr, setAbbr] = useState<string | null>(null);
  // Starts on a random phrasing per visit (varies the anchor text across
  // partners); the dropdown below lets the visitor pick a different one.
  const [phraseIdx, setPhraseIdx] = useState(() =>
    Math.floor(Math.random() * POWERED_BY.length),
  );

  const slug = useMemo(() => slugifyPartner(orgName), [orgName]);
  const snippet = useMemo(
    () => buildSnippet({ origin: SITE_URL, abbr, slug, phraseIdx }),
    [abbr, slug, phraseIdx],
  );
  // Preview renders the same markup with a same-origin src so it works in
  // dev and on preview deploys.
  const previewHtml = useMemo(
    () => buildSnippet({ origin: '', abbr, slug, phraseIdx }),
    [abbr, slug, phraseIdx],
  );

  // Scripts inside dangerouslySetInnerHTML never execute, so run the
  // snippet's resize logic here — the preview behaves exactly like the
  // pasted snippet will.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string; height?: number } | null;
      if (data?.type !== 'wimebt:embed-height' || typeof data.height !== 'number') return;
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-wimebt]').forEach((f) => {
        if (f.contentWindow !== e.source) return;
        const h = Math.max(180, Math.min(data.height!, 1200));
        f.style.height = `${h}px`;
        const p = f.parentElement?.querySelector<HTMLElement>('[data-wimebt-attrib]');
        if (p) {
          let base = parseInt(p.getAttribute('data-base') || '0', 10);
          if (!base || h < base) {
            base = h;
            p.setAttribute('data-base', String(base));
          }
          p.style.visibility = h > base + 24 ? 'hidden' : 'visible';
        }
      });
    };
    window.addEventListener('message', onMessage);
    const ask = () =>
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-wimebt]').forEach((f) => {
        f.contentWindow?.postMessage({ type: 'wimebt:embed-height:request' }, '*');
      });
    ask();
    const t = setInterval(ask, 800);
    return () => {
      window.removeEventListener('message', onMessage);
      clearInterval(t);
    };
  }, [previewHtml]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <label htmlFor="embed-create-org" style={labelStyle}>
          Organization name
        </label>
        <input
          id="embed-create-org"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Food Bank NYC"
          autoComplete="organization"
          style={inputStyle}
        />
        <div style={{ fontSize: 13, color: C.inkMute, marginTop: 8, lineHeight: 1.5 }}>
          Included in the embed URL so your organization&rsquo;s usage shows
          up in analytics.
        </div>
      </div>

      <div>
        <label htmlFor="embed-create-state" style={labelStyle}>
          What state do you serve?
        </label>
        <select
          id="embed-create-state"
          value={abbr ?? ''}
          onChange={(e) => setAbbr(e.target.value || null)}
          style={{ ...inputStyle, appearance: 'auto' as const }}
        >
          <option value="">National — all states</option>
          {STATES.map(([a, name]) => (
            <option key={a} value={a}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="embed-create-phrase" style={labelStyle}>
          Powered by
        </label>
        <select
          id="embed-create-phrase"
          value={phraseIdx}
          onChange={(e) => setPhraseIdx(Number(e.target.value))}
          style={{ ...inputStyle, appearance: 'auto' as const }}
        >
          {POWERED_BY.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </select>
        <div style={{ fontSize: 13, color: C.inkMute, marginTop: 8, lineHeight: 1.5 }}>
          The small credit line under the calculator — pick whichever reads
          best on your site.
        </div>
      </div>

      <div>
        <div style={labelStyle}>Your embed code</div>
        <textarea
          readOnly
          value={snippet}
          rows={13}
          spellCheck={false}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            ...inputStyle,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12.5,
            lineHeight: 1.5,
            resize: 'vertical',
          }}
        />
        <div style={{ marginTop: 10 }}>
          <CopyButton text={snippet} />
        </div>
      </div>

      <div>
        <div style={labelStyle}>Preview</div>
        <div
          style={{
            border: '1px dashed rgba(21,20,15,0.18)',
            borderRadius: 16,
            padding: 20,
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}
