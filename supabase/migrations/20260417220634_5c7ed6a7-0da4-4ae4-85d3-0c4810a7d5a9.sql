CREATE TABLE public.barber_schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  override_date date NOT NULL,
  is_working boolean NOT NULL DEFAULT true,
  start_time time NOT NULL DEFAULT '10:00',
  end_time time NOT NULL DEFAULT '20:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barber_id, override_date)
);

ALTER TABLE public.barber_schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view barber_schedule_overrides"
  ON public.barber_schedule_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert barber_schedule_overrides"
  ON public.barber_schedule_overrides FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update barber_schedule_overrides"
  ON public.barber_schedule_overrides FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete barber_schedule_overrides"
  ON public.barber_schedule_overrides FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_barber_schedule_overrides_barber_date
  ON public.barber_schedule_overrides (barber_id, override_date);