-- Harden anonymous insert throttling without rewriting existing data.
-- This migration is intentionally additive/idempotent for existing Supabase projects.

-- Fast stale-row cleanup without scanning the full throttle table.
create index if not exists anonymous_insert_throttle_window_start_idx
  on public.anonymous_insert_throttle(window_start);

-- Denial audit trail for diagnosing blocked inserts without storing raw IPs.
create table if not exists public.throttle_denials (
  id uuid primary key default gen_random_uuid(),
  throttle_key_hash text not null,
  table_name text not null,
  max_per_hour integer not null,
  window_start timestamptz,
  insert_count integer,
  denied_at timestamptz not null default now()
);

create index if not exists throttle_denials_denied_at_idx
  on public.throttle_denials(denied_at desc);

alter table public.throttle_denials enable row level security;

drop policy if exists "Admins can read throttle denials" on public.throttle_denials;
create policy "Admins can read throttle denials"
  on public.throttle_denials for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "No direct throttle denial writes" on public.throttle_denials;
create policy "No direct throttle denial writes"
  on public.throttle_denials as restrictive for all
  to anon, authenticated
  using (true)
  with check (false);

-- Direct client access should stay closed; SECURITY DEFINER functions maintain counters.
drop policy if exists "No direct throttle table access" on public.anonymous_insert_throttle;
create policy "No direct throttle table access"
  on public.anonymous_insert_throttle as restrictive for all
  to anon, authenticated
  using (false)
  with check (false);

-- Use a server-derived throttle key. Authenticated users are keyed by auth uid.
-- Anonymous users are keyed by forwarded client IP plus user agent, hashed before storage.
-- This removes reliance on the client-controlled x-bakevault-session-id header.
create or replace function public.current_insert_throttle_key()
returns text
language plpgsql
stable
set search_path = public, pg_temp
as $$
declare
  v_headers jsonb;
  v_uid uuid;
  v_forwarded_for text;
  v_ip text;
  v_user_agent text;
begin
  v_uid := auth.uid();
  if v_uid is not null then
    return 'user:' || v_uid::text;
  end if;

  v_headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_forwarded_for := coalesce(
    v_headers ->> 'x-forwarded-for',
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-real-ip',
    ''
  );
  v_ip := nullif(trim(split_part(v_forwarded_for, ',', 1)), '');
  v_user_agent := left(trim(coalesce(v_headers ->> 'user-agent', '')), 200);

  if v_ip is null or length(v_ip) > 128 then
    return null;
  end if;

  return 'anon:' || md5(v_ip || ':' || v_user_agent);
end;
$$;

comment on function public.current_insert_throttle_key()
  is 'Returns a server-derived key for anonymous insert throttling. Does not trust browser-supplied session headers.';

-- Keep the old function name available for compatibility, but stop trusting the client header.
create or replace function public.current_insert_session_id()
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select public.current_insert_throttle_key();
$$;

-- Atomic throttle check:
-- - no global cleanup on each insert
-- - insert-or-increment is one UPSERT
-- - limit check is enforced inside the conflict update predicate
create or replace function public.check_insert_throttle(
  p_session_id text,
  p_table_name text,
  p_max_per_hour integer default 10
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count integer;
  v_window_start timestamptz;
begin
  if p_session_id is null or trim(p_session_id) = '' then
    return false;
  end if;

  if p_max_per_hour is null or p_max_per_hour < 1 then
    return false;
  end if;

  if p_table_name not in ('product_requests', 'enquiries', 'testimonials', 'analytics_events') then
    return false;
  end if;

  insert into public.anonymous_insert_throttle as t (
    session_id,
    table_name,
    insert_count,
    window_start
  )
  values (p_session_id, p_table_name, 1, v_now)
  on conflict (session_id, table_name) do update
    set insert_count = case
          when t.window_start < v_now - interval '1 hour' then 1
          else t.insert_count + 1
        end,
        window_start = case
          when t.window_start < v_now - interval '1 hour' then v_now
          else t.window_start
        end
    where t.window_start < v_now - interval '1 hour'
       or t.insert_count < p_max_per_hour
  returning insert_count, window_start
    into v_count, v_window_start;

  if found then
    return true;
  end if;

  insert into public.throttle_denials (
    throttle_key_hash,
    table_name,
    max_per_hour,
    window_start,
    insert_count
  )
  select
    md5(p_session_id),
    p_table_name,
    p_max_per_hour,
    t.window_start,
    t.insert_count
  from public.anonymous_insert_throttle as t
  where t.session_id = p_session_id
    and t.table_name = p_table_name;

  return false;
end;
$$;

comment on function public.check_insert_throttle(text, text, integer)
  is 'SECURITY DEFINER throttle gate for public insert policies. Atomic UPSERT, fixed search_path, no per-call cleanup.';

create or replace function public.cleanup_throttle_records()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.anonymous_insert_throttle
  where window_start < now() - interval '1 hour';

  delete from public.throttle_denials
  where denied_at < now() - interval '30 days';
end;
$$;

comment on function public.cleanup_throttle_records()
  is 'Maintenance function. Schedule in Supabase/pg_cron; not called by insert throttling.';

-- Explicit privileges for throttle tables and functions.
revoke all on table public.anonymous_insert_throttle from public, anon, authenticated;
revoke all on table public.throttle_denials from public, anon, authenticated;
grant select on table public.throttle_denials to authenticated;

revoke all on function public.current_insert_throttle_key() from public, anon, authenticated;
grant execute on function public.current_insert_throttle_key() to anon, authenticated;

revoke all on function public.current_insert_session_id() from public, anon, authenticated;
grant execute on function public.current_insert_session_id() to anon, authenticated;

revoke all on function public.check_insert_throttle(text, text, integer) from public, anon, authenticated;
grant execute on function public.check_insert_throttle(text, text, integer) to anon, authenticated;

revoke all on function public.cleanup_throttle_records() from public, anon, authenticated;
grant execute on function public.cleanup_throttle_records() to service_role;

-- Use the server-derived throttle key in all public insert policies.
drop policy if exists "Anyone can submit product requests" on public.product_requests;
create policy "Anyone can submit product requests"
  on public.product_requests for insert
  with check (
    public.check_insert_throttle(public.current_insert_throttle_key(), 'product_requests', 10)
  );

drop policy if exists "Anyone can insert enquiries" on public.enquiries;
create policy "Anyone can insert enquiries"
  on public.enquiries for insert
  with check (
    public.check_insert_throttle(public.current_insert_throttle_key(), 'enquiries', 10)
  );

drop policy if exists "Anyone can submit pending customer reviews" on public.testimonials;
create policy "Anyone can submit pending customer reviews"
  on public.testimonials for insert
  with check (
    is_visible = false
    and rating between 1 and 5
    and length(trim(customer_name)) > 0
    and length(trim(quote)) > 0
    and public.check_insert_throttle(public.current_insert_throttle_key(), 'testimonials', 10)
  );

drop policy if exists "Anyone can insert analytics events" on public.analytics_events;
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (
    (session_id is null or length(session_id) <= 200)
    and public.check_insert_throttle(public.current_insert_throttle_key(), 'analytics_events', 300)
  );

-- Avoid clobbering an explicitly supplied updated_at in direct SQL/dashboard edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

comment on function public.set_updated_at()
  is 'Updates updated_at only when callers did not explicitly change it.';
