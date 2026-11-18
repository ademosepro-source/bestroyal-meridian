-- Table/sequence/function privileges for Supabase's anon/authenticated/
-- service_role Postgres roles. Row Level Security (enabled on every table
-- in the migrations above) still restricts which rows each role may see —
-- these grants only allow the role to attempt the query in the first
-- place. Without them, every request fails with "permission denied for
-- table ..." regardless of RLS policy, which is what happened the first
-- time this schema was run against a real project (discovered during
-- live testing, not caught by any earlier phase's automated checks since
-- those never ran against a real database).
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- So any table/sequence/function added by a future migration gets the
-- same grants automatically, without needing another file like this one.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
