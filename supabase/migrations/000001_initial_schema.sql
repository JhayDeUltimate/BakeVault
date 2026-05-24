-- =============================================================================
-- BakeVault — Initial Schema
-- Reconstructed from src/lib/database.types.ts and application code.
--
-- Run BEFORE any dated migrations (202605…) when bootstrapping a new
-- Supabase project:
--   supabase db push          (remote)
--   supabase db reset         (local)
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp" with schema extensions;

-- ─── Admins ──────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

-- Only authenticated users can read their own admin row.
create policy "Admins can read own row"
  on public.admins for select
  using (auth.uid() = user_id);

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user'
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- ─── Categories ──────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id            uuid primary key default extensions.uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

-- ─── Products ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default extensions.uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  image_url     text,
  image_urls    jsonb,
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  price_type    text not null default 'fixed',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug     on public.products(slug);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  using (true);

-- ─── Enquiries ───────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id               uuid primary key default extensions.uuid_generate_v4(),
  items            jsonb not null,
  whatsapp_message text,
  customer_name    text,
  status           text not null default 'new',
  created_at       timestamptz not null default now()
);

alter table public.enquiries enable row level security;

create policy "Anyone can insert enquiries"
  on public.enquiries for insert
  with check (true);

-- ─── Testimonials ────────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id            uuid primary key default extensions.uuid_generate_v4(),
  customer_name text not null,
  business_name text,
  initials      text,
  quote         text not null,
  rating        integer not null default 5
    constraint testimonials_rating_check check (rating between 1 and 5),
  is_visible    boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  admin_notified_at timestamptz
);

alter table public.testimonials enable row level security;

create policy "Anyone can read visible testimonials"
  on public.testimonials for select
  using (is_visible = true);

create policy "Anyone can submit customer reviews"
  on public.testimonials for insert
  with check (
    is_visible = true
    and rating between 1 and 5
    and length(trim(customer_name)) > 0
    and length(trim(quote)) > 0
  );

-- ─── Settings ────────────────────────────────────────────────────────────────
create table if not exists public.settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Anyone can read settings"
  on public.settings for select
  using (true);

-- ─── Product Requests ────────────────────────────────────────────────────────
create table if not exists public.product_requests (
  id            uuid primary key default extensions.uuid_generate_v4(),
  product_name  text not null,
  product_size  text,
  quantity      integer,
  notes         text,
  contact_info  text,
  status        text not null default 'pending',
  created_at    timestamptz not null default now(),
  admin_notified_at timestamptz
);

alter table public.product_requests enable row level security;

create policy "Anyone can submit product requests"
  on public.product_requests for insert
  with check (true);

-- ─── Analytics Events ────────────────────────────────────────────────────────
create table if not exists public.analytics_events (
  id         uuid primary key default extensions.uuid_generate_v4(),
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  session_id text,
  page       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_type
  on public.analytics_events(event_type);
create index if not exists idx_analytics_events_created
  on public.analytics_events(created_at);

alter table public.analytics_events enable row level security;

create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

-- ─── Admin Activity Logs ─────────────────────────────────────────────────────
create table if not exists public.admin_activity_logs (
  id            uuid primary key default extensions.uuid_generate_v4(),
  admin_id      uuid,
  admin_email   text,
  action        text not null,
  resource_type text,
  resource_id   text,
  details       jsonb,
  session_id    text,
  page          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_admin_logs_created
  on public.admin_activity_logs(created_at);

alter table public.admin_activity_logs enable row level security;

-- ─── Storage Bucket ──────────────────────────────────────────────────────────
-- The app uses a public bucket called "bakevault-images".
-- Uncomment and adjust if you want this migration to create the bucket:
--
-- insert into storage.buckets (id, name, public)
-- values ('bakevault-images', 'bakevault-images', true)
-- on conflict do nothing;
