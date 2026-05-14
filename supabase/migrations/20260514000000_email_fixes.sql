-- =========================================================
-- Email fixes — Atlas, 2026-05-14
--
-- 1. Add `email` column to barbers (so barber notifications work)
-- 2. Enable required extensions (pg_cron, pg_net) for the reminder cron
-- 3. Schedule the send-reminder Edge Function every 15 minutes
--
-- Run this migration AFTER:
--   - You have a Resend API key set in Supabase Edge Function secrets
--   - You have a CRON_SECRET set in Supabase Edge Function secrets
--   - You replaced the two placeholders below with real values
--
-- Placeholders to replace before running step 3:
--   __PROJECT_REF__   →  hbcsiajvzwmtemplvvhk
--   __CRON_SECRET__   →  the value you put in CRON_SECRET secret
-- =========================================================

-- ---------- 1. barber email column ----------
ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Optional: comment to remind future devs what this is for
COMMENT ON COLUMN public.barbers.email IS
  'Optional. If set, the barber receives an internal notification email on each new booking.';

-- ---------- 2. extensions ----------
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ---------- 3. schedule the reminder cron ----------
-- We do this idempotently: unschedule the job first if it already exists,
-- then re-schedule. This lets you re-run the migration safely.

DO $$
DECLARE
  job_id INTEGER;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'send-booking-reminders';
  IF FOUND THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END
$$;

SELECT cron.schedule(
  'send-booking-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://__PROJECT_REF__.supabase.co/functions/v1/send-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
