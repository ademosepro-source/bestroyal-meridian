# Backup & Recovery Guide

The school's real data (students, staff, parents, and in later phases,
grades and payments) lives in your Supabase PostgreSQL database — not in
this code project. Protecting that data is about protecting the Supabase
project.

## Automatic backups (built into Supabase)

- **Free plan**: Supabase keeps a rolling set of automatic daily backups for
  a limited number of days.
- **Pro plan and above**: longer backup retention, plus **Point-in-Time
  Recovery (PITR)**, which lets you restore the database to almost any
  moment in time (useful if, say, data is accidentally deleted at 2pm — you
  can restore to 1:59pm).

To see your current plan and backup settings: Supabase dashboard →
**Settings** → **Add-ons** / **Database** → **Backups**.

**Recommendation:** once real student and financial data is in the system,
upgrade to at least the Pro plan for PITR. This is a cost decision for
school management, not a technical one — flag it when real data entry
begins.

## Manual backups (extra safety, and before any risky change)

Before running a new database migration, or at planned intervals, take a
manual export:

1. Install the Supabase CLI (one-time): https://supabase.com/docs/guides/cli
2. Log in and link it to your project (instructions on that page).
3. Run:
   ```bash
   supabase db dump --db-url "your-connection-string" -f backup.sql
   ```
   Your connection string is in Supabase → **Settings** → **Database** →
   **Connection string**.
4. Store `backup.sql` somewhere safe — ideally not on the same computer as
   your only other copy (e.g. a cloud drive or external storage).

## Restoring from a backup

- **Point-in-time recovery**: Supabase dashboard → **Database** →
  **Backups** → choose a timestamp → **Restore**. Supabase walks you
  through the rest.
- **A manual `backup.sql` file**: this requires running the SQL file against
  your database — recommended to do with a developer's help the first time,
  since restoring the wrong way can overwrite current data.

## A simple backup routine to start with

Until the school upgrades to a paid plan with PITR:

1. Once a week, take a manual export (steps above).
2. Keep at least the last 4 weekly backups.
3. Before any major change (a new feature rollout, a bulk data import),
   take an extra backup first.
