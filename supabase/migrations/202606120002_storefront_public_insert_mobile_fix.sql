-- Fix public storefront inserts for mobile browsers without opening admin data.
--
-- 202606120001 was already applied in production, so this migration carries the
-- actual live fix. Anonymous storefront inserts must not require admin rights,
-- and throttling must still work when forwarded IP headers are unavailable.

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
  v_session_id text;
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

  if v_ip is not null and length(v_ip) <= 128 then
    return 'anon:' || md5(v_ip || ':' || v_user_agent);
  end if;

  v_session_id := left(trim(coalesce(v_headers ->> 'x-bakevault-session-id', '')), 200);
  if v_session_id <> '' then
    return 'session:' || md5(v_session_id || ':' || v_user_agent);
  end if;

  return null;
end;
$$;

comment on function public.current_insert_throttle_key()
  is 'Returns a server-derived public insert throttle key, falling back to the app session header when mobile requests do not expose forwarded IP headers.';

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
