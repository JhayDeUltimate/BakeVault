-- Move FAQ content into CMS-managed tables.

create table if not exists public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon text not null default 'M8 10h.01M12 10h.01M16 10h.01M9 16h6',
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.faq_categories(id) on delete cascade,
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faq_categories_display_order_idx
  on public.faq_categories(display_order);

create index if not exists faq_items_category_display_order_idx
  on public.faq_items(category_id, display_order);

alter table public.faq_categories enable row level security;
alter table public.faq_items enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists faq_categories_set_updated_at on public.faq_categories;
create trigger faq_categories_set_updated_at
  before update on public.faq_categories
  for each row
  execute function public.set_updated_at();

drop trigger if exists faq_items_set_updated_at on public.faq_items;
create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row
  execute function public.set_updated_at();

drop policy if exists "Anyone can read visible faq categories" on public.faq_categories;
create policy "Anyone can read visible faq categories"
  on public.faq_categories for select
  using (is_visible);

drop policy if exists "Admins can read faq categories" on public.faq_categories;
create policy "Admins can read faq categories"
  on public.faq_categories for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can insert faq categories" on public.faq_categories;
create policy "Admins can insert faq categories"
  on public.faq_categories for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update faq categories" on public.faq_categories;
create policy "Admins can update faq categories"
  on public.faq_categories for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete faq categories" on public.faq_categories;
create policy "Admins can delete faq categories"
  on public.faq_categories for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Anyone can read visible faq items" on public.faq_items;
create policy "Anyone can read visible faq items"
  on public.faq_items for select
  using (
    is_visible
    and exists (
      select 1
      from public.faq_categories
      where faq_categories.id = faq_items.category_id
        and faq_categories.is_visible
    )
  );

drop policy if exists "Admins can read faq items" on public.faq_items;
create policy "Admins can read faq items"
  on public.faq_items for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can insert faq items" on public.faq_items;
create policy "Admins can insert faq items"
  on public.faq_items for insert
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can update faq items" on public.faq_items;
create policy "Admins can update faq items"
  on public.faq_items for update
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

drop policy if exists "Admins can delete faq items" on public.faq_items;
create policy "Admins can delete faq items"
  on public.faq_items for delete
  using (exists (select 1 from public.admins where user_id = auth.uid()));

insert into public.faq_categories (id, title, icon, display_order, is_visible)
values
  ('00000000-0000-4000-8000-000000000101', 'Ordering & Payment', 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', 0, true),
  ('00000000-0000-4000-8000-000000000102', 'Delivery', 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0', 1, true),
  ('00000000-0000-4000-8000-000000000103', 'Products', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', 2, true),
  ('00000000-0000-4000-8000-000000000104', 'Returns & Refunds', 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', 3, true)
on conflict (id) do update
set title = excluded.title,
    icon = excluded.icon,
    display_order = excluded.display_order,
    is_visible = excluded.is_visible;

insert into public.faq_items (id, category_id, question, answer, display_order, is_visible)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Where can I buy baking supplies online in Lagos?', $$Browse the catalog, add the items you want to your order, then tap "Request a Quote on WhatsApp." We'll send you a price breakdown, confirm availability, and process your order from there. The whole thing usually takes a few minutes.$$, 0, true),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'Where can I buy wholesale baking ingredients in Lagos?', $$Both. If you're a bakery or buy in bulk, you'll get wholesale pricing on orders above ₦50,000. For smaller quantities, our standard retail rates apply. Either way, you're getting the same quality products; just let us know what you need when you reach out.$$, 1, true),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000101', 'What is the minimum order for baking supplies?', $$There is no strict minimum for retail orders. For wholesale pricing to apply, your order needs to be above ₦50,000. If you're not sure which applies to you, just send us what you need and we'll work it out.$$, 2, true),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101', 'How do I pay for baking ingredients online in Nigeria?', $$We accept bank transfers. Once your order is confirmed via WhatsApp, we'll send you our account details. We don't process payment until you've seen and confirmed the final price, so no surprises.$$, 3, true),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000101', 'Can I pick up my order instead of getting it delivered?', $$Yes. If you're in Lagos and prefer to collect, we can arrange that. Let us know when you're ordering and we'll confirm a pickup time. It's a good option if you're in a hurry and you're close to us.$$, 4, true),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000102', 'Who does same-day delivery of baking ingredients in Lagos?', $$Yes, for Lagos orders placed and confirmed before 2PM. Order in the morning, bake in the afternoon. If you're cutting it close, send us a message and we'll tell you honestly whether it's possible.$$, 0, true),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000102', 'How much does baking supply delivery cost in Lagos?', $$Lagos delivery ranges from ₦1,500 to ₦10,000 depending on your location within the city. For nationwide shipping, we calculate the fee based on courier rates and the weight of your order. We'll quote you the exact amount before you confirm; nothing hidden.$$, 1, true),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000102', 'Can I get baking ingredients delivered outside Lagos?', $$Yes. We ship nationwide through reliable courier partners. Delivery timelines outside Lagos are typically 1 to 3 business days depending on your state.$$, 2, true),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000102', 'How long does baking supply delivery take in Nigeria?', $$Same day for Lagos orders before 2PM. For orders after 2PM, delivery is the next business day. Nationwide orders take 1 to 3 business days. We'll always give you an estimated time when your order is confirmed.$$, 3, true),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000103', 'Where can I buy yogurt starter culture in Lagos Nigeria?', $$We carry a wide range of premium baking ingredients: milk flavourings and essences, yogurt and dairy starters, margarine and spreads, baking powder and improvers, food colours, syrups and toppings, preservatives and additives, and specialty ingredients. Browse the full catalog on the site. If you don't see what you need, request it and we'll look into sourcing it.$$, 0, true),
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000103', 'Are your products authentic and original?', $$Yes. We source directly from verified manufacturers and trusted distributors. Every product we stock meets our quality standards before it gets to you. If something ever falls short, we want to know; that's what the 24-hour issue window is for.$$, 1, true),
  ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000103', $$What if I need a product that's not on the website?$$, $$Use the "Request a Product" form on the catalog page. Tell us the product name, size, and how much you need. We source on request for both retail and bulk quantities and will update you once we've looked into it.$$, 2, true),
  ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000103', 'How do I choose the right baking ingredient for my recipe?', $$Yes. Each product page has an AI assistant that can answer specific usage questions: dosage, substitutes, what it works best for. For more detailed advice, send us a WhatsApp message and our team will give you a direct answer. We know our products well.$$, 3, true),
  ('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000103', 'Do you sell to home bakers or only professional bakeries?', $$Both. Whether you're making one celebration cake or running a high-volume production kitchen, you're welcome here. We adjust pricing based on quantity, not on who you are.$$, 4, true),
  ('00000000-0000-4000-8000-000000000215', '00000000-0000-4000-8000-000000000104', 'What is the return policy for baking ingredients bought online?', $$If your order arrives damaged, defective, or incorrect, we'll replace or refund it, no argument. You need to report it within 24 hours of delivery with clear photos via WhatsApp. For change-of-mind cancellations after an order is confirmed and dispatched, we don't offer refunds, so please check your order carefully before confirming. Opened or used products cannot be returned.$$, 0, true),
  ('00000000-0000-4000-8000-000000000216', '00000000-0000-4000-8000-000000000104', 'How long does a refund take to process?', $$Once we've confirmed the issue, refunds are processed within 3 to 5 business days via bank transfer to the account you paid from.$$, 1, true),
  ('00000000-0000-4000-8000-000000000217', '00000000-0000-4000-8000-000000000104', 'What should I do if my order arrives damaged?', $$The moment you notice something wrong. Either wrong item, damaged packaging, missing product. Please take clear photos and send them to us on WhatsApp straight away. Don't wait. The 24-hour window starts from when your order is delivered. The faster you report it, the faster we fix it.$$, 2, true)
on conflict (id) do update
set category_id = excluded.category_id,
    question = excluded.question,
    answer = excluded.answer,
    display_order = excluded.display_order,
    is_visible = excluded.is_visible;
