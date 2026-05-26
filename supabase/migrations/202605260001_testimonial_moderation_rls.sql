drop policy if exists "Anyone can submit customer reviews" on public.testimonials;
drop policy if exists "Anyone can submit pending customer reviews" on public.testimonials;

create policy "Anyone can submit pending customer reviews"
  on public.testimonials for insert
  with check (
    is_visible = false
    and rating between 1 and 5
    and length(trim(customer_name)) > 0
    and length(trim(quote)) > 0
  );

drop policy if exists "Admins can read testimonials" on public.testimonials;
create policy "Admins can read testimonials"
  on public.testimonials for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can insert testimonials" on public.testimonials;
create policy "Admins can insert testimonials"
  on public.testimonials for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update testimonials" on public.testimonials;
create policy "Admins can update testimonials"
  on public.testimonials for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete testimonials" on public.testimonials;
create policy "Admins can delete testimonials"
  on public.testimonials for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));
