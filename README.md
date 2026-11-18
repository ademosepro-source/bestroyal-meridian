# BestRoyal Meridian Nursery & Primary School

_Soaring for Excellence_

A public school website and School Management Information System (SMIS),
built with Next.js, TypeScript, Tailwind CSS and Supabase (PostgreSQL).

## Project status: Phase 7 — Testing & Deployment ✅

All seven phases of the original build plan are complete. The project is
feature-complete and ready to deploy (see `docs/DEPLOYMENT.md`) as soon as
you've followed `docs/SETUP.md`.

**Phase 1 — Foundation**
- Public website homepage and stub pages (About, Academics, News, Gallery, Contact).
- Database schema covering users/roles, staff, students, parents, classes,
  academic sessions/terms, school settings, and an audit log — all with
  Row Level Security.
- Secure authentication with role-based dashboards for all six roles.

**Phase 2 — School Operations**
- **Student management**: register, search/filter, edit, transfer between
  classes, and change status (active/withdrawn/graduated). Admission
  numbers are generated automatically and duplicate records are blocked.
- **Staff management**: the Super Administrator creates staff accounts
  (teacher, principal, bursar, admissions officer), which emails the staff
  member an invite to set their own password. Staff numbers are generated
  automatically.
- **Classes, arms & subjects**: admins manage the class structure, add
  subjects, and assign teachers to classes/subjects — this is what powers
  "a teacher only sees their own class" everywhere else in the system.
- **Academic sessions & terms**: create sessions/terms and mark one of each
  as "current."
- **Admissions**: a real public application form on `/admissions`, an
  admissions dashboard to review/accept/reject applications, and one-click
  conversion of an accepted application into an enrolled student (with a
  parent login account created automatically if needed).
- **Attendance**: teachers mark daily attendance for their assigned class
  (one entry per student per day, enforced by the database); admins/
  principals see a school-wide daily overview; parents see their child's
  recent attendance.

**Phase 3 — Academic Management**
- **Grading configuration**: admins define assessment components (e.g. 1st
  CA, 2nd CA, Exam) and grade bands (e.g. A = 70–100 = Excellent) — nothing
  about grading thresholds is hardcoded in the app.
- **Score entry**: subject teachers enter component scores per student,
  scoped to only the subjects/classes they are assigned to teach.
- **Automatic calculations**: subject totals, grades, overall averages and
  class positions are computed live from entered scores — never stored
  redundantly, so they can never go stale.
- **Report card workflow**: Teacher entry → class teacher submits with
  comments → Principal approves → Super Administrator publishes → parent
  can view. Every step is logged to the audit trail.
- **Printable report card**: a dedicated page matching the required layout
  (crest, pupil details, subject table, attendance summary, comments,
  signature lines) with a "Print / Save as PDF" button — uses the browser's
  own print-to-PDF, so no extra software or accounts are needed.

**Phase 4 — Financial Management**
- **Fee configuration**: fee categories (tuition, registration, development
  levy, exam fee, books, uniform, transport...) and per-class, per-term fee
  structures — fully configurable, nothing hardcoded.
- **Invoicing**: bulk-generate invoices for a class/term from the fee
  structure; each invoice snapshots its line items so later fee changes
  never rewrite an already-issued bill.
- **Manual payments**: the Bursar records cash, POS or bank transfer
  payments. Cash/POS count immediately; a bank transfer stays "pending"
  until a staff member verifies it. Reversing a payment is admin-only, and
  every record keeps who recorded it, with a full audit trail.
- **Online payments (Paystack)**: parents pay outstanding balances from
  their dashboard. A payment is **only** ever marked successful after the
  server independently re-verifies it with Paystack — never from a browser
  redirect alone — via both a callback route and a signed webhook, so a
  closed browser tab can't leave a paid invoice looking unpaid. No card
  details ever touch this server.
- **Receipts**: an automatically numbered, printable receipt for every
  successful payment.
- **Financial dashboards**: the Bursar and Super Administrator see live
  totals (expected, collected, outstanding) computed straight from the
  database — nothing is a hardcoded sample figure.

**Phase 5 — Communication & Notifications**
- **Announcements**: the Super Administrator or Principal publishes to the
  public website, every parent, every staff member, or one specific class —
  the right people are notified automatically.
- **School calendar**: resumption dates, exams, holidays and events, shown
  on the public website and the News & Events page.
- **In-app notification centre**: a bell icon in every portal page surfaces
  announcements, a published report card, a confirmed payment, a same-day
  absence, and bursar-triggered fee reminders — each one links straight to
  the relevant page.
- **Today's Birthdays**: a privacy-conscious, staff-only widget on the
  admin dashboard (month/day only — no age, never shown publicly).
- **Honest about what's not automated**: nothing here sends an actual email
  or SMS — that needs a paid provider the school hasn't chosen yet — so the
  app never pretends a message left the building. See `docs/SETUP.md`.

**Phase 6 — Reporting & Analytics**
- A **Reports** section (role-filtered — each role sees only reports it's
  entitled to) covering:
  - **Student Register** — every student, filterable by class and status.
  - **Admission Register** — applications, filterable by status and date.
  - **Attendance Report** — per-student present/absent/late/excused counts
    and attendance % for a class and term.
  - **Academic Performance** — class results, overall averages and class
    positions, computed live (see Phase 3) rather than stored.
  - **Financial Report** — payment history and collections-by-method for
    any date range, plus outstanding balances by student for a term.
- Every report supports filtering by class, session, term or date range,
  and can be **exported to CSV** or **printed** (same browser print-to-PDF
  used for report cards and receipts).

**Phase 7 — Testing & Deployment**
- **Automated unit tests** (`npm test`, Vitest) for the calculation logic
  everything else depends on: grading/ranking, invoice balances, role
  tables, and the Paystack webhook signature check.
- **Security review**: confirmed Row Level Security is enabled on every
  table, every use of the service-role client is gated by a role check
  or independent payment verification, no secrets are committed, `npm
  audit` is clean, and the admin client is never reachable from
  client-side code.
- **Mobile responsiveness**: every public page checked at a 375px
  viewport for horizontal overflow.
- **`docs/TESTING_REPORT.md`**: an honest account of what's been verified
  automatically versus what still needs a real login and real data to
  confirm (a checklist for that is included).
- **`docs/ADMIN_MANUAL.md`**: a plain-language guide to every dashboard
  screen, written for school staff, not developers.
- **`docs/DEPLOYMENT.md`**: updated with the full environment variable
  list, connecting Paystack's webhook to the live site, switching to
  real payments, and a pre-launch checklist.

This completes all seven phases of the original build plan.

## Tech stack

| Layer          | Choice                                   |
| -------------- | ----------------------------------------- |
| Frontend       | Next.js 16 (App Router), TypeScript        |
| Styling        | Tailwind CSS v4                            |
| Icons          | lucide-react                               |
| Database       | PostgreSQL via Supabase                    |
| Auth           | Supabase Auth (email + password), RBAC via Postgres Row Level Security |
| Validation     | zod                                        |
| Hosting        | Vercel (recommended) + Supabase            |

## Getting started

**You don't need to know how to code to get this running** — follow
[`docs/SETUP.md`](docs/SETUP.md) step by step. It explains exactly what
account to create (Supabase), where to find your API keys, and how to enter
them. Once set up:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To run the automated unit tests (no Supabase connection needed for these):

```bash
npm test
```

## Documentation

- [`docs/SETUP.md`](docs/SETUP.md) — create your Supabase project, run the
  database schema, create your first admin account, and run the site
  locally.
- [`docs/ADMIN_MANUAL.md`](docs/ADMIN_MANUAL.md) — how to actually use the
  portal day to day, for school staff (not developers).
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — put the site live on the
  internet, connect Paystack, and a pre-launch checklist.
- [`docs/BACKUP_RECOVERY.md`](docs/BACKUP_RECOVERY.md) — how your school's
  data is backed up, and how to restore it if something goes wrong.
- [`docs/TESTING_REPORT.md`](docs/TESTING_REPORT.md) — what's been tested
  and how, and a checklist for the live testing only you can do.

## Project structure

```
src/
  app/              Pages (App Router) — homepage, stub pages, login, dashboards
  components/
    ui/             Small reusable pieces (Button, Container, EmptyState...)
    layout/         Navbar, Footer, PageHeader
    home/           Homepage sections
    dashboard/      Dashboard widgets
  lib/
    supabase/       Database client setup (browser, server, middleware)
    auth/           Role definitions and access rules
    data/           Server-side data-fetching helpers
  types/
    database.ts     TypeScript types matching the database schema
supabase/
  migrations/       SQL that creates the database schema
  seed.sql          Starter data (academic session, terms, classes)
reference-assets/   The school logo and the Udema design reference
```
