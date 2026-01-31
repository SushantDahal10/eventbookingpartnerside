-- Run this in Supabase SQL Editor

-- 1. Create Gate Staff Table
CREATE TABLE IF NOT EXISTS public.gate_staff (
  id uuid not null default gen_random_uuid (),
  full_name text not null,
  email text not null,
  password_hash text not null,
  active boolean null default true,
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamp with time zone not null default now(),
  constraint gate_staff_pkey primary key (id),
  constraint gate_staff_email_key unique (email),
  constraint gate_staff_email_check check ((email = lower(email)))
);

-- 2. Create User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid not null default uuid_generate_v4 (),
  user_id uuid not null,
  role text null default 'user'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_id_key unique (user_id),
  constraint fk_user_roles_gate_staff foreign KEY (user_id) references gate_staff (id) on delete CASCADE,
  constraint user_roles_role_check check (
    (
      role = any (array['admin'::text, 'staff'::text, 'user'::text])
    )
  )
);

-- 3. Update Events Table for Staff Requests
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS gate_staff_requested_count INTEGER DEFAULT 0 CHECK (gate_staff_requested_count >= 0),
ADD COLUMN IF NOT EXISTS gate_staff_request_status TEXT DEFAULT 'none' CHECK (gate_staff_request_status IN ('none', 'pending', 'approved', 'rejected'));
