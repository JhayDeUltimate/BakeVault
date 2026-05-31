create or replace function public.jsonb_to_text_array(value jsonb)
returns text[]
language sql
immutable
as $$
  select case
    when value is null then null
    when jsonb_typeof(value) = 'array' then array(select jsonb_array_elements_text(value))
    else null
  end;
$$;

alter table public.products
  alter column image_urls type text[]
  using public.jsonb_to_text_array(image_urls);

drop function public.jsonb_to_text_array(jsonb);
