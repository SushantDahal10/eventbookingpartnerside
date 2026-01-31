-- Run this in Supabase SQL Editor

-- 1. Create Gate Staff Requests Table
CREATE TABLE IF NOT EXISTS public.gate_staff_requests (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null REFERENCES public.events(id) ON DELETE CASCADE,
  partner_id uuid not null REFERENCES public.partners(id) ON DELETE CASCADE,
  requested_count integer not null default 0 CHECK (requested_count >= 0),
  approved_count integer not null default 0 CHECK (approved_count >= 0),
  status text not null default 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint gate_staff_requests_pkey primary key (id),
  constraint gate_staff_requests_event_unique unique (event_id)
);

-- 2. Trigger for Updated At
CREATE OR REPLACE FUNCTION update_gate_staff_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gate_staff_requests_updated_at
BEFORE UPDATE ON public.gate_staff_requests
FOR EACH ROW
EXECUTE FUNCTION update_gate_staff_requests_updated_at();

-- 3. Cleanup Old Columns from Events (Optional, can leave them for safety for now)
-- ALTER TABLE public.events DROP COLUMN IF EXISTS gate_staff_requested_count;
-- ALTER TABLE public.events DROP COLUMN IF EXISTS gate_staff_request_status;
