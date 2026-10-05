'use client';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { C, FONT, TRACK_EYEBROW } from '@/lib/tokens';
import { OPERATOR } from '@/lib/operator';
import { PillButton } from './PillButton';

// Where form submissions go. Point this at a form-backend endpoint (e.g. a
// Formspree form URL: https://formspree.io/f/XXXXXXXX) and submissions are
// emailed to the operator with zero server code — this site is a static
// export, so there is no API route to receive them. While unset, the form
// falls back to opening a prefilled email in the visitor's mail client so
// no inquiry is ever silently dropped.
const FORM_ENDPOINT = 'https://formspree.io/f/meebvbrn';

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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function PartnersContact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [states, setStates] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    setError(null);

    if (FORM_ENDPOINT) {
      try {
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          // `site` disambiguates in the shared Formspree inbox (the same
          // form also receives Child Support Calculator submissions).
          body: JSON.stringify({
            site: 'whenismyebtdeposit.org',
            page: '/partner',
            name,
            email,
            org,
            states,
          }),
        });
      } catch {
        // Fall through to the thanks state either way — the mailto line
        // below the form remains as the manual fallback.
      }
    } else {
      // No form backend configured yet: hand off via the visitor's own mail
      // client with everything prefilled, so the inquiry still reaches us.
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Organization: ${org || '—'}`,
        `States we operate in: ${states || '—'}`,
      ].join('\n');
      window.location.href = `mailto:${OPERATOR.contactEmail}?subject=${encodeURIComponent(
        `Partner inquiry — ${org || name}`,
      )}&body=${encodeURIComponent(body)}`;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          background: '#fff',
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          padding: '28px 26px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M9 12l2 2 4-4" stroke="#3a7d3a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9.5" stroke="#3a7d3a" strokeWidth="1.6" />
        </svg>
        <div>
          <div style={{ fontWeight: 600, color: C.ink, marginBottom: 4 }}>Thanks!</div>
          <div>We&rsquo;ll be in touch in a few business days.</div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: '24px 26px',
      }}
    >
      <Field label="Name *">
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label="Email *">
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>
      <Field label="Organization name">
        <input
          style={inputStyle}
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          autoComplete="organization"
        />
      </Field>
      <Field label="States you operate in">
        <input
          style={inputStyle}
          value={states}
          onChange={(e) => setStates(e.target.value)}
          placeholder="e.g. California and Nevada, or nationwide"
        />
      </Field>
      {error && (
        <div style={{ color: '#b3261e', fontSize: 13.5, margin: '0 0 12px' }}>{error}</div>
      )}
      <PillButton type="submit" style={{ width: '100%', boxSizing: 'border-box' }}>
        Submit
      </PillButton>
    </form>
  );
}
