CREATE OR REPLACE FUNCTION public.validate_booking_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  svc RECORD;
  barber_loc UUID;
  trimmed_name TEXT;
BEGIN
  -- Only enforce strict rules for non-admin (public/anonymous) inserts.
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    -- Name: 2–50 chars after trim, not blank
    IF NEW.customer_name IS NULL THEN
      RAISE EXCEPTION 'Name is required';
    END IF;
    trimmed_name := btrim(NEW.customer_name);
    IF length(trimmed_name) < 2 OR length(trimmed_name) > 50 THEN
      RAISE EXCEPTION 'Name must be between 2 and 50 characters';
    END IF;

    -- Phone: exactly 10 digits, starts with 69 or 2 (Greek format only)
    IF NEW.customer_phone IS NULL OR NEW.customer_phone !~ '^(69[0-9]{8}|2[0-9]{9})$' THEN
      RAISE EXCEPTION 'Phone must be a valid Greek number (10 digits, starting with 69 or 2)';
    END IF;

    -- Date must be today or future, within 90 days
    IF NEW.booking_date IS NULL OR NEW.booking_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Booking date must be today or in the future';
    END IF;
    IF NEW.booking_date > CURRENT_DATE + INTERVAL '90 days' THEN
      RAISE EXCEPTION 'Booking date too far in the future';
    END IF;
    IF NEW.booking_time IS NULL THEN
      RAISE EXCEPTION 'Booking time required';
    END IF;

    -- Validate references exist
    SELECT id, price, duration_minutes INTO svc FROM public.services WHERE id = NEW.service_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid service';
    END IF;

    SELECT location_id INTO barber_loc FROM public.barbers WHERE id = NEW.barber_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid barber';
    END IF;
    IF barber_loc IS DISTINCT FROM NEW.location_id THEN
      RAISE EXCEPTION 'Barber does not belong to this location';
    END IF;

    -- Force server-trusted values
    NEW.status := 'confirmed';
    NEW.price_at_booking := svc.price;
    NEW.duration_at_booking := svc.duration_minutes;

    -- Normalize text
    NEW.customer_name := trimmed_name;
    NEW.customer_phone := btrim(NEW.customer_phone);
  END IF;

  RETURN NEW;
END;
$$;