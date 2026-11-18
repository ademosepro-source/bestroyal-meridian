-- Phase 4 — Financial Management
-- Configurable fees, invoices, manual payment recording, and online
-- payments (verified server-side, never from a browser redirect alone).

-- ============================================================================
-- Fee categories & structures
-- ============================================================================
create table public.fee_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- "Tuition", "Development Levy", "Transport"...
  description text,
  created_at timestamptz not null default now()
);

-- What a class is charged, per term, per category. The admin/bursar
-- configures this — no amount is ever hardcoded in the app.
create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  term_id uuid not null references public.terms (id) on delete cascade,
  fee_category_id uuid not null references public.fee_categories (id) on delete cascade,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (class_id, term_id, fee_category_id)
);

alter table public.fee_categories enable row level security;
alter table public.fee_structures enable row level security;

create policy "fee_categories: authenticated read" on public.fee_categories
  for select using (auth.role() = 'authenticated');
create policy "fee_categories: finance manage" on public.fee_categories
  for all using (public.current_role() in ('super_admin', 'bursar'))
  with check (public.current_role() in ('super_admin', 'bursar'));

create policy "fee_structures: authenticated read" on public.fee_structures
  for select using (auth.role() = 'authenticated');
create policy "fee_structures: finance manage" on public.fee_structures
  for all using (public.current_role() in ('super_admin', 'bursar'))
  with check (public.current_role() in ('super_admin', 'bursar'));

-- ============================================================================
-- Invoices — generated for a student + term from the fee structure that
-- applied at that moment (so later fee changes never rewrite an issued bill).
-- ============================================================================
create sequence public.invoice_number_seq;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  term_id uuid not null references public.terms (id) on delete cascade,
  due_date date,
  generated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, term_id)
);

create function public.generate_invoice_number()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'INV-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger invoices_generate_number
  before insert on public.invoices
  for each row execute function public.generate_invoice_number();

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  fee_category_id uuid references public.fee_categories (id) on delete set null,
  description text not null,
  amount numeric not null check (amount >= 0)
);

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create policy "invoices: finance manage" on public.invoices
  for all using (public.current_role() in ('super_admin', 'bursar'))
  with check (public.current_role() in ('super_admin', 'bursar'));

create policy "invoices: parent reads own child" on public.invoices
  for select using (
    public.current_role() = 'parent'
    and exists (select 1 from public.parent_student ps where ps.parent_id = auth.uid() and ps.student_id = invoices.student_id)
  );

create policy "invoice_items: finance manage" on public.invoice_items
  for all using (public.current_role() in ('super_admin', 'bursar'))
  with check (public.current_role() in ('super_admin', 'bursar'));

create policy "invoice_items: parent reads own child" on public.invoice_items
  for select using (
    public.current_role() = 'parent'
    and exists (
      select 1 from public.invoices i
      join public.parent_student ps on ps.student_id = i.student_id
      where i.id = invoice_items.invoice_id and ps.parent_id = auth.uid()
    )
  );

-- ============================================================================
-- Payments — manual (cash/bank transfer/POS) and online (Paystack).
-- A bank transfer starts "pending" until a staff member verifies it;
-- cash/POS and a server-verified online payment are "successful" at once.
-- ============================================================================
create type public.payment_method as enum (
  'cash',
  'bank_transfer',
  'pos',
  'paystack'
);

create type public.payment_status as enum (
  'pending',
  'successful',
  'failed',
  'reversed'
);

create sequence public.receipt_number_seq;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  amount numeric not null check (amount > 0),
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  reference text not null unique, -- internal reference, or the Paystack transaction reference
  receipt_number text unique,
  recorded_by uuid references public.profiles (id) on delete set null,
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  paid_at timestamptz,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create function public.generate_receipt_number()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'successful' and (new.receipt_number is null or new.receipt_number = '') then
    new.receipt_number := 'RCT-' || lpad(nextval('public.receipt_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger payments_generate_receipt_number
  before insert or update on public.payments
  for each row execute function public.generate_receipt_number();

create index payments_invoice_idx on public.payments (invoice_id);

alter table public.payments enable row level security;

create policy "payments: finance manage" on public.payments
  for all using (public.current_role() in ('super_admin', 'bursar'))
  with check (public.current_role() in ('super_admin', 'bursar'));

create policy "payments: parent reads own child" on public.payments
  for select using (
    public.current_role() = 'parent'
    and exists (select 1 from public.parent_student ps where ps.parent_id = auth.uid() and ps.student_id = payments.student_id)
  );

-- The online-payment callback/webhook routes run without a logged-in user
-- (Paystack calls the server directly), so they use the service-role key
-- and bypass RLS entirely — the application code verifies the transaction
-- with Paystack itself before writing anything, which is the real security
-- boundary for that path, not these policies.
