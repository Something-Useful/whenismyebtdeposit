// Canonical per-state program data — the facts about each state's programs,
// separate from both the schedule algorithms (lib/state-rules.tsx and friends)
// and the UI phrasing (labels, toggles, prose — those live with the
// components and rules). The test for what belongs here: could a state
// agency confirm or deny it? Phone numbers, program names, source
// documents — yes. Button labels and iframe heights — no.
//
// This file is meant to be reviewable by humans who never read the code.
// If a hotline number changed, a portal moved, or a state renamed its
// SNAP program, the fix is a one-line edit here. See CONTRIBUTING notes
// in README.md — corrections with an official source are the most
// valuable kind of PR this project gets.
//
// Source-attribution policy
// (July 2026 audit): the linked schedule source is always USDA or a state
// government agency; a state carries its own entry only when the agency
// publishes the schedule itself on a user-openable .gov page — everywhere
// else the USDA all-states schedule is both accurate and canonical.

export interface StateSource {
  /** Rendered as the link text: "Info from {name}." */
  name: string;
  url: string;
}

/** Content for the (i) info icon shown next to a field label. Use it for
 * state-specific terminology (EDG #, FS case #, recipient ID) where a short
 * "what is this and where do I find it" hint helps. Bodies are plain text;
 * bare domains, 1-XXX-XXX-XXXX phone numbers, and [label](https://url)
 * links are auto-linked (components/Popover.tsx linkifyText). */
export interface InfoModalContent {
  title: string;
  body: string;
}

/** Labels and (i) help for the state's form. The input *logic* (kind,
 * placeholder, validation) lives in lib/state-rules.tsx; this is only the
 * words. Omitted for states with no input at all. */
export interface FieldCopy {
  label: string;
  help?: InfoModalContent;
  /** PA's conditional case-digit input; MO's last-name input. */
  secondInput?: { label: string; help?: InfoModalContent };
  /** The input revealed by a "Yes" on the cash toggle (TX's TANF EDG). */
  cashInput?: { label: string; help?: InfoModalContent };
}

export interface StateData {
  /** Full state name. */
  name: string;
  /** Form labels and (i) help — see FieldCopy. */
  field?: FieldCopy;
  /** What the state calls SNAP ("CalFresh", "Basic Food"); omit → "SNAP". */
  snapProgramName?: string;
  /** Present when the state has an EBT cash benefit we cover. `name` is
   * the program's proper name (CalWORKs, SUNCAP, TANF); null when the
   * state offers cash on EBT without a distinct program name in our copy. */
  cashProgram?: { name: string | null };
  /** The "How {state} calculates this" body — a plain string, rendered
   * verbatim. This is the plain-English restatement of the schedule rule;
   * keep it in sync with the rule logic in lib/state-rules.tsx when a
   * schedule changes. States whose schedule differs by the toggle answer
   * (NY: "Are you in New York City?") give one string per answer instead. */
  explainer: string | { yes: string; no: string };
  /** The one canonical source the schedule logic was transcribed from —
   * the state agency's own publication where it exists, otherwise the USDA
   * all-states schedule. Shown as "Info from …" on the result screen. */
  scheduleSource: StateSource;
  /** When the schedule was last verified against its source. */
  verified: { date: string };
  contact: {
    /** Formatted for display, e.g. "1-866-762-2237". */
    hotline: string;
    /** The state's benefits portal, when it has a usable one. */
    portal?: { name: string; url: string };
  };
}

export const USDA_SOURCE: StateSource = {
  name: 'USDA SNAP Issuance Schedules',
  // The fns.usda.gov HTML page has been unreachable since the FNS→FNA
  // reorganization (mid-2026); this is USDA's own PDF of the same document.
  url: 'https://fns-prod.azureedge.us/sites/default/files/resource-files/Monthly-Issuance-Schedule-All-States.pdf',
};

// TX asks for two EDG numbers (SNAP and, for cash recipients, TANF); both
// (i) buttons show the same explainer.
const TX_EDG_HELP: InfoModalContent = {
  title: "What's my EDG number?",
  body:
    "Your Eligibility Determination Group (EDG) is a number assigned by Texas Health and Human Services (HHSC). You might have separate EDG numbers for SNAP (food stamps) and TANF (EBT Cash). You'll find it on letters from HHSC, or under 'My Cases' after signing in at yourtexasbenefits.com.",
};

export const STATE_DATA: Record<string, StateData> = {
  FL: {
    name: 'Florida',
    field: {
      label: "Case number",
      help: {
        title: "What's my Florida case number?",
        body:
          "It's a 9- or 10-digit number assigned by the Florida Department of Children and Families (DCF). You'll find it on any letter from DCF, or by signing in to your ACCESS Florida account at myaccessflorida.com.",
      },
    },
    cashProgram: { name: null },
    explainer: {
      yes: `Florida loads SNAP between the 1st and 28th, using the 9th and 8th digits
      of your case number read backward (and dropping the 10th if your case
      number has one). SUNCAP, the SNAP program for people who get SSI, loads on
      the 1st–3rd instead. Cash aid also loads on the 1st–3rd. Both use the
      same two digits.`,
      no: `Florida loads SNAP between the 1st and 28th, using the 9th and 8th digits
      of your case number read backward (and dropping the 10th if your case
      number has one). SUNCAP, the SNAP program for people who get SSI, loads on
      the 1st–3rd instead, based on the same two digits.`,
    },
    scheduleSource: USDA_SOURCE,
    verified: { date: '2024-06-18' },
    contact: { hotline: '1-866-762-2237', portal: { name: 'ACCESS Florida', url: 'https://www.myaccessflorida.com' } },
  },
  DE: {
    name: 'Delaware',
    field: {
      label: "Your last name",
    },
    explainer:
      `Delaware spreads SNAP deposits over 22 days, from the 2nd to the 23rd of
      every month, based on the first letter of your last name. Most letters map
      to a single day; a few share (Q/R, U/V, X/Y/Z).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-07-21' },
    contact: { hotline: '1-800-372-2022', portal: { name: 'Delaware ASSIST', url: 'https://assist.dhss.delaware.gov' } },
  },
  CO: {
    name: 'Colorado',
    field: {
      label: "Last digit of your SSN",
    },
    cashProgram: { name: null },
    explainer:
      `Colorado loads SNAP over the first 10 days of every month, based on the
      last digit of your SSN (1–9 map straight to days 1–9; 0 maps to the 10th).
      EBT cash loads on the 1st–3rd, also based on the last digit.`,
    scheduleSource: { name: 'Colorado CDHS SNAP page', url: 'https://cdhs.colorado.gov/snap' },
    verified: { date: '2025-12-03' },
    contact: { hotline: '1-800-536-5298', portal: { name: 'PEAK', url: 'https://peak.colorado.gov' } },
  },
  AL: {
    name: 'Alabama',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the number assigned by the Alabama Department of Human Resources (DHR). You'll find it on letters from DHR, or by signing in to your account at mydhr.alabama.gov.",
      },
    },
    explainer:
      `Alabama loads SNAP between the 4th and the 23rd of every month, based on
      the last two digits of your case number, in bands of five.`,
    scheduleSource: { name: 'Alabama DHR schedule', url: 'https://dhr.alabama.gov/wp-content/uploads/2019/07/EBT_Issuance_Schedule_07122013.pdf' },
    verified: { date: '2025-11-04' },
    contact: { hotline: '1-334-242-1700', portal: { name: 'MyDHR', url: 'https://mydhr.alabama.gov' } },
  },
  AK: {
    name: 'Alaska',
    explainer:
      `Alaska loads SNAP on the 1st of every month for everyone — no calculation
      needed.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-09-12' },
    contact: { hotline: '1-907-465-3347' },
  },
  AZ: {
    name: 'Arizona',
    field: {
      label: "Your last name",
    },
    snapProgramName: 'Nutrition Assistance',
    explainer:
      `Arizona loads SNAP (Nutrition Assistance) over the first 13 days of every
      month, based on the first letter of your last name. Letters are paired
      (A/B, C/D, …).`,
    scheduleSource: { name: 'Arizona DES policy manual', url: 'https://dbmefaapolicy.azdes.gov/FAA5/EBT_Benefit_Issuance_and_Availability.html' },
    verified: { date: '2026-01-22' },
    contact: { hotline: '1-855-432-7587', portal: { name: 'Health-e-Arizona Plus', url: 'https://www.healthearizonaplus.gov' } },
  },
  AR: {
    name: 'Arkansas',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `Arkansas loads SNAP between the 4th and the 13th of every month, based on
      the last digit of your Social Security Number.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-08-30' },
    contact: { hotline: '1-800-482-8988', portal: { name: 'Access Arkansas', url: 'https://access.arkansas.gov' } },
  },
  CA: {
    name: 'California',
    field: {
      label: "Case number",
      help: {
        title: "What's my CalFresh case number?",
        body:
          "Your 7-digit case number is on your EBT card, below your card number and name. Skip the first 2 digits, and then your case number is the next 7 characters, which can include both numbers and letters. It's also on letters from the county and in your benefitscal.com account.",
      },
    },
    snapProgramName: 'CalFresh',
    cashProgram: { name: 'CalWORKs' },
    explainer:
      `California loads SNAP (CalFresh) over the first 10 days of every month,
      based on the last digit of your case number (1–9 → days 1–9, 0 → the
      10th). EBT cash (CalWORKs) loads on the 1st–3rd, but California doesn’t
      say the exact day.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2026-02-14' },
    contact: { hotline: '1-877-847-3663', portal: { name: 'BenefitsCal', url: 'https://benefitscal.com' } },
  },
  CT: {
    name: 'Connecticut',
    field: {
      label: "Last 2 of your Client ID",
      help: {
        title: "What's my Client ID?",
        body:
          "It's the 9-digit client number on your ConneCT EBT card and on letters from DSS — not the long 18-digit card number across the front of the card. You can also find it by signing in at connect.ct.gov.",
      },
    },
    cashProgram: { name: null },
    explainer:
      `Connecticut spreads SNAP deposits over the first 8 days of the month,
      based on the last two digits of your Client ID — the 9-digit client number
      on your ConneCT card, not the long card number. Cash benefits always
      arrive on the 1st.`,
    scheduleSource: { name: 'Connecticut DSS schedule', url: 'https://portal.ct.gov/dss/knowledge-base/articles/snap/the-dates-when-dss-issues-snap-and-cash-benefits-are-changing' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-855-626-6632', portal: { name: 'ConneCT', url: 'https://connect.ct.gov' } },
  },
  DC: {
    name: 'Washington D.C.',
    field: {
      label: "Your last name",
    },
    explainer:
      `D.C. loads SNAP over the first 10 days of every month, based on the first
      letter of your last name, in alphabetical groups.`,
    scheduleSource: { name: 'DC DHS schedule', url: 'https://dhs.dc.gov/service/snap-monthly-benefit' },
    verified: { date: '2025-12-12' },
    contact: { hotline: '1-202-724-5506', portal: { name: 'District Direct', url: 'https://districtdirect.dc.gov' } },
  },
  GA: {
    name: 'Georgia',
    field: {
      label: "Your Georgia ID number",
      help: {
        title: "What's my Georgia ID number?",
        body:
          "It's your Georgia Gateway client ID — the unique number on letters from the Division of Family and Children Services (DFCS), or in your account at gateway.ga.gov.",
      },
    },
    explainer:
      `Georgia loads SNAP on odd-numbered days from the 5th to the 23rd, based on
      the last two digits of your ID number, in bands of ten.`,
    scheduleSource: { name: 'Georgia DHS policy manual', url: 'https://pamms.dhs.ga.gov/dfcs/snap/3810/' },
    verified: { date: '2025-11-29' },
    contact: { hotline: '1-877-423-4746', portal: { name: 'Georgia Gateway', url: 'https://gateway.ga.gov' } },
  },
  HI: {
    name: 'Hawaii',
    field: {
      label: "Your last name",
    },
    explainer:
      `Hawaii loads SNAP on either the 3rd or the 5th, based on the first letter
      of your last name (A–I → 3rd, J–Z → 5th). Combined SNAP&nbsp;+&nbsp;cash
      cases with cash direct deposit get SNAP on the 1st.`,
    scheduleSource: { name: 'Hawaii DHS EBT page', url: 'https://humanservices.hawaii.gov/bessd/ebt/' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-855-643-1643' },
  },
  ID: {
    name: 'Idaho',
    field: {
      label: "Your birth year",
    },
    explainer:
      `Idaho loads SNAP over the first 10 days of every month, based on the last
      digit of your birth year (1–9 → days 1–9, 0 → the 10th).`,
    scheduleSource: { name: 'Idaho DHW SNAP page', url: 'https://healthandwelfare.idaho.gov/services-programs/food-assistance/apply-snap' },
    verified: { date: '2025-10-11' },
    contact: { hotline: '1-877-456-1233', portal: { name: 'idalink', url: 'https://www.idalink.idaho.gov' } },
  },
  IL: {
    name: 'Illinois',
    field: {
      label: "Head of Household ID number",
      help: {
        title: "What's my Head of Household ID?",
        body:
          "It's the Individual ID number for the head of household on your Illinois SNAP case. You'll find it on letters from IDHS, or by signing in to your account at abe.illinois.gov.",
      },
    },
    explainer:
      `Illinois loads SNAP over the first 10 days of every month, based on the
      last digit of your Head of Household Individual ID number (1–9 → days 1–9,
      0 → the 10th). Households approved before October 2017 keep their original
      days, which can fall on the 1st–10th, 13th, 17th, or 20th.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2024-06-18' },
    contact: { hotline: '1-800-843-6154', portal: { name: 'ABE', url: 'https://abe.illinois.gov' } },
  },
  IN: {
    name: 'Indiana',
    field: {
      label: "Your last name",
    },
    cashProgram: { name: 'TANF' },
    explainer:
      `Indiana loads SNAP on odd-numbered days from the 5th to the 23rd, based on
      the first letter of your last name. EBT cash (TANF) is issued on the 1st
      of every month.`,
    scheduleSource: { name: 'Indiana FSSA SNAP page', url: 'https://www.in.gov/fssa/dfr/snap-food-assistance/' },
    verified: { date: '2025-08-19' },
    contact: { hotline: '1-800-403-0864', portal: { name: 'FSSA Benefits Portal', url: 'https://fssabenefits.in.gov' } },
  },
  IA: {
    name: 'Iowa',
    field: {
      label: "Your last name",
    },
    explainer:
      `Iowa loads SNAP over the first 10 days of every month, based on the first
      letter of your last name, in alphabetical groups.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-11-22' },
    contact: { hotline: '1-877-347-5678', portal: { name: 'Iowa HHS', url: 'https://hhs.iowa.gov' } },
  },
  KS: {
    name: 'Kansas',
    field: {
      label: "Your last name",
    },
    cashProgram: { name: null },
    explainer:
      `Kansas loads SNAP over the first 10 days of every month, based on the
      first letter of your last name. Cash benefits are issued on the 1st.`,
    scheduleSource: { name: 'Kansas DCF policy manual', url: 'https://content.dcf.ks.gov/ees/keesm/current/keesm1513.htm' },
    verified: { date: '2025-10-02' },
    contact: { hotline: '1-888-369-4777', portal: { name: 'KEES Self-Service', url: 'https://applyforbenefits.ks.gov' } },
  },
  KY: {
    name: 'Kentucky',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by the Kentucky Department for Community Based Services (DCBS). You'll find it on letters from DCBS, or by signing in to your kynect account at kynect.ky.gov.",
      },
    },
    explainer:
      `Kentucky loads SNAP on odd-numbered days from the 1st to the 19th, based
      on the last digit of your case number.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-12-18' },
    contact: { hotline: '1-855-306-8959', portal: { name: 'kynect', url: 'https://kynect.ky.gov' } },
  },
  LA: {
    name: 'Louisiana',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `Louisiana loads SNAP on odd-numbered days from the 5th to the 23rd, based
      on the last digit of your SSN. If you're 60 or older, or anyone in your
      household is disabled, SNAP loads between the 1st and the 4th instead.`,
    scheduleSource: { name: 'Louisiana Department of Health SNAP schedule', url: 'https://www.ldh.la.gov/news/SNAPupdate-nov7' },
    verified: { date: '2026-10-05' },
    contact: { hotline: '1-888-524-3578', portal: { name: 'CAFÉ', url: 'https://sspweb.dcfs.louisiana.gov/selfservice' } },
  },
  ME: {
    name: 'Maine',
    field: {
      label: "Day of the month you were born",
    },
    explainer:
      `Maine loads SNAP between the 10th and the 14th, based on the last digit of
      your birth day (born on the 10th, 20th, or 30th → 10th of month;
      1st/11th/21st/31st → 11th; and so on).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-09-26' },
    contact: { hotline: '1-800-442-6003', portal: { name: 'My Maine Connection', url: 'https://www.maine.gov/online/mymaineconnection' } },
  },
  MD: {
    name: 'Maryland',
    field: {
      label: "Your last name",
    },
    explainer:
      `Maryland loads SNAP between the 4th and the 23rd of every month, based on
      the first three letters of your last name (each day covers an alphabetical
      range).`,
    scheduleSource: { name: 'Maryland DHS schedule', url: 'https://dhs.maryland.gov/supplemental-nutrition-assistance-program/food-supplement-benefits-schedule/' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-800-332-6347', portal: { name: 'MD THINK', url: 'https://mymdthink.maryland.gov' } },
  },
  MA: {
    name: 'Massachusetts',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `Massachusetts loads SNAP over the first 14 days of every month, based on
      the last digit of your SSN (or the number DTA assigned to you). When your
      day falls on a Sunday or holiday, benefits arrive the previous business
      day.`,
    scheduleSource: { name: 'Massachusetts DTA EBT page', url: 'https://www.mass.gov/info-details/using-your-ebt-card' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-877-382-2363', portal: { name: 'DTA Connect', url: 'https://dtaconnect.eohhs.mass.gov' } },
  },
  MI: {
    name: 'Michigan',
    field: {
      label: "Recipient ID number",
      help: {
        title: "What's my recipient ID number?",
        body:
          "It's the ID shown on benefits letters from Michigan Department of Health and Human Services (MDHHS), or in your MI Bridges account at newmibridges.michigan.gov. It isn't printed on your Bridge card.",
      },
    },
    cashProgram: { name: null },
    explainer: {
      yes: `Michigan loads SNAP on odd-numbered days from the 3rd to the 21st, based
      on the last digit of your recipient ID number. EBT cash (FIP, SDA, or RCA)
      is split in half: the first half loads on the 5th–9th and the second half
      ten days later, on the 15th–19th, also based on the last digit.`,
      no: `Michigan loads SNAP on odd-numbered days from the 3rd to the 21st, based
      on the last digit of your recipient ID number.`,
    },
    scheduleSource: { name: 'MI Bridges Issuance Schedules (RFS 305)', url: 'https://mdhhs-pres-prod.michigan.gov/olmweb/ex/RF/Public/RFS/305.pdf' },
    verified: { date: '2026-08-21' },
    contact: { hotline: '1-855-275-6424', portal: { name: 'MI Bridges', url: 'https://newmibridges.michigan.gov' } },
  },
  MN: {
    name: 'Minnesota',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by your county human services office (administered through Minnesota DHS). You'll find it on letters from your county, or in your MNbenefits account at mnbenefits.mn.gov.",
      },
    },
    explainer:
      `Minnesota loads SNAP from the 4th to the 13th, based on the last digit of
      your case number (4–9 map to days 4–9, then 0/1/2/3 → days 10/11/12/13).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-10-29' },
    contact: { hotline: '1-800-657-3698', portal: { name: 'MNbenefits', url: 'https://mnbenefits.mn.gov' } },
  },
  MS: {
    name: 'Mississippi',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by the Mississippi Department of Human Services (MDHS). You'll find it on letters from your county MDHS office.",
      },
    },
    explainer:
      `Mississippi loads SNAP between the 4th and the 21st, based on the last two
      digits of your case number, in bands of ~6.`,
    scheduleSource: { name: 'Mississippi DHS schedule', url: 'https://www.mdhs.ms.gov/wp-content/uploads/2018/02/NEW-GF-507B-Mississippi-EBT-Project-Recipient-Information-Sheet1-2.pdf' },
    verified: { date: '2025-08-11' },
    contact: { hotline: '1-800-948-3050', portal: { name: 'MDHS', url: 'https://www.mdhs.ms.gov' } },
  },
  MO: {
    name: 'Missouri',
    field: {
      label: 'Your birth month',
      secondInput: { label: 'Your last name' },
    },
    explainer:
      `Missouri loads SNAP over the first 22 days of every month, based on your
      birth month and the first letter of your last name. Most months split
      between A–K and L–Z; April and December are the same day for everyone.`,
    scheduleSource: { name: 'Missouri DSS schedule', url: 'https://mydss.mo.gov/monthly-ebt-benefit-schedule' },
    verified: { date: '2025-09-19' },
    contact: { hotline: '1-855-373-4636', portal: { name: 'MyDSS', url: 'https://mydss.mo.gov' } },
  },
  MT: {
    name: 'Montana',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by Montana DPHHS. You'll find it on letters from your local Office of Public Assistance, or by signing in to your account at apply.mt.gov.",
      },
    },
    explainer:
      `Montana loads SNAP over 5 days starting on the 2nd, based on the last
      digit of your case number (digits paired: 0/1, 2/3, 4/5, 6/7, 8/9).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-07-30' },
    contact: { hotline: '1-888-706-1535', portal: { name: 'apply.mt.gov', url: 'https://apply.mt.gov' } },
  },
  NE: {
    name: 'Nebraska',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `Nebraska loads SNAP over the first 5 days of every month, based on the
      last digit of the head of household’s SSN (paired: 1/2, 3/4, 5/6, 7/8,
      9/0).`,
    scheduleSource: { name: 'Nebraska DHHS EBT guide', url: 'https://dhhs.ne.gov/Documents/EBT%20Q%20&%20A.pdf' },
    verified: { date: '2025-11-15' },
    contact: { hotline: '1-800-383-4278', portal: { name: 'ACCESSNebraska', url: 'https://dhhs.ne.gov/Pages/ACCESSNebraska.aspx' } },
  },
  NV: {
    name: 'Nevada',
    field: {
      label: "Your birth year",
    },
    explainer:
      `Nevada loads SNAP over the first 10 days of every month, based on the last
      digit of your birth year (1–9 → days 1–9, 0 → 10th).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2026-02-22' },
    contact: { hotline: '1-800-992-0900', portal: { name: 'Access Nevada', url: 'https://accessnevada.dwss.nv.gov' } },
  },
  NH: {
    name: 'New Hampshire',
    explainer:
      `New Hampshire loads SNAP on the 5th of every month for everyone.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-10-08' },
    contact: { hotline: '1-603-271-9700', portal: { name: 'NH EASY', url: 'https://nheasy.nh.gov' } },
  },
  NJ: {
    name: 'New Jersey',
    field: {
      label: "Case number",
      help: {
        title: "What's my NJ case number?",
        body:
          "It's listed on letters from your county Board of Social Services, or in your account on the NJ One Stop Career and Training Connection / NJ Helps benefits portal.",
      },
    },
    explainer:
      `New Jersey loads SNAP over the first 5 days of every month, based on the
      7th digit of your case number. In Warren County, everyone gets SNAP on
      the 1st.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2026-01-31' },
    contact: { hotline: '1-800-687-9512' },
  },
  NY: {
    name: 'New York',
    field: {
      label: "Case number",
      help: {
        title: "What's my NY case number?",
        body:
          "It's the case number assigned by your county Department of Social Services (HRA in New York City). You'll find it on letters from your local office, or by signing in to your account at mybenefits.ny.gov or ACCESS HRA.",
      },
    },
    explainer: {
      // "Yes, NYC"
      yes: `In NYC there's no fixed formula — HRA publishes a [six-month table
      of pickup dates](https://otda.ny.gov/workingfamilies/ebt/nyc-issuance-schedule.pdf).
      Everyone gets their deposit in the first two weeks of the month, on a
      date that changes each month.`,
      // "No, Upstate"
      no: `New York (excluding NYC) loads SNAP over the first 9 days of every month,
      based on the last digit of your case number (0/1 → the 1st, otherwise
      your day matches the digit).`,
    },
    // USDA covers both NYC and upstate. The NYC branch's exact dates come
    // from HRA's six-month table (lib/nyc-schedule.ts), which the NYC
    // explainer links to directly.
    scheduleSource: USDA_SOURCE,
    verified: { date: '2026-08-04' },
    contact: { hotline: '1-800-342-3009', portal: { name: 'myBenefits', url: 'https://mybenefits.ny.gov' } },
  },
  NM: {
    name: 'New Mexico',
    field: {
      label: "Last 2 of your SSN",
    },
    explainer:
      `New Mexico loads SNAP over 20 days, based on the last two digits of your
      SSN. The units digit picks a pair of days; the tens digit decides which of
      the two.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-12-09' },
    contact: { hotline: '1-800-283-4465', portal: { name: 'YES New Mexico', url: 'https://yes.state.nm.us' } },
  },
  NC: {
    name: 'North Carolina',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `North Carolina loads SNAP on odd-numbered days from the 3rd to the 21st,
      based on the last digit of the primary cardholder’s SSN. Households
      without an SSN get benefits on the 3rd.`,
    scheduleSource: { name: 'North Carolina DHHS EBT page', url: 'https://www.ncdhhs.gov/divisions/child-and-family-well-being/food-and-nutrition-services-food-stamps/electronic-benefit-transfer' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-800-662-7030', portal: { name: 'ePASS', url: 'https://epass.nc.gov' } },
  },
  ND: {
    name: 'North Dakota',
    explainer:
      `North Dakota loads SNAP on the 1st of every month for everyone.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-08-04' },
    contact: { hotline: '1-800-755-2716', portal: { name: 'North Dakota HHS', url: 'https://www.hhs.nd.gov' } },
  },
  OH: {
    name: 'Ohio',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's on letters from your county Job and Family Services (JFS) office, or in your account at benefits.ohio.gov.",
      },
    },
    explainer:
      `Ohio loads SNAP on even-numbered days from the 2nd to the 20th, based on
      the last digit of your case number.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2026-01-18' },
    contact: { hotline: '1-866-244-0071', portal: { name: 'Ohio Benefits', url: 'https://benefits.ohio.gov' } },
  },
  OK: {
    name: 'Oklahoma',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by Oklahoma Human Services (OKDHS). You'll find it on letters from OKDHS, or by signing in to your OKDHSLive account at okdhslive.org.",
      },
    },
    explainer:
      `Oklahoma loads SNAP on the 1st, 5th, or 10th of every month, based on the
      last digit of your case number (0–3 → 1st, 4–6 → 5th, 7–9 → 10th).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-10-23' },
    contact: { hotline: '1-855-880-8003', portal: { name: 'OKDHSLive', url: 'https://okdhslive.org' } },
  },
  OR: {
    name: 'Oregon',
    field: {
      label: "Last digit of your SSN",
    },
    explainer:
      `Oregon loads SNAP over the first 9 days of every month, based on the last
      digit of your SSN (0 and 1 both fall on the 1st; otherwise day = digit).
      If you don’t have an SSN on file, benefits arrive on the 1st.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-12-15' },
    contact: { hotline: '1-503-945-5600', portal: { name: 'ONE', url: 'https://one.oregon.gov' } },
  },
  PA: {
    name: 'Pennsylvania',
    field: {
      label: 'Your county',
      secondInput: {
        label: 'Last digit of your case number',
        help: {
          title: "What's my case number?",
          body:
            "It's the case record number assigned by your County Assistance Office (CAO). You'll find it on letters from the CAO, or by signing in at [compass.state.pa.us](https://www.compass.state.pa.us).",
        },
      },
    },
    explainer:
      `Pennsylvania’s SNAP schedule is county-specific and counted in business
      days, meaning it excludes weekends and holidays. Most counties pay
      everyone on the same business day each month; some split households
      across two business days based on case number; the largest counties
      spread households across the first 10 business days. Pennsylvania
      publishes the exact dates each year, and in short months, like November
      2026, it moves some of them earlier.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2024-06-18' },
    contact: { hotline: '1-800-692-7462', portal: { name: 'COMPASS', url: 'https://www.compass.state.pa.us' } },
  },
  RI: {
    name: 'Rhode Island',
    explainer:
      `Rhode Island loads SNAP on the 1st of every month for everyone.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-09-08' },
    contact: { hotline: '1-855-697-4347', portal: { name: 'HealthyRhode', url: 'https://healthyrhode.ri.gov' } },
  },
  SC: {
    name: 'South Carolina',
    field: {
      label: "Case number",
      help: {
        title: "What's my case number?",
        body:
          "It's the case number assigned by the SC Department of Social Services (DSS). You'll find it on letters from your local DSS office, or by signing in to your account at apply.dss.sc.gov.",
      },
    },
    explainer:
      `South Carolina spreads SNAP from the 2nd to the 19th every month, based on
      the last digit of your case number — even digits get days 2–10, odd
      digits 11–19. Households approved before Sept 1, 2012 use an older
      1st–10th schedule (digit straight to day).`,
    scheduleSource: { name: 'South Carolina DSS FAQ', url: 'https://dss.sc.gov/assistance-programs/snap/faq/' },
    verified: { date: '2024-06-20' },
    contact: { hotline: '1-800-616-1309', portal: { name: 'SC DSS Apply', url: 'https://apply.dss.sc.gov' } },
  },
  SD: {
    name: 'South Dakota',
    explainer:
      `South Dakota loads SNAP on the 10th of every month for everyone.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-08-25' },
    contact: { hotline: '1-877-999-5612' },
  },
  TN: {
    name: 'Tennessee',
    field: {
      label: "Last 2 of your SSN",
    },
    explainer:
      `Tennessee loads SNAP over the first 20 days of every month, based on the
      last two digits of the head of household’s SSN, in bands of 5.`,
    scheduleSource: { name: 'Tennessee DHS schedule', url: 'https://www.tn.gov/content/dam/tn/human-services/documents/SNAP%20Issuance%20Schedule.pdf' },
    verified: { date: '2025-10-15' },
    contact: { hotline: '1-866-311-4287', portal: { name: 'One DHS', url: 'https://onedhs.tn.gov' } },
  },
  TX: {
    name: 'Texas',
    field: {
      label: 'SNAP EDG number',
      help: TX_EDG_HELP,
      cashInput: { label: 'TANF EDG number', help: TX_EDG_HELP },
    },
    cashProgram: { name: 'TANF' },
    explainer:
      `Texas loads SNAP between the 1st and the 28th of every month, based on the
      last two digits of your SNAP EDG number. Households certified before May
      2023 without a break in benefits may still be on an older schedule. EBT
      cash (TANF) loads on the 1st–3rd, based on the last digit of your TANF
      EDG number.`,
    scheduleSource: { name: 'Texas HHSC handbook', url: 'https://www.hhs.texas.gov/handbooks/texas-works-handbook/b-250-ebt-benefit-issuance' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-877-541-7905', portal: { name: 'Your Texas Benefits', url: 'https://www.yourtexasbenefits.com' } },
  },
  UT: {
    name: 'Utah',
    field: {
      label: "Your last name",
    },
    explainer:
      `Utah loads SNAP on the 5th, 11th, or 15th of every month, based on the
      first letter of your last name (A–G → 5th, H–O → 11th, P–Z → 15th).`,
    scheduleSource: { name: 'Utah DWS food stamps page', url: 'https://jobs.utah.gov/customereducation/services/foodstamps/use.html' },
    verified: { date: '2025-09-30' },
    contact: { hotline: '1-866-526-3663', portal: { name: 'myCase', url: 'https://jobs.utah.gov/mycase' } },
  },
  VT: {
    name: 'Vermont',
    snapProgramName: '3SquaresVT',
    explainer:
      `Vermont loads SNAP (3SquaresVT) on the 1st of every month for everyone.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-07-14' },
    contact: { hotline: '1-800-479-6151', portal: { name: 'My Benefits', url: 'https://mybenefits.vermont.gov' } },
  },
  VA: {
    name: 'Virginia',
    field: {
      label: "FS case number",
      help: {
        title: "What's my FS case number?",
        body:
          "FS stands for Food Stamps. It's the case number from the Virginia Department of Social Services. You'll find it on letters from your local DSS office, or in your account at commonhelp.virginia.gov.",
      },
    },
    explainer:
      `Virginia loads SNAP on the 1st, 4th, or 7th of every month, based on the
      last digit of your case number (0–3 → 1st, 4–5 → 4th, 6–9 → 7th).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-12-26' },
    contact: { hotline: '1-800-552-3431', portal: { name: 'CommonHelp', url: 'https://commonhelp.virginia.gov' } },
  },
  WA: {
    name: 'Washington',
    snapProgramName: 'Basic Food',
    explainer:
      `Washington loads SNAP (Basic Food) benefits monthly, on a day between the
      1st and 20th, but Washington doesn’t say the exact day — it’s assigned by
      the Department of Social and Health Services (DSHS) when your case is
      approved, and the same day repeats each month. To find or confirm your
      specific date, sign in at
      washingtonconnection.org or call
      DSHS at 1-877-501-2233. More background: dshs.wa.gov.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2024-06-18' },
    contact: { hotline: '1-877-501-2233', portal: { name: 'Washington Connection', url: 'https://www.washingtonconnection.org' } },
  },
  WV: {
    name: 'West Virginia',
    field: {
      label: "Your last name",
    },
    cashProgram: { name: null },
    explainer:
      `West Virginia loads SNAP over the first 9 days of every month, based on
      the first letter of your last name (with an unusual grouping). Cash
      benefits are issued on the 1st.`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-08-17' },
    contact: { hotline: '1-800-642-8589', portal: { name: 'WV PATH', url: 'https://wvpath.wv.gov' } },
  },
  WI: {
    name: 'Wisconsin',
    field: {
      label: "Last 4 of your SSN",
    },
    snapProgramName: 'FoodShare',
    explainer:
      `Wisconsin loads SNAP (FoodShare) from the 2nd to the 15th of every month,
      based on the 8th digit of the head of household’s SSN (the third of the
      last four).`,
    scheduleSource: { name: 'Wisconsin DHS FoodShare page', url: 'https://www.dhs.wisconsin.gov/foodshare/spending.htm' },
    verified: { date: '2026-07-31' },
    contact: { hotline: '1-800-362-3002', portal: { name: 'ACCESS Wisconsin', url: 'https://access.wi.gov' } },
  },
  WY: {
    name: 'Wyoming',
    field: {
      label: "Your last name",
    },
    explainer:
      `Wyoming loads SNAP over the first 4 days of every month, based on the
      first letter of your last name (A–D → 1st, E–K → 2nd, L–R → 3rd, S–Z →
      4th).`,
    scheduleSource: USDA_SOURCE,
    verified: { date: '2025-07-07' },
    contact: { hotline: '1-307-777-5846' },
  },
};

/** The source rendered as "Info from {name}." — USDA fallback. */
export function scheduleSourceFor(abbr: string | null | undefined): StateSource {
  return (abbr && STATE_DATA[abbr]?.scheduleSource) || USDA_SOURCE;
}

/** "How {state} calculates this" copy for this household. */
export function explainerFor(abbr: string, hasCash: boolean): string {
  const e = STATE_DATA[abbr].explainer;
  return typeof e === 'string' ? e : hasCash ? e.yes : e.no;
}

/** Result-card label for the SNAP row: "SNAP (CalFresh)" etc. */
export function snapDisplayLabel(abbr: string): string {
  const program = STATE_DATA[abbr]?.snapProgramName;
  return program ? `SNAP (${program})` : 'SNAP (food stamps)';
}

/** Strip everything except digits for a `tel:` href. */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/\D/g, '');
}

/** Title of the "Didn't get your benefits?" popover on the result screen. */
export const SUPPORT_HELP_TITLE = 'Didn’t get your benefits?';

/** Body of that popover — plain text; the hotline and the [portal](url)
 * link are auto-linked by the UI (components/Popover.tsx linkifyText). */
export function supportHelpBody(abbr: string): string {
  const { name, contact } = STATE_DATA[abbr];
  const portal = contact.portal ? ` or check [${contact.portal.name}](${contact.portal.url})` : '';
  return (
    `If you didn’t get your benefits when you expected them, please call the ${name} SNAP hotline at ` +
    `${contact.hotline}${portal} to make sure your case isn’t missing anything.`
  );
}
