import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { OPERATOR } from '@/lib/operator';
import { C, SERIF } from '@/lib/tokens';
import { StaticPage } from '@/components/StaticPage';
import { EmbedApp } from '@/components/EmbedApp';
import { PartnersContact } from '@/components/PartnersContact';
import { PartnersHowItWorks } from '@/components/PartnersHowItWorks';

export const metadata: Metadata = {
  title: 'For states and non-profits',
  description:
    'State agencies, food banks, and benefits-counseling organizations can add a free EBT deposit calculator to their website. Get in touch to set it up.',
};

const sectionStyle = { marginTop: 40 };
const sectionHeadingStyle = {
  fontSize: 22,
  fontWeight: 600 as const,
  color: '#15140f',
  margin: '0 0 12px',
  lineHeight: 1.3,
};

// Same visual pattern as the homepage value props (ValueProps.tsx): stroke
// icon in a white rounded tile, serif title, soft body copy.
const stroke = { stroke: C.ink, strokeWidth: 1.7, fill: 'none' as const };
const VALUE_PROPS: Array<{ icon: ReactNode; title: string; body: string }> = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M8.5 8L4 12l4.5 4M15.5 8l4.5 4-4.5 4" {...stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Embeddable EBT deposit calculator',
    body: 'Place a deposit-date calculator for your state directly on your website as an iframe embeddable calculator.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M20 5v5h-5" {...stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 19v-5h5" {...stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.6 9a7 7 0 0113.2 1M18.4 15a7 7 0 01-13.2-1" {...stroke} strokeLinecap="round" />
      </svg>
    ),
    title: 'Automatically updated',
    body: "As EBT deposit schedules change, the calculator updates itself. You won't need to edit any of the code on your website.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M5 20V14M12 20V6M19 20v-9" {...stroke} strokeLinecap="round" />
      </svg>
    ),
    title: 'Analytics',
    body: 'See how many of your users used the calculator.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z" {...stroke} strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" {...stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Private',
    body: "We don't store or share any of your users' personal information.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M13 3L5 13.5h5.5L11 21l8-10.5h-5.5L13 3z" {...stroke} strokeLinejoin="round" />
      </svg>
    ),
    title: 'Quick to set up',
    body: 'No coding required.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          d="M12 20.5C7.5 16.5 4 13.3 4 9.9A4.4 4.4 0 0112 7a4.4 4.4 0 018 2.9c0 3.4-3.5 6.6-8 10.6z"
          {...stroke}
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: '100% free',
    body: 'Free for public agencies and non-profit organizations.',
  },
];

export default function PartnersPage() {
  return (
    <StaticPage title="For states and non-profits">
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>
          Add an EBT deposit calculator to your website
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: 16.5, lineHeight: 1.55 }}>
          Help your users understand their EBT deposit schedules by adding a free calculator to your site, like this:
        </p>
        {/* The live national calculator — rendered directly (this is our own
            site; the iframe machinery is for partner pages). Dashed frame
            matches the How-it-works demo below. */}
        <div
          style={{
            border: '1px dashed rgba(21,20,15,0.18)',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <EmbedApp initialAbbr={null} />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Contact us</h2>
        <p style={{ margin: '0 0 22px', fontSize: 16.5, lineHeight: 1.55 }}>
          Reach out and we'll set you up with a free, personalized calculator.
        </p>
        <PartnersContact />
        <p style={{ fontSize: 13.5, color: '#8a8676', margin: '10px 0 0' }}>
          Or email us at{' '}
          <a
            href={`mailto:${OPERATOR.contactEmail}?subject=Partner%20inquiry`}
            style={{ color: '#5a574c', textDecoration: 'underline' }}
          >
            {OPERATOR.contactEmail}
          </a>
          .
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ ...sectionHeadingStyle, marginBottom: 18 }}>Features</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '22px 24px',
          }}
        >
          {VALUE_PROPS.map((vp) => (
            <div key={vp.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: '#fff',
                  border: `1px solid ${C.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {vp.icon}
              </div>
              <div style={{ paddingTop: 2 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: C.ink,
                  }}
                >
                  {vp.title}
                </div>
                <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.45, marginTop: 3 }}>
                  {vp.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ ...sectionHeadingStyle, marginBottom: 18 }}>
          How it works
        </h2>
        <PartnersHowItWorks />
      </section>
    </StaticPage>
  );
}
