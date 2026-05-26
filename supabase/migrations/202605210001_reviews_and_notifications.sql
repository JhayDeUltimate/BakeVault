alter table public.testimonials
  add column if not exists rating integer not null default 5,
  add column if not exists admin_notified_at timestamptz;

alter table public.testimonials
  drop constraint if exists testimonials_rating_check;

alter table public.testimonials
  add constraint testimonials_rating_check check (rating between 1 and 5);

alter table public.product_requests
  add column if not exists admin_notified_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'testimonials'
      and policyname = 'Anyone can submit pending customer reviews'
  ) then
    create policy "Anyone can submit pending customer reviews"
      on public.testimonials
      for insert
      with check (
        is_visible = false
        and rating between 1 and 5
        and length(trim(customer_name)) > 0
        and length(trim(quote)) > 0
      );
  end if;
end $$;
