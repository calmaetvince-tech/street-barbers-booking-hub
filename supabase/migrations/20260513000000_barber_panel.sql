-- =========================================================
-- Barber Panel: personal access for each barber
-- =========================================================

-- 1. Add 'barber' value to role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'barber';

-- 2. Link auth users to barber records
ALTER TABLE public.barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS barbers_user_id_idx ON public.barbers(user_id) WHERE user_id IS NOT NULL;

-- 3. Helper: get the barber_id for the currently signed-in user
CREATE OR REPLACE FUNCTION public.get_my_barber_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.barbers WHERE user_id = auth.uid() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_barber_id() TO authenticated;

-- 4. Allow users to read their own role (needed for barber auth check)
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 5. Bookings: barbers can SELECT and UPDATE their own bookings
CREATE POLICY "Barbers can view own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can update own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (barber_id = public.get_my_barber_id());

-- 6. Blocked dates: barbers can INSERT/DELETE their own
CREATE POLICY "Barbers can insert own blocked dates"
ON public.blocked_dates FOR INSERT TO authenticated
WITH CHECK (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can delete own blocked dates"
ON public.blocked_dates FOR DELETE TO authenticated
USING (barber_id = public.get_my_barber_id());

-- 7. Blocked time slots: barbers can INSERT/DELETE their own
CREATE POLICY "Barbers can insert own blocked time slots"
ON public.blocked_time_slots FOR INSERT TO authenticated
WITH CHECK (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can delete own blocked time slots"
ON public.blocked_time_slots FOR DELETE TO authenticated
USING (barber_id = public.get_my_barber_id());

-- 8. Working hours: barbers can INSERT/UPDATE their own
CREATE POLICY "Barbers can insert own working hours"
ON public.barber_working_hours FOR INSERT TO authenticated
WITH CHECK (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can update own working hours"
ON public.barber_working_hours FOR UPDATE TO authenticated
USING (barber_id = public.get_my_barber_id());

-- 9. Schedule overrides: barbers can INSERT/UPDATE/DELETE their own
CREATE POLICY "Barbers can insert own schedule overrides"
ON public.barber_schedule_overrides FOR INSERT TO authenticated
WITH CHECK (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can update own schedule overrides"
ON public.barber_schedule_overrides FOR UPDATE TO authenticated
USING (barber_id = public.get_my_barber_id());

CREATE POLICY "Barbers can delete own schedule overrides"
ON public.barber_schedule_overrides FOR DELETE TO authenticated
USING (barber_id = public.get_my_barber_id());
