-- =============================================================================
-- Admin-only RLS policies for sensitive tables
--
-- Restricts SELECT and UPDATE to authenticated admins (users in the admins table).
-- Insert policies remain open where public form submissions are expected.
-- =============================================================================

-- ─── Product Requests ────────────────────────────────────────────────────────

create policy "Admins can read product requests"
  on public.product_requests for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "Admins can update product requests"
  on public.product_requests for update
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- ─── Enquiries ───────────────────────────────────────────────────────────────

create policy "Admins can read enquiries"
  on public.enquiries for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "Admins can update enquiries"
  on public.enquiries for update
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- ─── Analytics Events ────────────────────────────────────────────────────────

create policy "Admins can read analytics events"
  on public.analytics_events for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- ─── Admin Activity Logs ─────────────────────────────────────────────────────

create policy "Admins can read activity logs"
  on public.admin_activity_logs for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

create policy "Admins can insert activity logs"
  on public.admin_activity_logs for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));
