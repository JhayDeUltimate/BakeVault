create or replace view analytics_daily_summary as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'page_view') as page_views,
  count(*) filter (where event_type = 'product_view') as product_views,
  count(*) filter (where event_type = 'add_to_cart') as add_to_cart,
  count(*) filter (where event_type = 'cart_checkout') as checkouts
from analytics_events
where page not like '/admin%' or page is null
group by 1;

create or replace view analytics_top_products as
select
  event_data->>'product_id' as product_id,
  event_data->>'product_name' as product_name,
  count(*) as add_count
from analytics_events
where event_type = 'add_to_cart'
  and event_data->>'product_id' is not null
group by 1, 2
order by 3 desc
limit 10;
