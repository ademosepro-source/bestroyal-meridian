-- BestRoyal Meridian Nursery & Primary School — Phase 1 schema
-- Users, roles, school structure, and the audit log that every later phase builds on.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- Roles
-- ============================================================================
create type public.user_role as enum (
  'super_admin',
  'principal',
  'teacher',
  'bursar',
  'admissions_officer',
  'parent'
);

create type public.student_status as enum (
  'active',
  'withdrawn',
  'graduated'
);

create type public.school_level as enum (
  'nursery',
  'primary'
);

-- ============================================================================
-- updated_at helper
-- ============================================================================
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — one row per authenticated user (staff, admins, parents)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role not null,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Keep auth.users.app_metadata.role in sync so middleware/JWT checks never
-- need an extra database round trip.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'parent')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.sync_role_to_app_metadata()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

create trigger profiles_sync_role
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_to_app_metadata();

-- ============================================================================
-- School settings — singleton row the admin edits from the dashboard
-- ============================================================================
create table public.school_settings (
  id boolean primary key default true constraint single_row check (id),
  school_name text not null default 'BestRoyal Meridian Nursery & Primary School',
  motto text not null default 'Soaring for Excellence',
  address text,
  phone text,
  email text,
  map_embed_url text,
  logo_url text,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger school_settings_set_updated_at
  before update on public.school_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Academic structure
-- ============================================================================
create table public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- e.g. "2025/2026"
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_current_session
  on public.academic_sessions (is_current)
  where is_current;

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.academic_sessions (id) on delete cascade,
  name text not null, -- "First Term" / "Second Term" / "Third Term"
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, name)
);

create unique index one_current_term
  on public.terms (is_current)
  where is_current;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- "Nursery 1", "Primary 5"
  level public.school_level not null,
  order_index int not null,
  created_at timestamptz not null default now()
);

create table public.class_arms (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  name text not null, -- "A", "B"
  created_at timestamptz not null default now(),
  unique (class_id, name)
);

-- ============================================================================
-- Staff
-- ============================================================================
create table public.staff (
  id uuid primary key references public.profiles (id) on delete cascade,
  staff_number text not null unique,
  position text not null,
  department text,
  date_joined date not null default current_date,
  created_at timestamptz not null default now()
);

-- Which class(es)/arm a teacher is assigned to — the basis for "teachers may
-- only access their own classes" everywhere else in the system.
create table public.teacher_class_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.staff (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  class_arm_id uuid references public.class_arms (id) on delete cascade,
  is_class_teacher boolean not null default false,
  created_at timestamptz not null default now(),
  unique (teacher_id, class_id, class_arm_id)
);

-- ============================================================================
-- Students & parents
-- ============================================================================
create table public.students (
  id uuid primary key default gen_random_uuid(),
  admission_number text not null unique,
  first_name text not null,
  middle_name text,
  surname text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female')),
  photo_url text,
  class_id uuid references public.classes (id) on delete set null,
  class_arm_id uuid references public.class_arms (id) on delete set null,
  admission_session_id uuid references public.academic_sessions (id),
  admission_date date not null default current_date,
  previous_school text,
  home_address text,
  medical_notes text, -- restricted-access field; see RLS policy below
  status public.student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

create index students_class_idx on public.students (class_id, class_arm_id);

create table public.parent_student (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  relationship text not null default 'guardian', -- mother/father/guardian
  is_primary_contact boolean not null default false,
  primary key (parent_id, student_id)
);

-- ============================================================================
-- Audit log — every later phase (fees, results, admin changes) writes here
-- ============================================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.school_settings enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.terms enable row level security;
alter table public.classes enable row level security;
alter table public.class_arms enable row level security;
alter table public.staff enable row level security;
alter table public.teacher_class_assignments enable row level security;
alter table public.students enable row level security;
alter table public.parent_student enable row level security;
alter table public.audit_logs enable row level security;

-- Helper: current user's role, read from their own profile row.
create function public.current_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- profiles: everyone can read their own row; admins/principal read & manage all.
create policy "profiles: self read" on public.profiles
  for select using (id = auth.uid());

create policy "profiles: self update (no role change)" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin full access" on public.profiles
  for all using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

create policy "profiles: principal read" on public.profiles
  for select using (public.current_role() = 'principal');

-- school_settings: publicly readable (powers the public website); only admin writes.
create policy "school_settings: public read" on public.school_settings
  for select using (true);

create policy "school_settings: admin write" on public.school_settings
  for all using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

-- academic structure: readable by any authenticated staff/parent; writable by admin/principal.
create policy "sessions: authenticated read" on public.academic_sessions
  for select using (auth.role() = 'authenticated');
create policy "sessions: admin write" on public.academic_sessions
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "terms: authenticated read" on public.terms
  for select using (auth.role() = 'authenticated');
create policy "terms: admin write" on public.terms
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "classes: authenticated read" on public.classes
  for select using (auth.role() = 'authenticated');
create policy "classes: admin write" on public.classes
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "class_arms: authenticated read" on public.class_arms
  for select using (auth.role() = 'authenticated');
create policy "class_arms: admin write" on public.class_arms
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- staff: self read; admin/principal manage all.
create policy "staff: self read" on public.staff
  for select using (id = auth.uid());
create policy "staff: admin manage" on public.staff
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "assignments: teacher reads own" on public.teacher_class_assignments
  for select using (teacher_id = auth.uid());
create policy "assignments: admin manage" on public.teacher_class_assignments
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- students: admin/principal see all; teachers see only their assigned classes;
-- parents see only their linked children.
create policy "students: admin principal read" on public.students
  for select using (public.current_role() in ('super_admin', 'principal'));
create policy "students: admin principal write" on public.students
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "students: teacher reads assigned class" on public.students
  for select using (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = students.class_id
        and (tca.class_arm_id is null or tca.class_arm_id = students.class_arm_id)
    )
  );

create policy "students: parent reads own child" on public.students
  for select using (
    public.current_role() = 'parent'
    and exists (
      select 1 from public.parent_student ps
      where ps.parent_id = auth.uid() and ps.student_id = students.id
    )
  );

create policy "students: admissions officer read" on public.students
  for select using (public.current_role() = 'admissions_officer');

-- parent_student: parents read their own links; admin/admissions manage all.
create policy "parent_student: parent reads own" on public.parent_student
  for select using (parent_id = auth.uid());
create policy "parent_student: admin manage" on public.parent_student
  for all using (public.current_role() in ('super_admin', 'admissions_officer'))
  with check (public.current_role() in ('super_admin', 'admissions_officer'));

-- audit_logs: admin-only read; every authenticated user may insert (their own actions).
create policy "audit_logs: admin read" on public.audit_logs
  for select using (public.current_role() = 'super_admin');
create policy "audit_logs: self insert" on public.audit_logs
  for insert with check (actor_id = auth.uid());
