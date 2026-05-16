-- Review email infrastructure
-- Adds review_sent_at to bookings, review_url to locations,
-- get_review_bookings() RPC, and send-booking-reviews cron job.

-- 1. columns
ALTER TABLE public.bookings  ADD COLUMN IF NOT EXISTS review_sent_at TIMESTAMPTZ;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS review_url TEXT;

-- 2. set Google Maps review URLs per location
UPDATE public.locations
SET review_url = 'https://www.google.com/maps/place/Street+Barbers/@36.4341,28.2272,17z#lrd=0x149561cc298760d5:0x1b17b65ec7005c16,3'
WHERE name = 'Street Barbers Center';

UPDATE public.locations
SET review_url = 'https://www.google.com/maps/place/Street+Barbers/@36.4241,28.1672,17z#lrd=0x149563c92d11e539:0xcd02367916d49d59,3'
WHERE name = 'Street Barbers Ialyssos';

-- 3. get_review_bookings — finds confirmed bookings ~24 h after appointment
CREATE OR REPLACE FUNCTION public.get_review_bookings()
RETURNS TABLE(id uuid, customer_name text, customer_email text,
  booking_date date, booking_time time without time zone,
  price_at_booking numeric, barber_name text, service_name text,
  location_name text, location_address text, location_phone text, location_review_url text)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT b.id, b.customer_name, b.customer_email,
    b.booking_date, b.booking_time, b.price_at_booking,
    br.name, s.name, l.name, l.address, l.phone, l.review_url
  FROM public.bookings b
  JOIN public.barbers  br ON br.id = b.barber_id
  JOIN public.services s  ON s.id  = b.service_id
  JOIN public.locations l ON l.id  = b.location_id
  WHERE b.status = 'confirmed'
    AND b.review_sent_at IS NULL
    AND b.customer_email IS NOT NULL
    AND (b.booking_date + b.booking_time)::timestamp AT TIME ZONE 'Europe/Athens'
        BETWEEN (NOW() - INTERVAL '36 hours') AND (NOW() - INTERVAL '23 hours 45 minutes');
$$;

-- 4. schedule send-booking-reviews cron (every 15 min, idempotent)
DO $$
DECLARE job_id INTEGER;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'send-booking-reviews';
  IF FOUND THEN PERFORM cron.unschedule(job_id); END IF;
END $$;

SELECT cron.schedule(
  'send-booking-reviews',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://zrpvmohovjoxvvbirdty.supabase.co/functions/v1/send-review',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
