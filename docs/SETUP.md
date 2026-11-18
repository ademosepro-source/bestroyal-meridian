# Setup Guide (No Coding Experience Required)

Follow these steps in order. Each one explains exactly what to click and
where to find what you need.

## 1. Install the tools you need (one-time, on your computer)

1. Install **Node.js** (version 20 or later): https://nodejs.org — download
   the "LTS" version and run the installer, clicking "Next" through the
   defaults.
2. Confirm it worked: open a terminal (PowerShell on Windows) and run:
   ```bash
   node -v
   ```
   You should see a version number like `v20.x.x` or higher.

## 2. Create your Supabase account and project

Supabase gives you a free PostgreSQL database plus user login/authentication
— this is where all school data will live.

1. Go to https://supabase.com and click **Start your project**.
2. Sign up (you can use your Google account or email).
3. Click **New project**.
4. Fill in:
   - **Name**: `bestroyal-meridian` (or anything you like)
   - **Database Password**: choose a strong password and **save it
     somewhere safe** (a password manager or a note you won't lose). You
     won't need to type this often, but you may need it later.
   - **Region**: pick the region closest to Nigeria (e.g. an EU or
     West-Africa-adjacent region — whichever Supabase offers that's
     nearest).
5. Click **Create new project** and wait a minute or two while Supabase sets
   it up.

## 3. Get your API keys

1. Once your project is ready, click the **Settings** (gear icon) in the
   left sidebar, then **API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string of letters and numbers
   - **service_role** key — another long string, further down the page.
     **This one is secret** — it lets code bypass all security rules. Phase 2
     features (creating staff accounts, converting an admission application
     into a student) need it on the server; never put it in anything that
     runs in the browser.
3. Keep this page open — you'll copy these into a file next.

## 4. Configure the project on your computer

1. In the project folder, find the file named `.env.example`.
2. Make a copy of it and rename the copy to `.env.local` (same folder).
3. Open `.env.local` in any text editor and replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=the-long-anon-key-you-copied
   SUPABASE_SERVICE_ROLE_KEY=the-long-service-role-key-you-copied
   ```
4. Save the file. **Never share this file or upload it anywhere public** —
   though the anon key is safe to expose in a browser by design, it's good
   habit to keep `.env.local` private; it is already excluded from Git via
   `.gitignore`.

## 5. Create the database tables

1. Back in Supabase, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/migrations/0001_init.sql` from this project in a
   text editor, copy its entire contents, and paste it into the Supabase SQL
   editor.
4. Click **Run**. You should see "Success. No rows returned."
5. Repeat the same steps with `supabase/migrations/0002_school_operations.sql`
   (adds subjects, admission applications and attendance — run it in a
   **new query**, after 0001).
6. Repeat with `supabase/migrations/0003_academics.sql` (adds grading,
   exam scores and report cards — after 0002).
7. Repeat with `supabase/migrations/0004_fees_payments.sql` (adds fee
   structures, invoices and payments — after 0003).
8. Repeat with `supabase/migrations/0005_communications.sql` (adds
   announcements, the school calendar and in-app notifications — after 0004).
9. Repeat with `supabase/migrations/0006_grants.sql` (grants the app's
   database roles permission to use these tables at all — without this
   step every page fails with "permission denied for table ..." even
   though every table's Row Level Security policy is correct).
10. Repeat once more with `supabase/seed.sql` to add starter data (academic
    session, terms, the Nursery/Primary 1–6 class list, subjects, assessment
    components, grade bands and fee categories).

Whenever a future phase adds a new `supabase/migrations/000N_*.sql` file,
run it the same way, in order, after the ones you've already run.

This creates every table described in the project's database design: user
profiles, roles, staff, students, parents, classes, sessions/terms, school
settings, and the audit log — along with the security rules (Row Level
Security) that keep, for example, one parent from ever seeing another
parent's child.

## 6. Set up online payments (Paystack)

This lets parents pay school fees from their own dashboard with a card or
bank transfer, and lets the Bursar record cash/POS/bank payments manually
either way.

1. Create a free account at https://paystack.com (choose Nigeria as your
   country).
2. In the Paystack dashboard, go to **Settings** → **API Keys & Webhooks**.
3. You'll see a **Test Secret Key** (starts `sk_test_`) and **Test Public
   Key** (starts `pk_test_`). Use these while you're testing — they don't
   move real money.
4. Add them to `.env.local`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   ```
5. Once the site is deployed (see `docs/DEPLOYMENT.md`) and you're ready to
   go live, on the same Paystack page click **Add Webhook** and enter:
   `https://your-deployed-domain/api/webhooks/paystack`
   This lets Paystack confirm payments even if a parent closes their
   browser right after paying.
6. When the school is ready to accept real payments, switch to Paystack's
   **Live** keys (starts `sk_live_` / `pk_live_`) in your production
   environment variables (on Vercel, not `.env.local`) — never put live
   keys in a file that could end up in Git.

The app never stores card details and never marks a payment successful
just because a browser redirected back — it always re-checks directly with
Paystack first (see `src/lib/payments/confirm.ts` if you want the details).

To test a payment without using a real card, see Paystack's own test card
numbers at https://paystack.com/docs/payments/test-payments — use one of
those while your keys are still in Test mode.

## 7. A note on announcements and notifications

Announcements, attendance alerts, payment confirmations and fee reminders
all appear in the **bell icon** inside the portal (top right, once signed
in) — that part works as soon as the database is set up, with no extra
account needed.

**Nobody receives an email or text message yet.** Setting that up means
choosing and paying for a provider (for email, something like Resend or
SendGrid; for SMS, something like Termii or Twilio) and is intentionally
left for later — the project's own rule is to never claim a message was
sent unless a real provider confirms it, and none is configured today. If
you'd like real email/SMS added later, that's a good next request.

## 8. Create your first Super Administrator account

The sign-up form isn't built yet (accounts are created by school
management, per the project's design) — so for your very first admin
account, create it directly in Supabase:

1. In Supabase, click **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Enter your email and a password, and click **Create user**.
3. Click on the user you just created, find **Raw User Meta Data** (or use
   the SQL Editor — see below), and make sure the account has the
   `super_admin` role. The easiest way is via SQL Editor:
   ```sql
   update public.profiles
   set role = 'super_admin'
   where email = 'your-email@example.com';
   ```
   Run that in the SQL Editor (with your real email) after creating the
   user — a profile row is created automatically when the user is added.

## 9. Run the website on your computer

1. Open a terminal in the project folder.
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000 in your browser — you should see the
   homepage.
4. Go to http://localhost:3000/login and sign in with the admin email and
   password you created in Step 8. You should land on the Super
   Administrator dashboard.

## Troubleshooting

- **"Incorrect email or password"** — double check the user exists under
  Authentication → Users in Supabase, and that you typed the password
  correctly.
- **Blank or broken-looking pages** — make sure `.env.local` has the correct
  Project URL and anon key, then stop (`Ctrl+C`) and restart `npm run dev`.
- **Nothing shows in the Super Administrator dashboard counts** — that's
  expected until you add students, staff, or classes (classes come
  pre-seeded by `seed.sql`).
