-- ============================================================================
-- Task 1: Fix RLS policies for mobile (product_requests, enquiries, testimonials)
-- ============================================================================

-- product_requests
DROP POLICY IF EXISTS "Anyone can submit product requests" ON public.product_requests;
CREATE POLICY "Anyone can submit product requests"
  ON public.product_requests FOR INSERT
  WITH CHECK (
    public.current_insert_throttle_key() IS NULL
    OR public.check_insert_throttle(public.current_insert_throttle_key(), 'product_requests', 10)
  );

-- enquiries
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
CREATE POLICY "Anyone can insert enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (
    public.current_insert_throttle_key() IS NULL
    OR public.check_insert_throttle(public.current_insert_throttle_key(), 'enquiries', 10)
  );

-- testimonials
DROP POLICY IF EXISTS "Anyone can submit pending customer reviews" ON public.testimonials;
CREATE POLICY "Anyone can submit pending customer reviews"
  ON public.testimonials FOR INSERT
  WITH CHECK (
    is_visible = false
    AND rating BETWEEN 1 AND 5
    AND length(trim(customer_name)) > 0
    AND length(trim(quote)) > 0
    AND (
      public.current_insert_throttle_key() IS NULL
      OR public.check_insert_throttle(public.current_insert_throttle_key(), 'testimonials', 10)
    )
  );

-- ============================================================================
-- Task 2: Fix RLS policy for analytics_events
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    (session_id IS NULL OR length(session_id) <= 200)
    AND (
      public.current_insert_throttle_key() IS NULL
      OR public.check_insert_throttle(public.current_insert_throttle_key(), 'analytics_events', 300)
    )
  );
