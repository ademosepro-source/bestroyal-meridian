-- Tracks whether a staff/parent account still needs to change the
-- system-generated password it was created with. Defaults to true for
-- every new account; existing accounts (created before this migration)
-- are backfilled to false so nobody already using the system is
-- suddenly forced to change their password.
alter table public.profiles
  add column must_change_password boolean not null default true;

update public.profiles set must_change_password = false;

-- Keep auth.users.app_metadata in sync, same pattern as the role sync in
-- 0001_init.sql, so the middleware can check this on every request
-- without an extra database round trip.
create function public.sync_must_change_password_to_app_metadata()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('must_change_password', new.must_change_password)
  where id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_must_change_password
  after insert or update of must_change_password on public.profiles
  for each row execute function public.sync_must_change_password_to_app_metadata();
