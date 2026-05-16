-- Drop the old full unique constraint that prevented re-booking a cancelled slot.
-- The partial index bookings_no_double_book already enforces the correct rule:
-- no two *active* bookings for the same barber/date/time.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS unique_barber_slot;

-- Fix isSlotBlocked time format: blocked_time values stored as HH:MM:SS
-- are now correctly compared against HH:MM slot strings in the frontend
-- (handled in BookingFlow.tsx via trimTime — no DB change needed here).
