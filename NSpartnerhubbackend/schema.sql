--------------------------------------------------
-- FULL RESET
--------------------------------------------------

DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.partner_password_tokens CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.otps CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP FUNCTION IF EXISTS delete_expired_otps();
DROP FUNCTION IF EXISTS delete_expired_partner_tokens();
DROP FUNCTION IF EXISTS update_partners_updated_at();


--------------------------------------------------
-- EXTENSIONS
--------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;


--------------------------------------------------
-- USERS (AUTH)
--------------------------------------------------

CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  full_name TEXT NOT NULL,

  email TEXT UNIQUE NOT NULL
    CHECK (email = lower(email)),

  password_hash TEXT NOT NULL,

  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


--------------------------------------------------
-- OTP TABLE
--------------------------------------------------

CREATE TABLE public.otps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  email TEXT NOT NULL,

  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  code TEXT NOT NULL,

  purpose TEXT DEFAULT 'verification'
    CHECK (purpose IN ('verification','reset')),

  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


CREATE INDEX idx_otps_email
ON public.otps(email);

CREATE INDEX idx_otps_user_purpose
ON public.otps(user_id, purpose);


--------------------------------------------------
-- OTP CLEANUP
--------------------------------------------------

CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otps
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;


--------------------------------------------------
-- PARTNERS
--------------------------------------------------

CREATE TABLE public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  organization_name TEXT NOT NULL,

  official_email TEXT UNIQUE NOT NULL,

  official_phone TEXT NOT NULL,

  pan_holder_name TEXT,
  pan_number TEXT,
  pan_photo_url TEXT,

  vat_number TEXT,
  vat_photo_url TEXT,

  bank_name TEXT,
  bank_branch TEXT,
  account_holder_name TEXT,
  account_number TEXT,

  backup_contact_name TEXT,
  backup_contact_phone TEXT,
  backup_contact_email TEXT,

  terms_accepted BOOLEAN DEFAULT false,

  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','resubmitted')),

  rejection_reason TEXT,

  must_set_password BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


--------------------------------------------------
-- PARTNER INDEXES
--------------------------------------------------

CREATE INDEX idx_partners_user_id
ON partners(user_id);

CREATE INDEX idx_partners_status
ON partners(status);

CREATE INDEX idx_partners_created_at
ON partners(created_at DESC);

CREATE INDEX idx_partners_org_trgm
ON partners
USING GIN (organization_name gin_trgm_ops);


--------------------------------------------------
-- UPDATED AT TRIGGER
--------------------------------------------------

CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION update_partners_updated_at();


--------------------------------------------------
-- PASSWORD SETUP TOKENS
--------------------------------------------------

CREATE TABLE public.partner_password_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  partner_id UUID NOT NULL
    REFERENCES partners(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  token TEXT NOT NULL UNIQUE,

  expires_at TIMESTAMPTZ NOT NULL,

  used BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


CREATE INDEX idx_partner_token
ON partner_password_tokens(token);

CREATE INDEX idx_partner_token_partner
ON partner_password_tokens(partner_id);


CREATE UNIQUE INDEX one_active_partner_token
ON partner_password_tokens(partner_id)
WHERE used = false;


--------------------------------------------------
-- TOKEN CLEANUP
--------------------------------------------------

CREATE OR REPLACE FUNCTION delete_expired_partner_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM partner_password_tokens
  WHERE expires_at < now()
     OR used = true;
END;
$$ LANGUAGE plpgsql;


--------------------------------------------------
-- EVENTS (CREATED BY PARTNERS)
--------------------------------------------------

CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  partner_id UUID NOT NULL
    REFERENCES partners(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,

  description TEXT,

  event_date TIMESTAMPTZ NOT NULL,

  location TEXT NOT NULL,

  ticket_price NUMERIC(10,2) NOT NULL
    CHECK (ticket_price >= 0),

  total_seats INTEGER NOT NULL
    CHECK (total_seats > 0),

  available_seats INTEGER NOT NULL
    CHECK (available_seats >= 0),

  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','cancelled','completed')),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


--------------------------------------------------
-- EVENT INDEXES
--------------------------------------------------

CREATE INDEX idx_events_partner
ON events(partner_id);

CREATE INDEX idx_events_date
ON events(event_date);

CREATE INDEX idx_events_status
ON events(status);


--------------------------------------------------
-- BOOKINGS (USER BOOKS EVENT)
--------------------------------------------------

CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  event_id UUID NOT NULL
    REFERENCES events(id)
    ON DELETE CASCADE,

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  price_per_ticket NUMERIC(10,2) NOT NULL,

  total_amount NUMERIC(12,2) NOT NULL,

  transaction_id TEXT UNIQUE,

  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','cancelled','refunded')),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


--------------------------------------------------
-- BOOKING INDEXES
--------------------------------------------------

CREATE INDEX idx_bookings_user
ON bookings(user_id);

CREATE INDEX idx_bookings_event
ON bookings(event_id);

CREATE INDEX idx_bookings_status
ON bookings(status);

CREATE INDEX idx_bookings_created
ON bookings(created_at DESC);


--------------------------------------------------
-- PREVENT OVERBOOKING TRIGGER
--------------------------------------------------

CREATE OR REPLACE FUNCTION reduce_seats_after_booking()
RETURNS TRIGGER AS $$
BEGIN

  IF NEW.status = 'paid' THEN

    UPDATE events
    SET available_seats = available_seats - NEW.quantity
    WHERE id = NEW.event_id
      AND available_seats >= NEW.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough seats available';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_reduce_seats
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION reduce_seats_after_booking();
