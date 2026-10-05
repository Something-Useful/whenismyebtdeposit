import type { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';
import { OPERATOR } from '@/lib/operator';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `This Privacy Policy describes how ${OPERATOR.legalName} handles information through whenismyebtdeposit.org. Aside from anonymous page-view counts, we collect no information about you.`,
};

const sectionStyle = { marginTop: 32 };
const headingStyle = {
  fontSize: 18,
  fontWeight: 600 as const,
  color: '#15140f',
  marginTop: 0,
  marginBottom: 10,
};
const paraStyle = { margin: '0 0 12px', lineHeight: 1.6 };
const lastParaStyle = { margin: 0, lineHeight: 1.6 };
const linkStyle = { color: '#5a574c', textDecoration: 'underline' };
const lastUpdatedStyle = {
  fontSize: 13,
  color: '#8a8676',
  margin: '0 0 24px',
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy">
      <p style={lastUpdatedStyle}>Last updated: May 21, 2026</p>

      <p style={paraStyle}>
        This Privacy Policy applies to the instance of this open-source
        software operated by {OPERATOR.legalName} at whenismyebtdeposit.org.
        If you are using a copy of this software hosted by someone else, that
        operator&rsquo;s privacy policy governs — not this one.
      </p>

      <p style={paraStyle}>
        This Privacy Policy outlines how {OPERATOR.legalName}
        (&ldquo;{OPERATOR.shortName},&rdquo; the &ldquo;Company,&rdquo;
        &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) handles
        information collected through our website,{' '}
        <a href="https://whenismyebtdeposit.org" style={linkStyle}>
          whenismyebtdeposit.org
        </a>{' '}
        (the &ldquo;Website&rdquo;), and through our other online services
        (collectively, the &ldquo;Services&rdquo;), and when you otherwise
        interact with us, such as by emailing us. This Privacy Policy is
        hereby incorporated by reference into our{' '}
        <a href="/terms" style={linkStyle}>
          Terms of Use
        </a>
        . By accessing or using any part of the Services, you agree that you
        have read, understood, and agree to be bound by this Privacy Policy.
        If you do not agree to any of the provisions as set forth in this
        Privacy Policy, you have no right to use the Services.
      </p>

      <p style={{ ...paraStyle, fontWeight: 600, color: '#15140f' }}>
        Aside from anonymous page-view counts (described below), we collect
        no information about you. The deposit-date calculation runs entirely
        in your browser. We do not have user accounts, we do not store any
        case numbers, SSN digits, names, birth months, EBT card numbers, or
        any other information you enter into the tool, and we do not have a
        database of our visitors.
      </p>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>
          Types of Personal Information We Collect, How We Use It, and How We
          Share It
        </h2>
        <p style={paraStyle}>
          We collect the following types of information:
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 12px', lineHeight: 1.6 }}>
          <li style={{ marginBottom: 10 }}>
            <strong style={{ color: '#15140f' }}>
              Anonymous page-view counts.
            </strong>{' '}
            We use a privacy-friendly analytics service called GoatCounter to
            count visits to each page. GoatCounter records the URL path you
            visited (e.g. &ldquo;/&rdquo;, &ldquo;/fl&rdquo;,
            &ldquo;/embed/tx&rdquo;), the browser/OS family of your device,
            the referring URL (i.e., the external source by which you arrived
            at the Website), and a temporary daily-rotating hash of your IP
            address used only to de-duplicate visits within a 24-hour window
            before being discarded. GoatCounter does not use cookies, does
            not identify individual visitors, and does not share data with
            third parties. We use this aggregated information to understand
            which state schedules are most-used so we know which ones to keep
            most carefully updated. See{' '}
            <a
              href="https://www.goatcounter.com/help/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              GoatCounter&rsquo;s privacy documentation
            </a>{' '}
            for full details on what it does and does not collect.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong style={{ color: '#15140f' }}>
              Information you voluntarily provide by emailing us.
            </strong>{' '}
            If you email us at{' '}
            <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
              {OPERATOR.contactEmail}
            </a>
            , we will have whatever you put in that email (your email
            address, name if you include one, the content of your message).
            We use this information only to respond to you. We do not add
            you to a mailing list, share your email with third parties, or
            use it for anything other than answering you.
          </li>
        </ul>
        <p style={paraStyle}>
          We do <strong>not</strong> collect, store, transmit, or share any
          of the following: case numbers, Social Security Number digits,
          last names, birth months, birth years, EBT card numbers, county
          selections, or any other information you enter into the
          deposit-date calculator. All of that runs entirely in your
          browser. We have no user accounts and no database that could
          contain such information.
        </p>
        <p style={lastParaStyle}>
          We may share aggregated, anonymized information (e.g.
          &ldquo;visits per state per week&rdquo;) with partners, funders,
          or in public reports. We do not sell any information to anyone.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Our Use of Tracking and Analytics Technologies</h2>
        <p style={paraStyle}>
          <strong>We do not use cookies.</strong> The Website sets no
          cookies, no localStorage entries that persist across sessions,
          and no other identifiers that could be used to track you across
          visits.
        </p>
        <p style={paraStyle}>
          <strong>We do not use third-party trackers</strong> such as Google
          Analytics, Facebook Pixel, Hotjar, Mixpanel, Segment, or
          advertising/retargeting networks. The only analytics we use is
          GoatCounter, which is described above.
        </p>
        <p style={paraStyle}>
          <strong>GoatCounter.</strong> GoatCounter is a privacy-friendly,
          open-source web analytics tool. It collects only what is necessary
          to count page views and provide basic context (browser family,
          OS family, referrer, screen-size bucket, country). It does
          <em> not</em> set cookies, does <em>not</em> use fingerprinting,
          and does <em>not</em> follow you across other websites. For more
          information about how GoatCounter handles data, visit{' '}
          <a
            href="https://www.goatcounter.com/help/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            www.goatcounter.com/help/privacy
          </a>
          .
        </p>
        <p style={lastParaStyle}>
          {OPERATOR.shortName} does not track you across third-party websites
          to serve targeted advertising, and therefore does not respond
          differently based on the Do Not Track (DNT) signal in your
          browser &mdash; there is no targeted tracking for it to disable.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Data Security</h2>
        <p style={lastParaStyle}>
          Because we do not collect or store personal information from you,
          there is no personal data on our servers that could be exposed in
          a breach. The Website is served over HTTPS (encrypted in transit)
          via a reputable hosting provider. We use reasonable physical,
          electronic, and procedural safeguards to protect our hosting
          accounts. No data storage system or transmission of data over the
          Internet can be guaranteed to be completely secure.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Data Storage</h2>
        <p style={lastParaStyle}>
          We do not store any information you enter into the calculator
          (case numbers, SSN digits, names, etc.) on our servers or anywhere
          else. That data exists only in your browser&rsquo;s memory while
          you are using the page and is gone the moment you close the tab.
          We have built the Services to function without ever needing to
          save sensitive personal information to our servers.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Data Retention and Removal</h2>
        <p style={paraStyle}>
          We have no individual visitor records to retain or remove
          &mdash; the only data we receive is the aggregated, anonymous
          page-view counts described above, which cannot be tied back to
          any individual.
        </p>
        <p style={lastParaStyle}>
          If you have previously emailed us, you may request that we delete
          your email and our reply by writing to{' '}
          <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
            {OPERATOR.contactEmail}
          </a>
          . In order to process your request, we may require confirmation
          from the same email address.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>International Users</h2>
        <p style={lastParaStyle}>
          Our Services are hosted in the United States and subject to the
          laws of the United States. If you are located in a country outside
          the United States and voluntarily use the Services, you thereby
          consent to the general handling of any anonymous page-view data
          as described in this Privacy Policy and to the routing of that
          data through hosting infrastructure in the United States. U.S.
          law may not provide the degree of protection for personal
          information that is available in your country or local
          jurisdiction.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Children&rsquo;s Privacy</h2>
        <p style={lastParaStyle}>
          We do not knowingly collect or solicit any personal information
          from anyone, including children under the age of 13, through the
          Services. The deposit-date calculator does not require or store
          any identifying information. In the event that we learn we have
          inadvertently received personal information from a child under
          age 13 through an email, we will take reasonable steps to delete
          that information. If you believe that we might have any
          information from a child under 13, please contact us at{' '}
          <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
            {OPERATOR.contactEmail}
          </a>
          .
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Changes to this Privacy Policy</h2>
        <p style={lastParaStyle}>
          This Privacy Policy was last updated on the date listed at the
          top of this page. We may update our Privacy Policy from time to
          time. We will notify you of any changes by posting the new
          Privacy Policy on this page. You are advised to review this
          Privacy Policy periodically for any changes. Changes to this
          Privacy Policy are effective when they are posted on this page.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Questions?</h2>
        <p style={lastParaStyle}>
          If you have questions or concerns regarding this statement, or if
          you have any questions or suggestions, please contact us at{' '}
          <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
            {OPERATOR.contactEmail}
          </a>
          .
        </p>
      </div>
    </StaticPage>
  );
}
