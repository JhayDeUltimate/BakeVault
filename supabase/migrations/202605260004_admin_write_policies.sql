-- Admin write policies for DB-backed admin screens.
-- Public SELECT policies stay in place; writes require membership in public.admins.

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can insert settings" on public.settings;
create policy "Admins can insert settings"
  on public.settings for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update settings" on public.settings;
create policy "Admins can update settings"
  on public.settings for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete settings" on public.settings;
create policy "Admins can delete settings"
  on public.settings for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Product image deletion is intentionally handled by the delete-product-image
-- Edge Function with the service role key, not by trusting browser-side checks.
