-- Product visibility belongs in RLS, not only in the client.
drop policy if exists "Anyone can read products" on public.products;
drop policy if exists "Anyone can read available products" on public.products;
create policy "Anyone can read available products"
  on public.products for select
  using (is_available = true);

drop policy if exists "Admins can read products" on public.products;
create policy "Admins can read products"
  on public.products for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Enquiry inserts are retried client-side; this key makes retries idempotent.
alter table public.enquiries
  add column if not exists idempotency_key text;

create unique index if not exists enquiries_idempotency_key_key
  on public.enquiries(idempotency_key)
  where idempotency_key is not null;

-- Keep product updated_at correct for direct SQL/Supabase dashboard edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- Indexes for current analytics/dashboard query shapes.
create index if not exists idx_analytics_events_type_created
  on public.analytics_events(event_type, created_at);

create index if not exists idx_analytics_events_non_admin_created
  on public.analytics_events(created_at)
  where page is null or page not like '/admin%';

create index if not exists idx_analytics_events_add_to_cart_product_id
  on public.analytics_events((event_data->>'product_id'))
  where event_type = 'add_to_cart' and event_data->>'product_id' is not null;

-- Trigram search support for leading-wildcard product name ILIKE.
create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_products_name_trgm
  on public.products using gin (name extensions.gin_trgm_ops);
