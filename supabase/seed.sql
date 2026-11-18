-- Demo/starter data. Safe to run once against a fresh database.
-- Replace the placeholder contact details in school_settings from the admin
-- dashboard once that module ships — do not treat them as real.

insert into public.school_settings (id, school_name, motto, address, phone, email)
values (
  true,
  'BestRoyal Meridian Nursery & Primary School',
  'Soaring for Excellence',
  'Alagbado, Lagos State',
  '+2348070911506',
  'bestroyalmeridianschool@gmail.com'
)
on conflict (id) do nothing;

insert into public.academic_sessions (name, start_date, end_date, is_current)
values ('2025/2026', '2025-09-01', '2026-07-31', true)
on conflict (name) do nothing;

insert into public.terms (session_id, name, start_date, end_date, is_current)
select id, 'First Term', '2025-09-01', '2025-12-12', true
from public.academic_sessions where name = '2025/2026'
on conflict (session_id, name) do nothing;

insert into public.terms (session_id, name, start_date, end_date, is_current)
select id, 'Second Term', '2026-01-05', '2026-04-03', false
from public.academic_sessions where name = '2025/2026'
on conflict (session_id, name) do nothing;

insert into public.terms (session_id, name, start_date, end_date, is_current)
select id, 'Third Term', '2026-04-20', '2026-07-31', false
from public.academic_sessions where name = '2025/2026'
on conflict (session_id, name) do nothing;

insert into public.classes (name, level, order_index) values
  ('Pre-School (Gold)', 'nursery', 1),
  ('Pre-School (Silver)', 'nursery', 2),
  ('Nursery One', 'nursery', 3),
  ('Nursery Two', 'nursery', 4),
  ('Year One', 'primary', 5),
  ('Year Two', 'primary', 6),
  ('Year Three', 'primary', 7),
  ('Year Four', 'primary', 8),
  ('Year Five', 'primary', 9)
on conflict (name) do nothing;

insert into public.class_arms (class_id, name)
select id, 'A' from public.classes
on conflict (class_id, name) do nothing;

insert into public.subjects (name, code, level) values
  ('English Language', 'ENG', null),
  ('Mathematics', 'MTH', null),
  ('Basic Science', 'SCI', 'primary'),
  ('Social Studies', 'SOC', 'primary'),
  ('Creative Arts', 'ART', null),
  ('Phonics', 'PHO', 'nursery'),
  ('Numeracy', 'NUM', 'nursery'),
  ('Handwriting', 'HWR', null),
  ('Physical Education', 'PE', null)
on conflict (name) do nothing;

insert into public.assessment_components (name, max_score, order_index) values
  ('1st CA', 20, 1),
  ('2nd CA', 20, 2),
  ('Exam', 60, 3)
on conflict (name) do nothing;

insert into public.grade_bands (grade, min_score, max_score, remark) values
  ('A', 70, 100, 'Excellent'),
  ('B', 60, 69, 'Very Good'),
  ('C', 50, 59, 'Good'),
  ('D', 40, 49, 'Fair'),
  ('F', 0, 39, 'Fail')
on conflict do nothing;

insert into public.fee_categories (name, description) values
  ('Tuition', 'Core tuition fee for the term'),
  ('Registration', 'New admission registration fee'),
  ('Development Levy', 'Contribution toward school facilities'),
  ('Examination Fee', 'Termly examination fee'),
  ('Books & Learning Materials', 'Textbooks and classroom materials'),
  ('Uniform', 'School uniform'),
  ('Transport', 'School bus service (opt-in)')
on conflict (name) do nothing;
