-- Reminder emails now go to all non-cancelled bookings (pending + confirmed).
-- Previously only 'confirmed' bookings got reminders, so 'pending' customers
-- were silently skipped. Review emails remain confirmed-only (unchanged).

CREATE OR REPLACE FUNCTION public.get_reminder_bookings()
RETURNS TABLE(id uuid, customer_name text, customer_email text, customer_phone text,
  booking_date date, booking_time time without time zone, price_at_booking numeric,
  barber_name text, service_name text, location_name text, location_address text, location_phone text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    b.id, b.customer_name, b.customer_email, b.customer_phone,
    b.booking_date, b.booking_time, b.price_at_booking,
    br.name AS barber_name, s.name AS service_name,
    l.name AS location_name, l.address AS location_address, l.phone AS location_phone
  FROM public.bookings b
  JOIN public.barbers   br ON br.id = b.barber_id
  JOIN public.services  s  ON s.id  = b.service_id
  JOIN public.locations l  ON l.id  = b.location_id
  WHERE
    b.status NOT IN ('cancelled')
    AND b.reminder_sent_at IS NULL
    AND b.customer_email   IS NOT NULL
    AND (b.booking_date + b.booking_time)::timestamp AT TIME ZONE 'Europe/Athens'
        BETWEEN (NOW() + INTERVAL '55 minutes')
            AND (NOW() + INTERVAL '70 minutes');
$$;
