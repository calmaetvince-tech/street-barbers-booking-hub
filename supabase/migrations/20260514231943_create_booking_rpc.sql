-- create_booking RPC — inserts a booking and returns its UUID.
-- Called from the frontend booking flow instead of a direct insert
-- so customer_email is always stored (needed for reminder/review emails).

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
  v_id uuid;
BEGIN
  INSERT INTO public.bookings (
    location_id, service_id, barber_id,
    booking_date, booking_time,
    customer_name, customer_phone, customer_email,
    status
  ) VALUES (
    p_location_id, p_service_id, p_barber_id,
    p_booking_date, p_booking_time,
    p_customer_name, p_customer_phone, p_customer_email,
    'pending'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
