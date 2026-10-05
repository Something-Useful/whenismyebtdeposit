import type { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';
import { OPERATOR } from '@/lib/operator';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `Standard terms for using whenismyebtdeposit.org, the SNAP EBT deposit-date tool by ${OPERATOR.legalName}.`,
};

const sectionStyle = { marginTop: 32 };
const subSectionStyle = { marginTop: 18 };
const headingStyle = {
  fontSize: 18,
  fontWeight: 600 as const,
  color: '#15140f',
  marginTop: 0,
  marginBottom: 10,
};
const subheadingStyle = {
  fontSize: 15,
  fontWeight: 600 as const,
  color: '#15140f',
  marginTop: 0,
  marginBottom: 6,
};
const paraStyle = { margin: '0 0 12px', lineHeight: 1.6 };
const lastParaStyle = { margin: 0, lineHeight: 1.6 };
const linkStyle = { color: '#5a574c', textDecoration: 'underline' };
const lastUpdatedStyle = {
  fontSize: 14,
  color: '#6f6b5d',
  margin: '0 0 24px',
};
const calloutStyle = {
  margin: '0 0 16px',
  fontSize: 14,
  fontWeight: 600 as const,
  color: '#15140f',
  background: 'rgba(228, 196, 105, 0.18)',
  border: '1px solid rgba(228, 196, 105, 0.5)',
  borderRadius: 8,
  padding: '12px 14px',
  lineHeight: 1.5,
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Use">
      <p style={lastUpdatedStyle}>Last updated: May 21, 2026</p>

      <p style={paraStyle}>
        These Terms apply to the instance of this open-source software
        operated by {OPERATOR.legalName} at whenismyebtdeposit.org. If you
        are using a copy of this software hosted by someone else, that
        operator&rsquo;s terms govern — not these.
      </p>

      <p style={paraStyle}>
        The following Terms of Use (&ldquo;Terms&rdquo;) constitute a
        legally binding agreement between {OPERATOR.legalName}, its
        subsidiaries, affiliates, agents and assigns (&ldquo;{OPERATOR.shortName},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; and
        &ldquo;our&rdquo;) and you. We own and operate the website
        whenismyebtdeposit.org (the &ldquo;Website&rdquo;) and the
        embeddable widget served at /embed (the &ldquo;Widget&rdquo;).
        In order to use the Website, the Widget, or any other content
        and services we may offer here (any of which, and all together,
        the &ldquo;Services&rdquo;), you (personally and, if applicable,
        on behalf of the entity for whom you are using the Services;
        collectively, &ldquo;you&rdquo;) must agree to and follow these
        Terms. By accessing, browsing and/or using the Services, you
        acknowledge that you have read, understood, and agree to be
        bound by the terms of this Agreement and to comply with all
        applicable laws and regulations. The terms and conditions of
        this Agreement form an essential basis of the bargain between
        you and {OPERATOR.shortName}, and this Agreement governs your use
        of the Services. If you do not agree to these terms, you may
        not access or use the Services.
      </p>

      <p style={paraStyle}>
        Be sure to read these Terms carefully, and if you have any
        questions please contact us at:{' '}
        <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
          {OPERATOR.contactEmail}
        </a>
        .
      </p>

      <p style={calloutStyle}>
        PLEASE NOTE THESE TERMS CONTAIN A BINDING ARBITRATION PROVISION
        AND CLASS ACTION WAIVER. SEE SECTION 13 FOR DETAILS. IF YOU DO
        NOT WISH TO BE SUBJECT TO ARBITRATION, YOU MAY OPT OUT OF THE
        ARBITRATION PROVISION BY FOLLOWING THE INSTRUCTIONS SET FORTH
        IN SECTION 13.4, WITHIN THE SPECIFIED TIME FRAME.
      </p>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>1. Modification of this Agreement</h2>
        <p style={lastParaStyle}>
          {OPERATOR.shortName} reserves the right to amend this Agreement
          at any time and will notify you of any such changes by
          posting the revised Agreement on the Website,
          whenismyebtdeposit.org. You should check this Agreement on
          the Website periodically for changes. All changes shall be
          effective upon posting. We will date the Terms with the last
          day of revision. Your continued use of the Services after
          any change to this Agreement constitutes your agreement to
          be bound by any such changes. {OPERATOR.shortName} may terminate,
          suspend, change, or restrict access to all or any part of
          the Services without notice or liability.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>2. Privacy Policy</h2>
        <p style={lastParaStyle}>
          {OPERATOR.shortName} maintains a{' '}
          <a href="/privacy" style={linkStyle}>
            Privacy Policy
          </a>
          , which details how we handle data. We fully incorporate our
          Privacy Policy into this Agreement. Note that we reserve the
          right to update the Privacy Policy at our discretion, and
          that any changes made to our Privacy Policy are effective
          when the updates are live on whenismyebtdeposit.org. As
          described more fully in the Privacy Policy, the Services are
          designed not to collect personal information about you
          &mdash; the deposit-date calculation runs entirely in your
          browser and we have no user accounts.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>3. Electronic Communications</h2>
        <p style={paraStyle}>
          By choosing to use the Services, you may from time to time
          receive disclosures, notices, documents, and any other
          communications about the Services from {OPERATOR.shortName}
          (&ldquo;Communications&rdquo;) if you have contacted us by
          email. We can only give you the benefits of our Services by
          conducting business through the Internet, and therefore we
          need you to consent to receiving Communications electronically.
          This section informs you of your rights when receiving
          electronic Communications from us. We may discontinue
          electronic provision of Communications at any time in our
          sole discretion.
        </p>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>3.1 Communications in Writing</h3>
          <p style={lastParaStyle}>
            By accepting this Agreement, you agree that electronic
            Communications shall be considered &ldquo;in writing&rdquo;
            and have the same meaning and effect as if provided in
            paper form, unless you have withdrawn your consent to
            receive Communications electronically as stated below.
            You agree that we have no obligation to provide you
            Communications in paper format, although we reserve the
            right to do so at any time.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>3.2 Minimum Requirements</h3>
          <p style={paraStyle}>
            You understand that, in order to view and/or retain copies
            of the electronic Communications, you will need:
          </p>
          <ul style={{ paddingLeft: 22, margin: '0 0 0', lineHeight: 1.6 }}>
            <li style={{ marginBottom: 6 }}>
              A device with an Internet connection and a modern web
              browser (recent versions of Chrome, Safari, Firefox, or
              Edge); and
            </li>
            <li style={{ marginBottom: 6 }}>
              A valid email address.
            </li>
            <li>
              Sufficient storage space to save Communications or the
              capability to print the Communications from the device
              on which you view them.
            </li>
          </ul>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>3.3 Withdrawing Consent</h3>
          <p style={lastParaStyle}>
            You may withdraw your consent to receive Communications
            electronically by contacting us at{' '}
            <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
              {OPERATOR.contactEmail}
            </a>
            . If you withdraw your consent, the legal validity and
            enforceability of prior Communications delivered in
            electronic form will not be affected.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>3.4 Updating Records</h3>
          <p style={lastParaStyle}>
            You may update the contact information through which you
            wish to be contacted by contacting us at{' '}
            <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
              {OPERATOR.contactEmail}
            </a>
            .
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>4. Our Services</h2>
        <p style={paraStyle}>
          {OPERATOR.shortName} offers a free web tool at
          whenismyebtdeposit.org that estimates when your next SNAP /
          EBT deposit will arrive, based on the publicly published
          monthly issuance schedule for your state. You enter
          state-specific information (such as a case number, last
          name letter, or SSN digit, depending on your state&rsquo;s
          rules) into the tool, the tool runs the calculation
          entirely in your browser, and a date is displayed. No
          information you enter is transmitted to or stored on our
          servers.
        </p>
        <p style={paraStyle}>
          We also offer an embeddable widget version of the same tool
          at <code>/embed</code>, which food banks, mutual-aid
          organizations, and benefits-counseling sites may iframe into
          their own websites at no charge. Partner sites embedding the
          Widget agree, on behalf of their visitors, to the same
          Terms and Privacy Policy that govern direct use of the
          Services.
        </p>
        <p style={lastParaStyle}>
          The Services display estimated deposit dates based on
          official state issuance schedules as published by the USDA
          and state human-services agencies. The Services are
          informational only and are not affiliated with, sponsored
          by, or endorsed by any state or federal agency. The actual
          arrival of funds depends on your state&rsquo;s benefit
          administration, your bank or EBT card processor, and other
          factors outside our control. Always confirm the exact date
          and amount with your state&rsquo;s official channels before
          relying on it for any time-sensitive purpose.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>5. Intellectual Property and Content Rights</h2>
        <p style={paraStyle}>
          The Website, the Widget, and the Services are owned and
          operated by {OPERATOR.shortName}. All content, visual interfaces,
          information, graphics, design, compilation, computer code,
          products, software, services, text, data, contents, names,
          trade names, trademarks, trade dress, service marks, layout,
          logos, designs, images, graphics, illustrations, artwork,
          icons, photographs, displays, sound, music, video, animation,
          organization, assembly, arrangement, interfaces, databases,
          technology, and all intellectual property of any kind
          whatsoever and the selection and arrangement thereof
          (collectively, the &ldquo;{OPERATOR.shortName} Materials&rdquo;)
          are owned exclusively by {OPERATOR.shortName} or the licensors
          or suppliers of {OPERATOR.shortName} and are protected by U.S.
          copyright, trade dress, patent, and trademark laws,
          international conventions, and all other relevant
          intellectual property and proprietary rights, and applicable
          laws. Nothing on the Website or in the Services should be
          construed as granting, by implication, estoppel, or
          otherwise, any license or right to use any of the {OPERATOR.shortName} Materials, without our prior written permission in
          each instance. You may not use, copy, display, distribute,
          modify or reproduce any of the {OPERATOR.shortName} Materials
          unless in accordance with written authorization by us.
        </p>
        <p style={paraStyle}>
          For the avoidance of doubt: the Widget (i.e. the iframe
          served at <code>/embed</code> and <code>/embed/&#123;state&#125;</code>) may be embedded by any
          organization, free of charge, in keeping with the
          documentation on our{' '}
          <a href="/partner" style={linkStyle}>
            Partners page
          </a>
          . This permission to embed does not include the right to
          copy, modify, host a derivative of, or rebrand the
          underlying code or content.
        </p>
        <p style={lastParaStyle}>
          You agree that the {OPERATOR.shortName} Materials may not be
          copied, reproduced, distributed, republished, displayed,
          posted or transmitted in any form or by any means, including,
          but not limited to, electronic, mechanical, photocopying,
          recording, or otherwise, without the express prior written
          consent of {OPERATOR.shortName}. You acknowledge that the{' '}
          {OPERATOR.shortName} Materials are and shall remain the property
          of {OPERATOR.shortName}. You may not modify, participate in the
          sale or transfer of, or create derivative works based on any{' '}
          {OPERATOR.shortName} Materials, in whole or in part.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>
          6. Third Party Links and Third Party Content and Services
        </h2>
        <p style={lastParaStyle}>
          Any and all software, content and services within the
          Services that are not owned by {OPERATOR.shortName} are
          &ldquo;third party content and services.&rdquo; {OPERATOR.shortName} acts merely as an intermediary service provider of,
          and accepts no responsibility or liability for, third party
          content and services. In addition and without limiting the
          generality of the foregoing, the Services may include links
          to sites operated by third parties, including the USDA SNAP
          Issuance Schedules, state human-services agencies, and state
          benefits portals. Those sites may collect data or solicit personal
          information from you. {OPERATOR.shortName} does not control such
          sites, and is not responsible for their content, policies,
          or collection, use or disclosure of any information those
          sites may collect.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>7. Termination</h2>
        <p style={paraStyle}>
          Subject to applicable law, {OPERATOR.shortName} may terminate
          this Agreement at any time without notice, or suspend or
          terminate your access and use of the Services at any time,
          with or without cause, in {OPERATOR.shortName}&rsquo;s absolute
          discretion and without notice. The following provisions of
          this Agreement shall survive termination of your use or
          access to the Services: the sections concerning
          Indemnification, Limitations on Warranties, Limitation of
          Liability, Dispute Resolution by Binding Arbitration, and
          General Terms, and any other provision that by its terms
          survives termination of your use or access to the Services.
        </p>
        <p style={lastParaStyle}>
          {OPERATOR.shortName} further reserves the right to modify or
          discontinue, either temporarily or permanently, any portions
          or all of the Services at any time with or without notice.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>8. Limitations of Use</h2>
        <p style={paraStyle}>
          You agree to use the Services only for lawful purposes. You
          are prohibited from any use of the Services that would
          constitute a violation of any applicable law, regulation,
          rule or ordinance of any nationality, state, or locality or
          of any international law or treaty, or that could give rise
          to any civil or criminal liability. Any unauthorized use of
          the Services, including but not limited to unauthorized
          entry into {OPERATOR.shortName}&rsquo;s systems or misuse of any
          information posted through the Services, is strictly
          prohibited. {OPERATOR.shortName} makes no claims concerning
          whether use of the Services is appropriate outside of the
          United States. If you access the Services from outside of
          the United States, you are solely responsible for ensuring
          compliance with the laws of your specific jurisdiction.
        </p>
        <p style={paraStyle}>
          Without limitation, you agree that you will not, directly
          or indirectly:
        </p>
        <ul style={{ paddingLeft: 22, margin: '0 0 12px', lineHeight: 1.6 }}>
          <li style={{ marginBottom: 6 }}>
            Use the Services in a manner that violates these Terms or
            any applicable law, rule, or regulation, or for any
            unintended purpose;
          </li>
          <li style={{ marginBottom: 6 }}>
            Except as expressly permitted by these Terms, copy,
            reproduce, modify, distribute, display, create derivative
            works of or transmit any content on the Services;
          </li>
          <li style={{ marginBottom: 6 }}>
            Use the Services or any of our marks commercially, for
            benchmarking, or to compile information for a competitive
            product or service;
          </li>
          <li style={{ marginBottom: 6 }}>
            Reverse engineer, decompile, tamper with or disassemble
            the technology used to provide the Services (except as
            and only to the extent any foregoing restriction is
            prohibited by a non-waivable provision of applicable law
            or to the extent as may be permitted by the licensing
            terms governing use of any open-source components), or
            otherwise attempt to obtain source code;
          </li>
          <li style={{ marginBottom: 6 }}>
            Interfere with or damage the Services or our servers,
            including, without limitation, through the use of viruses,
            malware, harmful code, denial of service attacks, forged
            information, or similar methods or technology;
          </li>
          <li style={{ marginBottom: 6 }}>
            Attempt to obtain unauthorized access to the Services or
            any materials or information not intentionally made
            available through the Services;
          </li>
          <li style={{ marginBottom: 6 }}>
            Violate, misappropriate or infringe a third party&rsquo;s
            intellectual property or other right through the Services;
            or
          </li>
          <li>
            Interfere with any third party&rsquo;s ability to use or
            enjoy, or our ability to provide, the Services.
          </li>
        </ul>
        <p style={lastParaStyle}>
          {OPERATOR.shortName} reserves the right to take various actions
          against you if we believe you have engaged in activities
          restricted by this Agreement or by laws or regulations, and{' '}
          {OPERATOR.shortName} also reserves the right to take action to
          protect {OPERATOR.shortName}, other users, and other third
          parties from any liability, fees, fines, or penalties. We
          may take actions including, but not limited to: (1)
          limiting or completely closing your access to the Services,
          (2) taking legal action against you, and (3) holding you
          liable for the amount of {OPERATOR.shortName}&rsquo;s damages
          caused by your violation of this Agreement.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>9. Limitations on Warranties</h2>
        <p style={paraStyle}>
          While we try to keep our Services safe and functioning,
          using our Services exposes you to some risks. {OPERATOR.shortName} is not responsible for any harm you may experience.
          Specifically:
        </p>
        <p style={paraStyle}>
          THE SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND
          &ldquo;AS AVAILABLE&rdquo; BASIS. TO THE FULLEST EXTENT
          PERMITTED BY LAW, SOMETHING USEFUL AND ALL OF ITS SUCCESSORS,
          PARENTS, SUBSIDIARIES, AFFILIATES, OFFICERS, DIRECTORS,
          STOCKHOLDERS, INVESTORS, EMPLOYEES, AGENTS, REPRESENTATIVES
          AND ATTORNEYS AND THEIR RESPECTIVE HEIRS, SUCCESSORS, AND
          ASSIGNS (COLLECTIVELY, THE &ldquo;SOMETHING USEFUL
          PARTIES&rdquo;) EXPRESSLY MAKE NO REPRESENTATIONS OR
          WARRANTIES OF ANY KIND, EXPRESS, STATUTORY, OR IMPLIED AS
          TO THE CONTENT OR OPERATION OF THE SERVICES. YOU EXPRESSLY
          AGREE THAT YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK. IF
          YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA
          CIVIL CODE SECTION 1542 WHICH PROVIDES: &ldquo;A GENERAL
          RELEASE DOES NOT EXTEND TO CLAIMS THAT THE CREDITOR OR
          RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR
          HER FAVOR AT THE TIME OF EXECUTING THE RELEASE AND THAT, IF
          KNOWN BY HIM OR HER, WOULD HAVE MATERIALLY AFFECTED HIS OR
          HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY.&rdquo;
        </p>
        <p style={lastParaStyle}>
          THE SOMETHING USEFUL PARTIES MAKE NO REPRESENTATIONS,
          WARRANTIES OR GUARANTEES, EXPRESS OR IMPLIED, REGARDING THE
          ACCURACY, ADEQUACY, TIMELINESS, RELIABILITY, COMPLETENESS,
          OR USEFULNESS OF ANY OF THE INFORMATION OR CONTENT ON THE
          SERVICES, AND EXPRESSLY DISCLAIM ANY WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          NON-INFRINGEMENT, OR TITLE. STATE ISSUANCE SCHEDULES CAN
          CHANGE WITHOUT NOTICE AND WE CANNOT GUARANTEE THE INFORMATION
          DISPLAYED IS CURRENT OR ACCURATE FOR EVERY HOUSEHOLD. THE
          SOMETHING USEFUL PARTIES MAKE NO REPRESENTATION, WARRANTY,
          OR GUARANTEE THAT THE SERVICES ARE FREE OF VIRUSES, BUGS,
          DEFECTS, ERRORS, OR OTHER COMPUTING ROUTINES THAT CONTAIN
          DAMAGING OR OTHERWISE CONTAMINATING PROPERTIES, OR PROGRAMS
          INTENDED TO INTERCEPT OR STEAL PERSONAL OR SYSTEM DATA.
          PLEASE NOTE, THE ABILITY TO EXCLUDE WARRANTIES VARIES IN
          DIFFERENT JURISDICTIONS. TO THE EXTENT THAT A JURISDICTION
          PLACES LIMITS ON THE ABILITY FOR A PARTY TO EXCLUDE
          WARRANTIES, THESE EXCLUSIONS EXIST TO THE EXTENT PERMITTED
          BY LAW. BECAUSE OF THIS JURISDICTIONAL VARIANCE, SOME OF
          THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>10. Limitation of Liability</h2>
        <p style={paraStyle}>
          THE SOMETHING USEFUL PARTIES WILL NOT BE RESPONSIBLE, UNDER
          ANY CIRCUMSTANCES, TO YOU OR ANY THIRD PARTY FOR ANY DIRECT,
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY,
          LIQUIDATED, OR PUNITIVE DAMAGES, INCLUDING DAMAGES UNDER
          WARRANTY, CONTRACT, TORT, NEGLIGENCE, OR ANY OTHER CLAIMS,
          ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICES, THE
          SOMETHING USEFUL MATERIALS, OR ANY CONTENT OR OTHER
          MATERIALS ON OR ACCESSED THROUGH THE SERVICES, EVEN IF
          SOMETHING USEFUL HAS BEEN ADVISED OF THE POSSIBILITY OF
          SUCH DAMAGES. THE SOMETHING USEFUL PARTIES WILL ALSO NOT BE
          LIABLE TO YOU FOR ANY USE OF INFORMATION, DATA, OR OTHER
          MATERIAL TRANSMITTED VIA THE SERVICES, OR FOR ANY ERRORS,
          DEFECTS, INTERRUPTIONS, DELETIONS, OR LOSSES RESULTING FROM,
          INCLUDING LOSS OF PROFIT, REVENUE, OR BUSINESS, ARISING IN
          WHOLE OR IN PART FROM YOUR ACCESS TO, OR USE OF, THE
          SERVICES, INCLUDING WITHOUT LIMITATION ANY MISSED DEPOSIT,
          OVERDRAFT, BOUNCED PAYMENT, OR PLANNING DECISION MADE ON
          THE BASIS OF A DATE SHOWN BY THE SERVICES. IN NO EVENT WILL
          THE SOMETHING USEFUL PARTIES&rsquo; TOTAL LIABILITY TO YOU
          FOR ALL DAMAGES, LOSSES OR CAUSES OF ACTION EXCEED USD
          $1,000 (ONE THOUSAND UNITED STATES DOLLARS). SOME
          JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN
          WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR
          INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF
          THE LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU. IF
          YOU ARE DISSATISFIED WITH ANY PORTION OF THE SERVICES OR
          WITH THIS AGREEMENT, YOUR SOLE AND EXCLUSIVE REMEDY IS TO
          DISCONTINUE USE OF OUR SERVICES.
        </p>
        <p style={paraStyle}>
          YOU ACKNOWLEDGE AND AGREE THAT, SUBJECT TO APPLICABLE LAW,
          YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY DISPUTE WITH SOMETHING
          USEFUL IS TO STOP USING THE SERVICES. YOU ACKNOWLEDGE AND
          AGREE THAT SOMETHING USEFUL IS NOT LIABLE FOR ANY ACT OR
          FAILURE TO ACT ON ITS OWN PART. IN NO EVENT SHALL SOMETHING
          USEFUL&rsquo;S OR ITS EMPLOYEES&rsquo;, CONTRACTORS&rsquo;,
          OFFICERS&rsquo;, DIRECTORS&rsquo; OR SHAREHOLDERS&rsquo;
          LIABILITY TO YOU EXCEED THE AMOUNT THAT YOU PAID TO
          SOMETHING USEFUL FOR YOUR USE OF THE SERVICES (WHICH, FOR
          THE FREE SERVICES, IS ZERO). IN NO CASE SHALL SOMETHING
          USEFUL OR ITS EMPLOYEES, CONTRACTORS, OFFICERS, DIRECTORS
          OR SHAREHOLDERS BE LIABLE FOR INCIDENTAL OR CONSEQUENTIAL
          DAMAGES ARISING FROM YOUR USE OF ANY OF THE SERVICES.
          BECAUSE SOME STATES OR JURISDICTIONS DO NOT ALLOW THE
          EXCLUSION OR THE LIMITATION OF LIABILITY FOR CONSEQUENTIAL
          OR INCIDENTAL DAMAGES, IN SUCH STATES OR JURISDICTIONS,
          SUCH LIABILITY SHALL BE LIMITED TO THE FULL EXTENT
          PERMITTED BY LAW.
        </p>
        <p style={lastParaStyle}>
          YOU FURTHER SPECIFICALLY ACKNOWLEDGE THAT SOMETHING USEFUL
          IS NOT LIABLE, AND YOU AGREE NOT TO SEEK TO HOLD SOMETHING
          USEFUL LIABLE, FOR THE CONDUCT OF THIRD PARTIES, INCLUDING
          STATE AGENCIES, BANKS, EBT CARD PROCESSORS, AND OPERATORS
          OF EXTERNAL SITES, AND THAT THE RISK OF USING OR ACCESSING
          THE SERVICES AND OTHER EXTERNAL SITES, AND OF INJURY FROM
          THE FOREGOING, RESTS ENTIRELY WITH YOU.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>11. Indemnification</h2>
        <p style={lastParaStyle}>
          To the fullest extent permitted by law, you agree to
          indemnify, defend and hold harmless the {OPERATOR.shortName}
          Parties from and against any and all claims, losses,
          expenses, demands or liabilities, including reasonable
          attorneys&rsquo; fees arising out of or relating to (i)
          your access to, use of or alleged use of the Services; (ii)
          your violation of this Agreement or any representation,
          warranty, or agreements referenced herein, or any
          applicable law or regulation; (iii) your violation of any
          third party right, including without limitation any
          intellectual property right, publicity, confidentiality,
          property or privacy right; or (iv) any disputes or issues
          between you and any third party. We reserve the right, at
          our own expense, to assume the exclusive defense and control
          of any matter otherwise subject to indemnification by you,
          and in such case, you agree to cooperate with our defense
          of such claim. You shall cooperate as fully as reasonably
          required in the defense of any such claim. {OPERATOR.shortName}
          reserves the right, at its own expense, to assume the
          exclusive defense and control of any matter subject to
          indemnification by you. You agree not to settle any matter
          without the prior written consent of {OPERATOR.shortName}.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>
          12. Applicable Law, Jurisdiction, and Venue
        </h2>
        <p style={lastParaStyle}>
          These Terms, your use of the Services, and any other matter
          relating to {OPERATOR.shortName} will be governed by the laws of
          the state of New York, without regard to conflict of laws
          principles.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>
          13. Dispute Resolution by Binding Arbitration
        </h2>
        <p style={paraStyle}>
          PLEASE READ THIS &ldquo;DISPUTE RESOLUTION BY BINDING
          ARBITRATION&rdquo; PROVISION VERY CAREFULLY. IT LIMITS YOUR
          RIGHTS IN THE EVENT OF A DISPUTE BETWEEN YOU AND SOMETHING
          USEFUL, SUBJECT TO THE TERMS AND OPT-OUT OPTION SET FORTH
          BELOW.
        </p>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.1 Scope of Arbitration Provision</h3>
          <p style={lastParaStyle}>
            You and {OPERATOR.shortName} agree that any and all past,
            present and future disputes, claims, or causes of action
            arising out of or relating to your use of any of the
            Services, these Terms, or any other controversies or
            disputes between you and {OPERATOR.shortName} or any of{' '}
            {OPERATOR.shortName}&rsquo;s affiliates, licensors,
            distributors, suppliers or agents, whether arising prior
            to or after you agreed to the Terms (collectively,
            &ldquo;Dispute(s)&rdquo;), shall be determined by
            arbitration, unless (A) you opt out as provided in
            Section 13.4 below; or (B) your Dispute is subject to an
            exception to this agreement to arbitrate set forth in
            Section 13.8. You and {OPERATOR.shortName} further agree that
            any arbitration pursuant to this Section shall not
            proceed as a class, group or representative action.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.2 Informal Dispute Resolution</h3>
          <p style={lastParaStyle}>
            {OPERATOR.shortName} wants to address your concerns without
            the need for a formal legal dispute. Before filing a
            claim against {OPERATOR.shortName}, you agree to try to
            resolve the Dispute informally by contacting{' '}
            <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
              {OPERATOR.contactEmail}
            </a>
            . Similarly, {OPERATOR.shortName} will undertake reasonable
            efforts to contact you (if we have contact information
            for you) to resolve any claim we may possess informally
            before taking any formal action. If a Dispute is not
            resolved within 30 days after the email noting the
            Dispute is sent, you or {OPERATOR.shortName} may initiate an
            arbitration proceeding as described below.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.3 We Both Agree To Arbitrate</h3>
          <p style={lastParaStyle}>
            By agreeing to these Terms, you and {OPERATOR.shortName} each
            and both agree to resolve any Disputes through final and
            binding arbitration as discussed herein, except as set
            forth under &ldquo;Exceptions to Agreement To
            Arbitrate&rdquo; below.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.4 Opt-Out of Agreement to Arbitrate</h3>
          <p style={lastParaStyle}>
            If you do not wish to be subject to this arbitration
            agreement, you may opt out of this arbitration provision
            by sending a written notice to{' '}
            <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
              {OPERATOR.contactEmail}
            </a>{' '}
            within thirty (30) days of first accepting these Terms.
            You must date the written notice, and include your first
            and last name, address, and a clear statement that you do
            not wish to resolve disputes with {OPERATOR.shortName} through
            arbitration. If no written notice is submitted by the
            30-day deadline, you will be deemed to have knowingly and
            intentionally waived your right to litigate any Dispute
            except with regard to the exceptions set forth in Section
            13.8 below. By opting out of the agreement to arbitrate,
            you will not be precluded from using the Services, but
            you and {OPERATOR.shortName} will not be permitted to invoke
            the mutual agreement to arbitrate to resolve Disputes
            under the terms otherwise provided herein.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.5 Arbitration Procedure and Fees</h3>
          <p style={paraStyle}>
            You and {OPERATOR.shortName} agree that the American
            Arbitration Association (&ldquo;AAA&rdquo;) will administer
            the arbitration under its Commercial Arbitration Rules
            and the Supplementary Procedures for Consumer Related
            Disputes in effect at the time arbitration is sought
            (&ldquo;AAA Rules&rdquo;). Those rules are available at{' '}
            <a
              href="https://www.adr.org"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              www.adr.org
            </a>{' '}
            or by calling the AAA at 1-800-778-7879. A party who
            desires to initiate arbitration must provide the other
            party with a written Demand for Arbitration as specified
            in the AAA Rules. Arbitration will proceed on an
            individual basis and will be handled by a sole arbitrator.
            The single arbitrator will be either a retired judge or
            an attorney licensed to practice law and will be selected
            by the parties from the AAA&rsquo;s roster of arbitrators.
            If the parties are unable to agree upon an arbitrator
            within fourteen (14) days of delivery of the Demand for
            Arbitration, then the AAA will appoint the arbitrator in
            accordance with the AAA Rules. The arbitrator(s) shall
            be authorized to award any remedies, including injunctive
            relief, that would be available to you in an individual
            lawsuit and that are not waivable under applicable law.
            Notwithstanding any language to the contrary in this
            Section 13, if a party seeks injunctive relief that
            would significantly impact other users as reasonably
            determined by either party, the parties agree that such
            arbitration will proceed on an individual basis but will
            be handled by a panel of three (3) arbitrators. Each
            party shall select one arbitrator, and the two
            party-selected arbitrators shall select the third, who
            shall serve as chair of the arbitral panel. Except as
            and to the extent otherwise may be required by law, the
            arbitration proceeding and any award shall be
            confidential.
          </p>
          <p style={lastParaStyle}>
            You and {OPERATOR.shortName} further agree that the
            arbitration will be held in New York, New York, or, if
            you so elect, all proceedings can be conducted via
            videoconference, telephonically or via other remote
            electronic means. If {OPERATOR.shortName} elects arbitration,{' '}
            {OPERATOR.shortName} shall pay all of the AAA filing costs
            and administrative fees (other than hearing fees). If
            you elect arbitration, filing costs and administrative
            fees (other than hearing fees) shall be paid in
            accordance with the AAA Rules, or in accordance with
            countervailing law if contrary to the AAA Rules. However,
            if the value of the relief sought is $10,000 or less, at
            your request, {OPERATOR.shortName} will pay all filing,
            administration, and arbitrator fees associated with the
            arbitration, unless the arbitrator(s) finds that either
            the substance of your claim or the relief sought was
            frivolous or was brought for an improper purpose (as
            measured by the standards set forth in Federal Rule of
            Civil Procedure 11(b)). In such circumstances, fees will
            be determined in accordance with the AAA Rules. Each
            party shall bear the expense of its own attorneys&rsquo;
            fees, except as otherwise required by law. This Section
            13 &ldquo;Dispute Resolution by Binding Arbitration&rdquo;
            shall be construed under and be subject to the Federal
            Arbitration Act, notwithstanding any other choice of law
            set out in these Terms.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.6 Arbitration Shall Proceed Individually</h3>
          <p style={lastParaStyle}>
            Regardless of the rules of a given arbitration forum, you
            and {OPERATOR.shortName} agree that the arbitration of any
            Dispute shall proceed on an individual basis, and neither
            you nor {OPERATOR.shortName} may bring a claim as a part of
            a class, group, collective, coordinated, consolidated or
            mass arbitration (each, a &ldquo;Collective
            Arbitration&rdquo;). Without limiting the generality of
            the foregoing, a claim to resolve any Dispute against{' '}
            {OPERATOR.shortName} will be deemed a Collective Arbitration
            if (i) two (2) or more similar claims for arbitration are
            filed concurrently by or on behalf of one or more
            claimants; and (ii) counsel for the claimants are the
            same, share fees or coordinate across the arbitrations.
            &ldquo;Concurrently&rdquo; for purposes of this provision
            means that both arbitrations are pending (filed but not
            yet resolved) at the same time.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>
            13.7 Class Action and Collective Arbitration Waiver
          </h3>
          <p style={lastParaStyle}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,
            NEITHER YOU NOR SOMETHING USEFUL SHALL BE ENTITLED TO
            CONSOLIDATE, JOIN OR COORDINATE DISPUTES BY OR AGAINST
            OTHER INDIVIDUALS OR ENTITIES, OR ARBITRATE OR LITIGATE
            ANY DISPUTE IN A REPRESENTATIVE CAPACITY, INCLUDING AS A
            REPRESENTATIVE MEMBER OF A CLASS OR IN A PRIVATE ATTORNEY
            GENERAL CAPACITY. IN CONNECTION WITH ANY DISPUTE (AS
            DEFINED ABOVE), ANY AND ALL SUCH RIGHTS ARE HEREBY
            EXPRESSLY AND UNCONDITIONALLY WAIVED. ANY CHALLENGE TO
            THE VALIDITY OF THIS SECTION 13.7 SHALL BE DETERMINED
            EXCLUSIVELY BY THE ARBITRATOR.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.8 Exceptions to Agreement to Arbitrate</h3>
          <p style={lastParaStyle}>
            Notwithstanding your and {OPERATOR.shortName}&rsquo;s
            agreement to arbitrate Disputes, either you or {OPERATOR.shortName} retain the following rights: you and {OPERATOR.shortName} retain the right (A) to bring an individual action
            in small claims court; and (B) to seek injunctive or other
            equitable relief in a court of competent jurisdiction to
            prevent the actual or threatened infringement,
            misappropriation or violation of a party&rsquo;s
            copyrights, trademarks, trade secrets, patents or other
            intellectual property rights.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>13.9 Judicial Forum for Disputes</h3>
          <p style={lastParaStyle}>
            Except as otherwise required by applicable law, in the
            event that this Arbitration Provision is found not to
            apply to you or your claim, you and {OPERATOR.shortName}
            agree that any judicial proceeding (other than small
            claims actions) will be brought in the federal or state
            courts of New York County, New York. Both you and{' '}
            {OPERATOR.shortName} consent to venue and personal
            jurisdiction there. We both agree to waive our right to
            a jury trial.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>
            13.10 Survival and Severability of This Arbitration Provision
          </h3>
          <p style={lastParaStyle}>
            This Section 13 &ldquo;Dispute Resolution By
            Arbitration&rdquo; shall survive the termination or
            expiration of these Terms. With the exception of Section
            13.7 &ldquo;Class Action and Collective Arbitration
            Waiver,&rdquo; if a court decides that any part of this
            Section 13 is invalid or unenforceable, then the
            remaining portions of this Section 13 shall nevertheless
            remain valid and in force. In the event that a court
            finds that all or any portion of Section 13.7
            &ldquo;Class Action and Collective Arbitration
            Waiver&rdquo; to be invalid or unenforceable, then the
            entirety of this Section 13 &ldquo;Dispute Resolution By
            Arbitration&rdquo; shall be deemed void and any remaining
            Dispute must be litigated in court pursuant to Section
            13.9.
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>14. Severability</h2>
        <p style={lastParaStyle}>
          Except as otherwise set forth in Section 13, if any part of
          these Terms is determined by a court to be inapplicable or
          invalid, then the remainder shall still be given full force
          and effect.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>15. General Terms</h2>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>15.1 Reservation of Rights</h3>
          <p style={lastParaStyle}>
            {OPERATOR.shortName} and its licensors exclusively own all
            right, title and interest in and to the Services,
            including all associated intellectual property rights.
            You acknowledge that the Services are protected by
            copyright, trademark, and other laws of the United States
            and foreign countries. You agree not to remove, alter or
            obscure any copyright, trademark, service mark or other
            proprietary rights notices incorporated in or accompanying
            the Services.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>15.2 Entire Agreement</h3>
          <p style={lastParaStyle}>
            These Terms constitute the entire and exclusive
            understanding and agreement between {OPERATOR.shortName} and
            you regarding the Services, and these Terms supersede and
            replace all prior oral or written understandings or
            agreements between {OPERATOR.shortName} and you regarding the
            Services. Headings are for reference purposes only and in
            no way define, limit, construe or describe the scope or
            extent of such section. If any provision of these Terms
            is held invalid or unenforceable by an arbitrator or a
            court of competent jurisdiction, that provision will be
            enforced to the maximum extent permissible and the other
            provisions of these Terms will remain in full force and
            effect. You may not assign or transfer these Terms, by
            operation of law or otherwise, without {OPERATOR.shortName}&rsquo;s prior written consent. Any attempt by you
            to assign or transfer these Terms, without such consent,
            will be null. {OPERATOR.shortName} may freely assign or
            transfer these Terms without restriction. Subject to the
            foregoing, these Terms will bind and inure to the benefit
            of the parties, their successors and permitted assigns.
            You agree that these Terms are not intended to confer
            and do not confer any rights or remedies upon any third
            party.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>15.3 Notices</h3>
          <p style={lastParaStyle}>
            Any notices or other communications provided by {OPERATOR.shortName} under these Terms will be given: (i) via email; or
            (ii) by posting to the Services. For notices made by
            email, the date of receipt will be deemed the date on
            which such notice is transmitted.
          </p>
        </div>

        <div style={subSectionStyle}>
          <h3 style={subheadingStyle}>15.4 Waiver of Rights</h3>
          <p style={lastParaStyle}>
            {OPERATOR.shortName}&rsquo;s failure to enforce any right or
            provision of these Terms will not be considered a waiver
            of such right or provision. The waiver of any such right
            or provision will be effective only if in writing and
            signed by a duly authorized representative of {OPERATOR.shortName}. Except as expressly set forth in these Terms, the
            exercise by either party of any of its remedies under
            these Terms will be without prejudice to its other
            remedies under these Terms or otherwise.
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>16. Contact Us</h2>
        <p style={lastParaStyle}>
          <a href={`mailto:${OPERATOR.contactEmail}`} style={linkStyle}>
            {OPERATOR.contactEmail}
          </a>
        </p>
      </div>
    </StaticPage>
  );
}
