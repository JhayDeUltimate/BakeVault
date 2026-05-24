create or replace function get_analytics_totals(since_ts timestamptz)
returns table(event_type text, total bigint)
language sql stable
as $$
  select event_type, count(*) as total
  from analytics_events
  where created_at >= since_ts
    and event_type in ('page_view','product_view','add_to_cart',
                       'cart_checkout','whatsapp_click',
                       'product_request_submitted','review_submitted')
    and (page not like '/admin%' or page is null)
  group by event_type;
$$;
