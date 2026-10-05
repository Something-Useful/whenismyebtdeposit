// Single source of truth for the operator of record — the entity named in
// the Terms of Use, Privacy Policy, and footer copyright as running THIS
// deployment of the site.
//
// This project is open source (MIT — see LICENSE). The code is anyone's to
// fork; the operator identity is not. If you self-host a copy, change every
// value below to your own entity, set NEXT_PUBLIC_SITE_URL (lib/site-url.ts)
// to your domain, and have your own counsel review the legal pages — they
// are written for this operator's deployment, not yours.
export const OPERATOR = {
  /** Full legal entity name, as used in contracts ("the Company"). */
  legalName: 'Something Useful LLC',
  /** Short name used in running prose after first definition. */
  shortName: 'Something Useful',
  /** Contact address for legal notices, privacy requests, and support. */
  contactEmail: 'contact@whenismyebtdeposit.org',
} as const;
