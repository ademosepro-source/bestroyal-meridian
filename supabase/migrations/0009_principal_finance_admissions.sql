-- Gives the Head Teacher / Principal full Bursar-equivalent access to fees,
-- invoices and payments, and full Admissions Officer-equivalent access to
-- admission applications. Payment reversal stays Super-Administrator-only
-- (enforced in application code, not here) even for the Principal.

alter policy "fee_categories: finance manage" on public.fee_categories
  using (public.current_role() in ('super_admin', 'principal', 'bursar'))
  with check (public.current_role() in ('super_admin', 'principal', 'bursar'));

alter policy "fee_structures: finance manage" on public.fee_structures
  using (public.current_role() in ('super_admin', 'principal', 'bursar'))
  with check (public.current_role() in ('super_admin', 'principal', 'bursar'));

alter policy "invoices: finance manage" on public.invoices
  using (public.current_role() in ('super_admin', 'principal', 'bursar'))
  with check (public.current_role() in ('super_admin', 'principal', 'bursar'));

alter policy "payments: finance manage" on public.payments
  using (public.current_role() in ('super_admin', 'principal', 'bursar'))
  with check (public.current_role() in ('super_admin', 'principal', 'bursar'));

alter policy "applications: staff update" on public.admission_applications
  using (public.current_role() in ('super_admin', 'principal', 'admissions_officer'))
  with check (public.current_role() in ('super_admin', 'principal', 'admissions_officer'));
