# Deployment Guide

Once you're happy with the site locally (see `docs/SETUP.md`), put it live
on the internet with **Vercel** (made by the same team as Next.js — free
for a project like this to start).

## 1. Put the project on GitHub

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository (e.g. `bestroyal-meridian`).
3. From the project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/bestroyal-meridian.git
   git push -u origin main
   ```

## 2. Import the project into Vercel

1. Go to https://vercel.com and sign up/sign in (you can use your GitHub
   account).
2. Click **Add New** → **Project**, then select your `bestroyal-meridian`
   repository.
3. Vercel will auto-detect it's a Next.js project — leave the default
   settings.
4. Before clicking Deploy, open **Environment Variables** and add every
   value from your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **never** mark this one "Exposed to
     browser" / public; it must stay a server-only secret.
   - `PAYSTACK_SECRET_KEY` — start with the `sk_test_...` key until the
     school is ready to take real payments (see step 6 below).
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
5. Click **Deploy**. After a minute, Vercel gives you a live URL like
   `https://bestroyal-meridian.vercel.app`.

## 3. Point your own domain (optional)

If the school has a domain name (e.g. `bestroyalmeridian.edu.ng`):

1. In Vercel, open your project → **Settings** → **Domains** → add the
   domain.
2. Vercel shows you DNS records to add at your domain registrar (wherever
   you bought the domain). Add those records there.
3. Wait for DNS to update (can take a few minutes to a few hours).

## 4. Every future update

Whenever you (or your developer) push new code to the `main` branch on
GitHub, Vercel automatically rebuilds and redeploys the live site — no
manual steps needed.

## 5. Connect Paystack to your live site

Back in your Paystack dashboard → **Settings** → **API Keys & Webhooks**
→ **Add Webhook**, enter:

```
https://your-deployed-domain/api/webhooks/paystack
```

This lets Paystack confirm a payment even if the parent's browser closes
right after paying — without it, payments still work, but rely only on
the browser redirect to trigger the (always re-verified) confirmation.

## 6. Going live with real payments

While `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` are the
`sk_test_...` / `pk_test_...` keys, no real money moves — this is the
safe default and what this project ships with. When the school is ready:

1. In Paystack, switch to **Live** mode and copy the `sk_live_...` /
   `pk_live_...` keys.
2. In Vercel → your project → **Settings** → **Environment Variables**,
   replace the two Paystack values with the live keys.
3. Redeploy (Vercel → **Deployments** → **Redeploy**, or just push any
   small change to `main`).
4. Make one small real payment yourself first, end to end, before telling
   parents the system is live.

## Keeping Supabase and the live site in sync

If you add new database tables or columns later (future phases will ship
new `supabase/migrations/*.sql` files), run each new migration file in the
Supabase **SQL Editor** for your **production** project the same way you
did in `docs/SETUP.md` step 5 — migrations do not run automatically.

## Pre-launch checklist

Before telling parents and staff the site is live:

- [ ] All migrations (`0001` through `0005`) and `seed.sql` have been run
      against the **production** Supabase project (a separate one from
      any you used for local testing, or the same one — just make sure
      it's the one your live site's env vars point to).
- [ ] A real Super Administrator account exists (not a test one) and you
      can log in with it.
- [ ] School contact details, address and motto are set correctly under
      the admin dashboard (not the seeded placeholders).
- [ ] At least one academic session and term exist, with one marked
      "current."
- [ ] Fee categories and amounts are set for the current term, if the
      school plans to invoice this term.
- [ ] Paystack is in **Live** mode with a webhook configured (see step 6),
      or deliberately left in Test mode if going live in stages.
- [ ] You've read `docs/TESTING_REPORT.md`'s live walkthrough checklist
      and been through it yourself at least once.
