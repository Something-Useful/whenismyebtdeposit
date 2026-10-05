# whenismyebtdeposit.org

This is an EBT deposit date calculator hosted on http://whenismyebtdeposit.org/. We're open sourcing this project so anyone can inspect the underlying data sources and implementation of the deposit schedule ([`lib/state-data.ts`](lib/state-data.ts) and [`lib/state-rules.tsx`](lib/state-rules.tsx)). You're welcome to host another instance yourself, though the repo is not primarily structured with that use-case in mind.

## Data sources

Every state has a different EBT deposit schedule. Sometimes they differ for SNAP (food stamps) and EBT Cash benefits. Schedules are transcribed
from official sources — USDA's [Monthly SNAP Issuance Schedule](https://www.fns.usda.gov/snap/monthly-issuance-schedule)
and state agency publications (e.g. Florida DCF's issuance manual, NY OTDA's
NYC pickup schedule). Each state's sources and last-verified date are
recorded in [`lib/state-data.ts`](lib/state-data.ts).

## Contributing

If anything here is incorrect, out-of-date, or confusing, please open an issue or a pull request. Try to include a new canonical correct government source of information if you think our underlying source is out-of-date.

State information lives in two files:

- [`lib/state-data.ts`](lib/state-data.ts) contains state program names, the official sources, when we last verified
  the schedule, agency contact info, and the plain-English explainer users see.
- [`lib/state-rules.tsx`](lib/state-rules.tsx) contains the implementations of the state deposit schedules. Pennsylvania's county rules, NYC's published tables, and the
  holiday calendars have their own modules alongside.


## Technical setup

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Static export** — `npm run build:static` (`NEXT_EXPORT=true next build`)
  emits a fully static site to `.next-export/`. No server runtime.
- **Analytics** — none by default. Set `NEXT_PUBLIC_GOATCOUNTER_URL` at
  build time to enable GoatCounter;
  see `.env.example`.
- **Partner contact form** posts to Formspree when `NEXT_PUBLIC_FORMSPREE_URL`
  is set at build time; otherwise it opens a prefilled email to the operator.
- **Canonical URL** is build-time configurable via `NEXT_PUBLIC_SITE_URL`
  (defaults to the production domain).


## License

[MIT](LICENSE).

The code is MIT-licensed (see [LICENSE](LICENSE)).
Four things do **not** travel with the license:

- **Operator identity.** The Terms of Use and Privacy Policy describe the
  instance run by the operator named in [`lib/operator.ts`](lib/operator.ts).
  If you deploy your own copy, change every value in that file to your own
  entity, and have your own counsel review the legal pages — they were
  written for our deployment, not yours.
- **Domain.** Set `NEXT_PUBLIC_SITE_URL` (see [`lib/site-url.ts`](lib/site-url.ts))
  to your own domain. The name "whenismyebtdeposit.org" stays with this project.
- **Analytics.** Off unless you set `NEXT_PUBLIC_GOATCOUNTER_URL` for your
  own account (see `.env.example`).
- **Contact form.** Set `NEXT_PUBLIC_FORMSPREE_URL` to your own Formspree
  form, or leave it unset to use the email fallback.

---

Initial development supported by the Gates Foundation and Propel's AI Residency.

Built and maintained by Jake Solomon ([@lippytak](https://github.com/lippytak/)).
