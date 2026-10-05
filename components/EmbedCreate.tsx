'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { STATES } from '@/lib/state-rules';
import { SITE_URL } from '@/lib/site-url';

// Snippet builder at /embed/create: org name + state → the <script> tag
// partners paste. The org slug becomes data-partner for usage counts.

/** "Food Bank NYC" → "food-bank-nyc" (mirrors embed.js's charset). */
function slugifyPartner(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSnippet(abbr: string | null, slug: string): string {
  const attrs = [
    `src="${SITE_URL}/embed.js"`,
    ...(abbr ? [`data-state="${abbr}"`] : []),
    ...(slug ? [`data-partner="${slug}"`] : []),
    'async',
  ];
  return `<script ${attrs.join(' ')}></script>`;
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
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
  const slug = useMemo(() => slugifyPartner(orgName), [orgName]);
  const snippet = useMemo(() => buildSnippet(abbr, slug), [abbr, slug]);

  // Runs the real loader. Inserted by hand because scripts inside
  // dangerouslySetInnerHTML never execute.
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = previewRef.current;
    if (!box) return;
    box.innerHTML = '';
    const s = document.createElement('script');
    s.src = '/embed.js';
    if (abbr) s.setAttribute('data-state', abbr);
    if (slug) s.setAttribute('data-partner', slug);
    s.async = true;
    box.appendChild(s);
    return () => {
      box.innerHTML = '';
    };
  }, [abbr, slug]);

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
        <div style={{ fontSize: 14, color: C.inkMute, marginTop: 8, lineHeight: 1.5 }}>
          Included in the embed code so your organization&rsquo;s usage shows
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
        <div style={labelStyle}>Your embed code</div>
        <textarea
          readOnly
          value={snippet}
          rows={3}
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
        <div style={{ fontSize: 14, color: C.inkMute, marginTop: 12, lineHeight: 1.5 }}>
          Paste it where the calculator should appear. If your site moves
          scripts elsewhere (for example, Google Tag Manager), also add{' '}
          <code>&lt;div data-ebtcalc&gt;&lt;/div&gt;</code> where the calculator
          should go.
        </div>
      </div>

      <div>
        <div style={labelStyle}>Preview</div>
        <style dangerouslySetInnerHTML={{ __html: '.embed-preview > div { margin: 0 auto; }' }} />
        <div
          ref={previewRef}
          className="embed-preview"
          style={{
            border: '1px dashed rgba(21,20,15,0.18)',
            borderRadius: 16,
            padding: 20,
          }}
        />
      </div>
    </div>
  );
}
