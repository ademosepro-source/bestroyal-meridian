-- Phase 2 — School Operations
-- Subjects & teaching assignments, admission applications, attendance,
-- automatic admission numbers.

-- ============================================================================
-- Automatic, unique admission numbers (e.g. BRM-2025-0001)
-- ============================================================================
create sequence public.admission_number_seq;

create function public.generate_admission_number()
returns trigger
language plpgsql
as $$
begin
  if new.admission_number is null or new.admission_number = '' then
    new.admission_number := 'BRM-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.admission_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger students_generate_admission_number
  before insert on public.students
  for each row execute function public.generate_admission_number();

create sequence public.staff_number_seq;

create function public.generate_staff_number()
returns trigger
language plpgsql
as $$
begin
  if new.staff_number is null or new.staff_number = '' then
    new.staff_number := 'STF-' || lpad(nextval('public.staff_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger staff_generate_staff_number
  before insert on public.staff
  for each row execute function public.generate_staff_number();

-- ============================================================================
-- Subjects & teaching assignments
-- ============================================================================
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  level public.school_level,
  created_at timestamptz not null default now()
);

-- Which teacher teaches which subject to which class — one teacher per
-- subject per class. Builds on teacher_class_assignments from Phase 1.
create table public.subject_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  teacher_id uuid not null references public.staff (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id)
);

alter table public.subjects enable row level security;
alter table public.subject_teachers enable row level security;

create policy "subjects: authenticated read" on public.subjects
  for select using (auth.role() = 'authenticated');
create policy "subjects: admin write" on public.subjects
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "subject_teachers: teacher reads own" on public.subject_teachers
  for select using (teacher_id = auth.uid());
create policy "subject_teachers: admin manage" on public.subject_teachers
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- ============================================================================
-- Admission applications
-- ============================================================================
create type public.application_status as enum (
  'pending',
  'under_review',
  'accepted',
  'rejected',
  'enrolled'
);

create table public.admission_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_first_name text not null,
  applicant_middle_name text,
  applicant_surname text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female')),
  desired_class_id uuid references public.classes (id) on delete set null,
  desired_session_id uuid references public.academic_sessions (id) on delete set null,
  previous_school text,
  parent_full_name text not null,
  parent_phone text not null,
  parent_email text not null,
  parent_relationship text not null default 'parent',
  home_address text,
  status public.application_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  review_notes text,
  enrolled_student_id uuid references public.students (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger admission_applications_set_updated_at
  before update on public.admission_applications
  for each row execute function public.set_updated_at();

create index admission_applications_status_idx on public.admission_applications (status);

alter table public.admission_applications enable row level security;

-- Anyone (including an anonymous website visitor) may submit an application,
-- but only staff who handle admissions may ever read one back.
create policy "applications: public can submit" on public.admission_applications
  for insert with check (true);

create policy "applications: staff read" on public.admission_applications
  for select using (public.current_role() in ('super_admin', 'principal', 'admissions_officer'));

create policy "applications: staff update" on public.admission_applications
  for update using (public.current_role() in ('super_admin', 'admissions_officer'))
  with check (public.current_role() in ('super_admin', 'admissions_officer'));

-- ============================================================================
-- Attendance
-- ============================================================================
create type public.attendance_status as enum (
  'present',
  'absent',
  'late',
  'excused'
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  class_arm_id uuid references public.class_arms (id) on delete set null,
  term_id uuid references public.terms (id) on delete set null,
  date date not null,
  status public.attendance_status not null,
  remarks text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create index attendance_records_class_date_idx on public.attendance_records (class_id, date);

alter table public.attendance_records enable row level security;

create policy "attendance: admin principal read" on public.attendance_records
  for select using (public.current_role() in ('super_admin', 'principal'));

create policy "attendance: teacher manage own class" on public.attendance_records
  for all using (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = attendance_records.class_id
        and (tca.class_arm_id is null or tca.class_arm_id = attendance_records.class_arm_id)
    )
  )
  with check (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = attendance_records.class_id
        and (tca.class_arm_id is null or tca.class_arm_id = attendance_records.class_arm_id)
    )
  );

create policy "attendance: parent reads own child" on public.attendance_records
  for select using (
    public.current_role() = 'parent'
    and exists (
      select 1 from public.parent_student ps
      where ps.parent_id = auth.uid() and ps.student_id = attendance_records.student_id
    )
  );
