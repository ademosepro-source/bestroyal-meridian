-- Phase 3 — Academic Management
-- Configurable grading, exam scores, and the report-card workflow:
-- Teacher entry -> Principal approval -> Publication -> Parent access.

-- ============================================================================
-- Configurable grading
-- ============================================================================
create table public.grade_bands (
  id uuid primary key default gen_random_uuid(),
  grade text not null,              -- e.g. "A", "B", "C"
  min_score numeric not null,
  max_score numeric not null,
  remark text not null,             -- e.g. "Excellent", "Good"
  created_at timestamptz not null default now(),
  check (min_score <= max_score)
);

-- Assessment components and their weight toward a subject's total
-- (e.g. 1st CA = 20, 2nd CA = 20, Exam = 60). The school admin configures
-- these; nothing about grading thresholds is hardcoded in the app.
create table public.assessment_components (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,        -- "1st CA", "2nd CA", "Exam"
  max_score numeric not null,
  order_index int not null,
  created_at timestamptz not null default now()
);

alter table public.grade_bands enable row level security;
alter table public.assessment_components enable row level security;

create policy "grade_bands: authenticated read" on public.grade_bands
  for select using (auth.role() = 'authenticated');
create policy "grade_bands: admin write" on public.grade_bands
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "assessment_components: authenticated read" on public.assessment_components
  for select using (auth.role() = 'authenticated');
create policy "assessment_components: admin write" on public.assessment_components
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- ============================================================================
-- Report cards — the approval workflow and the teacher/principal remarks.
-- Created before exam_scores because an exam_scores policy below references
-- it. Subject totals, grades, overall average and class position are
-- computed on demand from exam_scores + grade_bands, not duplicated here.
-- ============================================================================
create type public.report_card_status as enum (
  'draft',
  'submitted',
  'approved',
  'published'
);

create table public.report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  term_id uuid not null references public.terms (id) on delete cascade,
  teacher_comment text,
  principal_comment text,
  promotion_status text, -- e.g. "Promoted to Primary 4", set by the class teacher
  status public.report_card_status not null default 'draft',
  submitted_by uuid references public.profiles (id) on delete set null,
  submitted_at timestamptz,
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, term_id)
);

create trigger report_cards_set_updated_at
  before update on public.report_cards
  for each row execute function public.set_updated_at();

alter table public.report_cards enable row level security;

create policy "report_cards: admin principal manage" on public.report_cards
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

create policy "report_cards: class teacher manage while editable" on public.report_cards
  for all using (
    public.current_role() = 'teacher'
    and status in ('draft', 'submitted')
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = report_cards.class_id
        and tca.is_class_teacher
    )
  )
  with check (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = report_cards.class_id
        and tca.is_class_teacher
    )
  );

create policy "report_cards: parent reads published" on public.report_cards
  for select using (
    public.current_role() = 'parent'
    and status = 'published'
    and exists (
      select 1 from public.parent_student ps
      where ps.parent_id = auth.uid() and ps.student_id = report_cards.student_id
    )
  );

-- ============================================================================
-- Exam scores — one row per student, subject, term and assessment component
-- ============================================================================
create table public.exam_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  term_id uuid not null references public.terms (id) on delete cascade,
  component_id uuid not null references public.assessment_components (id) on delete cascade,
  score numeric not null check (score >= 0),
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_id, term_id, component_id)
);

create trigger exam_scores_set_updated_at
  before update on public.exam_scores
  for each row execute function public.set_updated_at();

create index exam_scores_lookup_idx on public.exam_scores (class_id, subject_id, term_id);

alter table public.exam_scores enable row level security;

create policy "exam_scores: admin principal manage" on public.exam_scores
  for all using (public.current_role() in ('super_admin', 'principal'))
  with check (public.current_role() in ('super_admin', 'principal'));

-- A teacher may enter/edit scores only for a subject+class they are assigned to teach.
create policy "exam_scores: subject teacher manage" on public.exam_scores
  for all using (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.subject_teachers st
      where st.teacher_id = auth.uid()
        and st.class_id = exam_scores.class_id
        and st.subject_id = exam_scores.subject_id
    )
  )
  with check (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.subject_teachers st
      where st.teacher_id = auth.uid()
        and st.class_id = exam_scores.class_id
        and st.subject_id = exam_scores.subject_id
    )
  );

-- The class teacher reads (but cannot edit) all subjects' scores for their
-- own class, so they can prepare the full report card.
create policy "exam_scores: class teacher reads all subjects" on public.exam_scores
  for select using (
    public.current_role() = 'teacher'
    and exists (
      select 1 from public.teacher_class_assignments tca
      where tca.teacher_id = auth.uid()
        and tca.class_id = exam_scores.class_id
        and tca.is_class_teacher
    )
  );

-- A parent may only see scores once the related report card has been published.
create policy "exam_scores: parent reads published" on public.exam_scores
  for select using (
    public.current_role() = 'parent'
    and exists (
      select 1 from public.parent_student ps
      where ps.parent_id = auth.uid() and ps.student_id = exam_scores.student_id
    )
    and exists (
      select 1 from public.report_cards rc
      where rc.student_id = exam_scores.student_id
        and rc.term_id = exam_scores.term_id
        and rc.status = 'published'
    )
  );

-- Audit trail: every status change (submit, approve, publish) is also
-- recorded in audit_logs by the application layer for a human-readable history.
