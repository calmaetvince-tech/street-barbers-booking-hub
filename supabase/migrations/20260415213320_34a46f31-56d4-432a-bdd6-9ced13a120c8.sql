
-- Create blocked_dates table
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocked_dates" ON public.blocked_dates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert blocked_dates" ON public.blocked_dates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blocked_dates" ON public.blocked_dates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blocked_dates" ON public.blocked_dates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view blocked_dates" ON public.blocked_dates FOR SELECT TO public USING (true);

-- Create blocked_time_slots table
CREATE TABLE public.blocked_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time TIME NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocked_time_slots" ON public.blocked_time_slots FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert blocked_time_slots" ON public.blocked_time_slots FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update blocked_time_slots" ON public.blocked_time_slots FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete blocked_time_slots" ON public.blocked_time_slots FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view blocked_time_slots" ON public.blocked_time_slots FOR SELECT TO public USING (true);

-- Add price_at_booking and duration_at_booking to bookings
ALTER TABLE public.bookings ADD COLUMN price_at_booking NUMERIC;
ALTER TABLE public.bookings ADD COLUMN duration_at_booking INTEGER;

-- Add admin CRUD policies for services
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
