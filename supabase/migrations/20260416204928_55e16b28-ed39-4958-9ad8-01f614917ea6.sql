-- Weekly working hours per barber (day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday)
CREATE TABLE public.barber_working_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (barber_id, day_of_week)
);

ALTER TABLE public.barber_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view barber_working_hours"
  ON public.barber_working_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert barber_working_hours"
  ON public.barber_working_hours FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update barber_working_hours"
  ON public.barber_working_hours FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete barber_working_hours"
  ON public.barber_working_hours FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_barber_working_hours_barber ON public.barber_working_hours(barber_id);

-- Seed default hours: Mon-Sat 10:00-20:00, Sunday off, for all existing barbers
INSERT INTO public.barber_working_hours (barber_id, day_of_week, start_time, end_time, is_working)
SELECT b.id, d.day, '10:00'::time, '20:00'::time, CASE WHEN d.day = 0 THEN false ELSE true END
FROM public.barbers b
CROSS JOIN (SELECT generate_series(0,6) AS day) d
ON CONFLICT (barber_id, day_of_week) DO NOTHING;