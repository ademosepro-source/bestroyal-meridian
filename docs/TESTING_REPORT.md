# Testing Report

Last updated: Phase 7 (Testing & Deployment).

This is an honest account of what has actually been verified, how, and —
just as importantly — what has **not** been tested yet and why. Per the
project's own rule, nothing here claims a feature "works" without saying
exactly how that was checked.

## What this report can and can't cover

This project was built without a live Supabase project or real Paystack
account connected to it (those are things only the school can create —
see `docs/SETUP.md`). That means two different kinds of testing exist:

1. **Automated / structural testing** — done repeatedly throughout the
   build, and re-run at the end of every phase. This is what the sections
   below describe.
2. **Live, data-backed testing** — logging in as each role and clicking
   through real workflows against a real database. This **cannot** be done
   until `docs/SETUP.md` is followed (Supabase project created, migrations
   run, a Super Administrator account created). The "Live walkthrough
   checklist" at the bottom of this document is what to run through once
   that's done — treat every box there as unchecked until you've actually
   clicked through it.

## 1. Automated unit tests

Run with `npm test`. These cover the pure calculation logic that every
other feature depends on being correct — the kind of bug that's easy to
get subtly wrong and hard to spot by eye:

- `src/lib/academics/grading.test.ts` — grade-band lookup at its exact
  boundaries, score totals, class-average math, and tie-handling in class
  position ranking (two students with the same average must share a
  position, and the next position must skip accordingly).
- `src/lib/finance/invoices.test.ts` — invoice totals, that only
  `successful` payments ever count toward a balance (never `pending`,
  `failed` or `reversed`), and that a balance never goes negative.
- `src/lib/auth/roles.test.ts` — every role has a label and a home page,
  and — critically — every role's own home page is a page that role is
  actually allowed to open (this is what would catch a role being
  redirected straight into a page the middleware then bounces it out of).
- `src/lib/payments/paystack.test.ts` — the webhook signature check
  accepts a correctly-signed payload and rejects a tampered one or a
  missing signature, verified against an independent HMAC implementation
  (Node's own `crypto`), not just against itself.

All 22 tests pass as of this writing (`npm test`).

## 2. Production build

`npm run build` is run after every phase and must complete with zero
TypeScript errors before that phase is considered done. This catches
most "it compiles but is subtly wrong" mistakes — a missing field, a typo
in a database column name, a role check with the wrong type.

## 3. Lint

`npm run lint` (ESLint) is run after every phase and is kept at zero
warnings — unused variables, unescaped characters, and a handful of
React/Next-specific correctness rules.

## 4. Security review

- Every table created by every migration has Row Level Security enabled
  in that same migration — checked by comparing every `create table`
  against every `enable row level security` statement across all five
  migration files.
- Every server action that uses the service-role (admin) client — which
  bypasses Row Level Security entirely — is checked to also call
  `requireRole()` first (staff account creation, admissions
  officer converting an application) or to be gated by independent
  verification against Paystack instead (the payment confirmation path,
  which has no logged-in user to check a role against).
- `.env.local` (and any `.env*` file) is excluded from Git via
  `.gitignore` — confirmed by reading the file, not assumed.
- No card details are ever stored; online payments only ever store a
  Paystack reference and the verified amount/status.
- `npm audit` reports **0 vulnerabilities** as of this writing.
- No use of `dangerouslySetInnerHTML` anywhere in the codebase (checked
  by searching the whole `src/` tree).
- The service-role admin client (`src/lib/supabase/admin.ts`) is
  confirmed never imported by any file marked `"use client"` — it must
  stay server-only.

## 5. Mobile responsiveness

Every public page (`/`, `/about`, `/academics`, `/contact`, `/gallery`,
`/news`, `/admissions`, `/login`) was loaded at a 375px-wide mobile
viewport and checked for horizontal overflow (`document.documentElement.
scrollWidth` compared to the viewport width — a mismatch means something
doesn't fit and the page would show an unwanted horizontal scrollbar).
All pages passed with no overflow. The admissions form and the mobile
navigation menu were additionally checked visually by screenshot.

**Not yet checked at mobile width:** the staff/admin dashboard screens
(tables with many columns, like the student register or financial
report) — these are more likely than the public site to need a real
phone or tablet to evaluate properly, and are best reviewed once there's
real data in them.

## 6. What automated testing cannot verify (needs a live Supabase project)

These require real data and a real login, which this environment doesn't
have. Each workflow below is implemented and was exercised with inputs
that should trigger it (wrong password, missing required field, unauthenticated
access to a dashboard route, an unsigned webhook request) to confirm it
fails *safely* — but the success path, with real data, has not been
clicked through end to end.

## Live walkthrough checklist

Run through this once `docs/SETUP.md` is complete. Check each box only
after you've actually done it and seen the expected result — not before.

- [ ] Super Administrator login
- [ ] Create a staff account (teacher) and confirm the invite email arrives
- [ ] Role-based access: confirm a teacher account cannot open `/dashboard/admin`
- [ ] Register a student
- [ ] Submit a public admission application, then convert it to an
      enrolled student (confirm a parent account is created/linked)
- [ ] Link an existing parent account to a second child
- [ ] Create a class and assign a teacher to it
- [ ] Mark attendance for a class, then confirm a duplicate same-day entry
      is rejected
- [ ] Enter exam scores for a subject
- [ ] Confirm the computed grade, average and class position look correct
- [ ] Submit, approve, then publish a report card — confirm the parent
      can now see it and nobody else's child's report card
- [ ] Generate an invoice for a class
- [ ] Record a manual cash payment and confirm the outstanding balance drops
- [ ] Make a real (test-mode) Paystack payment and confirm it's only
      marked successful after the page/webhook round-trip — not instantly
- [ ] Download/view a payment receipt
- [ ] Confirm a parent can log in and see only their own child's data
- [ ] Generate each report under Reports and export one to CSV
- [ ] Re-check mobile responsiveness on the dashboard pages above, with
      real data in the tables
