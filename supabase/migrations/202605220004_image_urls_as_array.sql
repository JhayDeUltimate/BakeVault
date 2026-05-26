alter table public.products
  alter column image_urls type text[]
  using case
    when image_urls is null then null
    when jsonb_typeof(image_urls) = 'array' then array(select jsonb_array_elements_text(image_urls))
    else null
  end;
