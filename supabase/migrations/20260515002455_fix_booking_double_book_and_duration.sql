-- Prevent double-bookings at DB level and store price/duration at booking time.

-- 1. Partial unique index: no two active bookings for same barber/date/time
CREATE UNIQUE INDEX IF NOT EXISTS bookings_no_double_book
  ON public.bookings(barber_id, booking_date, booking_time)
  WHERE status NOT IN ('cancelled');

-- 2. Update create_booking to save duration_at_booking + price_at_booking
CREATE OR REPLACE FUNCTION public.create_booking(
  p_location_id    uuid,
  p_service_id     uuid,
  p_barber_id      uuid,
  p_booking_date   date,
  p_booking_time   time without time zone,
  p_customer_name  text,
  p_customer_phone text,
  p_customer_email text
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_id       uuid;
  v_duration int;
  v_price    numeric;
BEGIN
  SELECT duration_minutes, price
    INTO v_duration, v_price
    FROM public.services
   WHERE id = p_service_id;

  INSERT INTO public.bookings (
    location_id, service_id, barber_id,
    booking_date, booking_time,
    customer_name, customer_phone, customer_email,
    duration_at_booking, price_at_booking,
    status
  ) VALUES (
    p_location_id, p_service_id, p_barber_id,
    p_booking_date, p_booking_time,
    p_customer_name, p_customer_phone, p_customer_email,
    v_duration, v_price,
    'pending'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 3. Backfill duration_at_booking for existing bookings
UPDATE public.bookings b
SET duration_at_booking = s.duration_minutes
FROM public.services s
WHERE b.service_id = s.id
  AND b.duration_at_booking IS NULL;
