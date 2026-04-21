-- =========================================================
-- 1. BOOKINGS: restrict SELECT to admins only (PII protection)
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;

CREATE POLICY "Admins can view bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2. BOOKINGS: server-side validation trigger for public inserts
-- =========================================================
CREATE OR REPLACE FUNCTION public.validate_booking_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  svc RECORD;
  barber_loc UUID;
BEGIN
  -- Only enforce strict rules for non-admin (public/anonymous) inserts.
  -- Admins inserting via the dashboard keep full control.
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    -- Required fields & sane lengths
    IF NEW.customer_name IS NULL OR length(btrim(NEW.customer_name)) < 2 OR length(NEW.customer_name) > 100 THEN
      RAISE EXCEPTION 'Invalid customer name';
    END IF;
    IF NEW.customer_phone IS NULL OR length(btrim(NEW.customer_phone)) < 6 OR length(NEW.customer_phone) > 30 THEN
      RAISE EXCEPTION 'Invalid customer phone';
    END IF;
    -- Phone: digits, spaces, +, -, (, ) only
    IF NEW.customer_phone !~ '^[0-9 +()\-]+$' THEN
      RAISE EXCEPTION 'Invalid characters in phone number';
    END IF;

    -- Date must be today or future
    IF NEW.booking_date IS NULL OR NEW.booking_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Booking date must be today or in the future';
    END IF;
    -- Date not too far out
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

    -- Trim text
    NEW.customer_name := btrim(NEW.customer_name);
    NEW.customer_phone := btrim(NEW.customer_phone);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_booking_insert_trg ON public.bookings;
CREATE TRIGGER validate_booking_insert_trg
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_insert();

-- =========================================================
-- 3. Public availability function (no PII exposure)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_booked_slots(_barber_id UUID, _date DATE)
RETURNS TABLE (booking_time TIME, duration_at_booking INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT booking_time, duration_at_booking
  FROM public.bookings
  WHERE barber_id = _barber_id
    AND booking_date = _date
    AND status <> 'cancelled';
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(UUID, DATE) TO anon, authenticated;

-- =========================================================
-- 4. user_roles: explicit deny policies (defense in depth)
-- =========================================================
CREATE POLICY "No client inserts on user_roles"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No client updates on user_roles"
ON public.user_roles
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "No client deletes on user_roles"
ON public.user_roles
FOR DELETE
TO anon, authenticated
USING (false);
