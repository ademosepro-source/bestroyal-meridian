-- Character development and psychomotor skills ratings on a report card.
-- Stored as jsonb maps of skill key -> rating (1-5) rather than one column
-- per skill, since the fixed set of skills lives in application code
-- (src/lib/academics/skills.ts), not the database.
alter table public.report_cards
  add column character_ratings jsonb not null default '{}'::jsonb,
  add column psychomotor_ratings jsonb not null default '{}'::jsonb;
