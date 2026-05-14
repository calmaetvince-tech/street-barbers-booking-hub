-- =========================================================
-- Email features: confirmation + reminder
-- =========================================================

-- 1. Add email + tracking columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ NULL;

-- 2. email_logs table — never blocks a booking, just audit trail
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('confirmation', 'reminder')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email_logs"
  ON public.email_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Edge functions use service role which bypasses RLS
CREATE POLICY "Service role can insert email_logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

-- =========================================================
-- 3. RPC used by send-reminder edge function
--    Returns bookings whose appointment is 55–70 min away
--    (Athens time) and haven't been reminded yet.
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_reminder_bookings()
RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  booking_date DATE,
  booking_time TIME,
  price_at_booking NUMERIC,
  barber_name TEXT,
  service_name TEXT,
  location_name TEXT,
  location_address TEXT,
  location_phone TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.booking_date,
    b.booking_time,
    b.price_at_booking,
    br.name  AS barber_name,
    s.name   AS service_name,
    l.name   AS location_name,
    l.address AS location_address,
    l.phone  AS location_phone
  FROM public.bookings b
  JOIN public.barbers   br ON br.id = b.barber_id
  JOIN public.services  s  ON s.id  = b.service_id
  JOIN public.locations l  ON l.id  = b.location_id
  WHERE
    b.status         = 'confirmed'
    AND b.reminder_sent_at IS NULL
    AND b.customer_email   IS NOT NULL
    -- appointment_at in Athens time falls between NOW()+55min and NOW()+70min
    AND (b.booking_date + b.booking_time)::timestamp AT TIME ZONE 'Europe/Athens'
        BETWEEN (NOW() + INTERVAL '55 minutes')
            AND (NOW() + INTERVAL '70 minutes');
$$;

GRANT EXECUTE ON FUNCTION public.get_reminder_bookings() TO service_role;

-- =========================================================
-- 4. Cron job: call send-reminder every 15 minutes
--    Requires pg_cron + pg_net extensions (enable in
--    Supabase dashboard → Database → Extensions first).
--    Replace [PROJECT_REF] and [CRON_SECRET] below.
-- =========================================================
-- After enabling extensions, run this separately:
--
-- SELECT cron.schedule(
--   'send-booking-reminders',
--   '*/15 * * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://[PROJECT_REF].supabase.co/functions/v1/send-reminder',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer [CRON_SECRET]'
--     ),
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
