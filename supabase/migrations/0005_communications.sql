-- Phase 5 — Communication & Notifications
-- Announcements, the school calendar, and an in-app notification centre.
-- Email/SMS are intentionally not wired here (see docs/SETUP.md) — the
-- project rule is never to claim a message was sent unless a real provider
-- confirms it, and no provider has been configured yet.

-- ============================================================================
-- Announcements
-- ============================================================================
create type public.announcement_audience as enum (
  'public',  -- shown on the website and to everyone signed in
  'parents', -- every parent
  'staff',   -- every staff member
  'class'    -- parents (and the class teacher) of one specific class
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience public.announcement_audience not null default 'public',
  class_id uuid references public.classes (id) on delete cascade,
  is_published boolean not null default true,
  published_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (audience <> 'class' or class_id is not null)
);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

create policy "announcements: public read" on public.announcements
  for select using (is_published and audience = 'public');

create policy "announcements: parents read targeted" on public.announcements
  for select using (
    is_published
    and public.current_role() = 'parent'
    and (
      audience = 'parents'
      or (
        audience = 'class'
        and exists (
          select 1 from public.students s
          join public.parent_student ps on ps.student_id = s.id
          where ps.parent_id = auth.uid() and s.class_id = announcements.class_id
        )
      )
    )
  );

create policy "announcements: staff read targeted" on public.announcements
  for select using (
    is_published
    and auth.role() = 'authenticated'
    and public.current_role() <> 'parent'
    and (
      audience = 'staff'
      or (audience = 'class' and exists (
        select 1 from public.teacher_class_assignments tca
        where tca.teacher_id = auth.uid() and tca.class_id = announcements.class_id
      ))
    )
  );

create policy "announcements: admin principal manage" on public.announcements
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- ============================================================================
-- School calendar / events
-- ============================================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  location text,
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events: public read published" on public.events
  for select using (is_published);

create policy "events: admin principal manage" on public.events
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- ============================================================================
-- In-app notification centre
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type text not null, -- "announcement", "report_card", "payment", "attendance", "fee_reminder", "admission"
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, is_read);

alter table public.notifications enable row level security;

create policy "notifications: self read" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "notifications: self mark read" on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Any signed-in staff member may create a notification for someone else —
-- this is how the app surfaces a published report card, a confirmed
-- payment, an absence, or a fee reminder to the right parent. There is
-- nothing sensitive in being able to queue a notification; reading one
-- back is restricted to its recipient above.
create policy "notifications: staff create for others" on public.notifications
  for insert with check (public.current_role() <> 'parent');
