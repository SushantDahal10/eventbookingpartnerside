-- Run this in your Supabase SQL Editor to fix the booking error

DROP TRIGGER IF EXISTS trg_reduce_seats ON public.bookings;
DROP FUNCTION IF EXISTS reduce_seats_after_booking();

-- Optional: Verify it's gone
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'bookings';
