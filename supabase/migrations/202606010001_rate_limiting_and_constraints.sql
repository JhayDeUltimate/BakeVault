-- Rate limiting via pg_rate_limit using IP-based session tracking
-- BakeVault does not have pg_rate_limit available on free tier
-- Instead, we use a lightweight abuse prevention via insert throttle table

-- 1. Add length constraints to prevent large payload attacks
ALTER TABLE public.product_requests
  ADD CONSTRAINT check_product_name_length CHECK (length(product_name) <= 500),
  ADD CONSTRAINT check_product_size_length CHECK (product_size IS NULL OR length(product_size) <= 100),
  ADD CONSTRAINT check_notes_length CHECK (notes IS NULL OR length(notes) <= 2000),
  ADD CONSTRAINT check_contact_info_length CHECK (contact_info IS NULL OR length(contact_info) <= 500);

ALTER TABLE public.testimonials
  ADD CONSTRAINT check_quote_length CHECK (length(quote) <= 5000),
  ADD CONSTRAINT check_customer_name_length CHECK (length(customer_name) <= 200),
  ADD CONSTRAINT check_business_name_length CHECK (business_name IS NULL OR length(business_name) <= 200);

ALTER TABLE public.enquiries
  ADD CONSTRAINT check_whatsapp_message_length CHECK (whatsapp_message IS NULL OR length(whatsapp_message) <= 10000);

ALTER TABLE public.products
  ADD CONSTRAINT check_description_length CHECK (description IS NULL OR length(description) <= 50000);

-- 2. Throttle table to limit anonymous inserts per session
CREATE TABLE IF NOT EXISTS public.anonymous_insert_throttle (
  session_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  insert_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (session_id, table_name)
);

ALTER TABLE public.anonymous_insert_throttle ENABLE ROW LEVEL SECURITY;

-- No direct client policies: only SECURITY DEFINER functions maintain counters.

-- Auto-cleanup: remove records older than 1 hour
CREATE OR REPLACE FUNCTION public.cleanup_throttle_records()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.anonymous_insert_throttle
  WHERE window_start < NOW() - INTERVAL '1 hour';
$$;

-- Read the browser session id sent by the Supabase client global header.
CREATE OR REPLACE FUNCTION public.current_insert_session_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_headers JSONB;
  v_session_id TEXT;
BEGIN
  v_headers := COALESCE(NULLIF(current_setting('request.headers', true), '')::JSONB, '{}'::JSONB);
  v_session_id := trim(COALESCE(v_headers ->> 'x-bakevault-session-id', ''));

  IF v_session_id = '' OR length(v_session_id) > 200 THEN
    RETURN NULL;
  END IF;

  RETURN v_session_id;
END;
$$;

-- 3. Create throttle check function
CREATE OR REPLACE FUNCTION public.check_insert_throttle(
  p_session_id TEXT,
  p_table_name TEXT,
  p_max_per_hour INTEGER DEFAULT 10
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  IF p_session_id IS NULL OR trim(p_session_id) = '' THEN
    RETURN FALSE;
  END IF;

  -- Clean up old records first
  DELETE FROM public.anonymous_insert_throttle
  WHERE window_start < NOW() - INTERVAL '1 hour';

  -- Get or create throttle record
  SELECT insert_count, window_start
  INTO v_count, v_window_start
  FROM public.anonymous_insert_throttle
  WHERE session_id = p_session_id AND table_name = p_table_name
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.anonymous_insert_throttle (session_id, table_name, insert_count, window_start)
    VALUES (p_session_id, p_table_name, 1, NOW());
    RETURN TRUE;
  END IF;

  -- Reset if window expired
  IF v_window_start < NOW() - INTERVAL '1 hour' THEN
    UPDATE public.anonymous_insert_throttle
    SET insert_count = 1, window_start = NOW()
    WHERE session_id = p_session_id AND table_name = p_table_name;
    RETURN TRUE;
  END IF;

  -- Check limit
  IF v_count >= p_max_per_hour THEN
    RETURN FALSE;
  END IF;

  -- Increment
  UPDATE public.anonymous_insert_throttle
  SET insert_count = insert_count + 1
  WHERE session_id = p_session_id AND table_name = p_table_name;

  RETURN TRUE;
END;
$$;

-- 4. Wire throttling into public-facing INSERT policies.
DROP POLICY IF EXISTS "Anyone can submit product requests" ON public.product_requests;
CREATE POLICY "Anyone can submit product requests"
  ON public.product_requests FOR INSERT
  WITH CHECK (
    public.check_insert_throttle(public.current_insert_session_id(), 'product_requests', 10)
  );

DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
CREATE POLICY "Anyone can insert enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (
    public.check_insert_throttle(public.current_insert_session_id(), 'enquiries', 10)
  );

DROP POLICY IF EXISTS "Anyone can submit pending customer reviews" ON public.testimonials;
CREATE POLICY "Anyone can submit pending customer reviews"
  ON public.testimonials FOR INSERT
  WITH CHECK (
    is_visible = false
    AND rating BETWEEN 1 AND 5
    AND length(trim(customer_name)) > 0
    AND length(trim(quote)) > 0
    AND public.check_insert_throttle(public.current_insert_session_id(), 'testimonials', 10)
  );

DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    session_id = public.current_insert_session_id()
    AND public.check_insert_throttle(public.current_insert_session_id(), 'analytics_events', 300)
  );
