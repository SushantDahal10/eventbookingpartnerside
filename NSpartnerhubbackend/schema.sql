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
    CHECK (status IN ('pending','approved','rejected')),

  rejection_reason TEXT,

  must_set_password BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.partners
ADD COLUMN city TEXT,
ADD COLUMN full_address TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT;


ALTER TABLE public.partners
DROP CONSTRAINT partners_status_check;

ALTER TABLE public.partners
ADD CONSTRAINT partners_status_check
CHECK (status IN ('pending','approved','rejected','resubmitted'));


ALTER TABLE public.otps DROP CONSTRAINT IF EXISTS otps_purpose_check;

ALTER TABLE public.otps 
ADD CONSTRAINT otps_purpose_check 
CHECK (purpose IN ('password_reset', 'resubmission', 'registration'));
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

ALTER TABLE public.events
ADD COLUMN full_address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT;
ALTER TABLE public.events
ALTER COLUMN country SET DEFAULT 'Nepal';


ALTER TABLE public.events
ADD COLUMN category TEXT;



ALTER TABLE public.events
DROP COLUMN ticket_price,
DROP COLUMN total_seats,
DROP COLUMN available_seats;


CREATE TABLE public.event_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  event_id UUID NOT NULL
    REFERENCES public.events(id)
    ON DELETE CASCADE,

  image_url TEXT NOT NULL,

  image_type TEXT NOT NULL
    CHECK (image_type IN ('cover','gallery')),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


CREATE INDEX idx_event_images_event
ON public.event_images(event_id);

CREATE INDEX idx_event_images_type
ON public.event_images(image_type);


CREATE TABLE public.ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  event_id UUID NOT NULL
    REFERENCES public.events(id)
    ON DELETE CASCADE,

  tier_name TEXT NOT NULL,

  price NUMERIC(10,2) NOT NULL
    CHECK (price >= 0),

  total_quantity INTEGER NOT NULL
    CHECK (total_quantity > 0),

  available_quantity INTEGER NOT NULL
    CHECK (available_quantity >= 0),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ticket_tiers ADD COLUMN IF NOT EXISTS perks JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_ticket_tiers_event
ON public.ticket_tiers(event_id);

CREATE INDEX idx_ticket_tiers_price
ON public.ticket_tiers(event_id, price);


CREATE OR REPLACE FUNCTION limit_gallery_images()
RETURNS TRIGGER AS $$
BEGIN

  IF NEW.image_type = 'gallery' THEN

    IF (
      SELECT COUNT(*)
      FROM event_images
      WHERE event_id = NEW.event_id
        AND image_type = 'gallery'
    ) >= 3 THEN

      RAISE EXCEPTION 'Maximum 3 gallery images allowed per event';

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_limit_gallery_images
BEFORE INSERT ON event_images
FOR EACH ROW
EXECUTE FUNCTION limit_gallery_images();



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

CREATE TABLE public.booking_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  booking_id UUID NOT NULL
    REFERENCES public.bookings(id)
    ON DELETE CASCADE,

  tier_id UUID NOT NULL
    REFERENCES public.ticket_tiers(id)
    ON DELETE CASCADE,

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  price_per_ticket NUMERIC(10,2) NOT NULL,

  total_amount NUMERIC(12,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE (booking_id, tier_id)
);

ALTER TABLE public.bookings
DROP COLUMN price_per_ticket,
DROP COLUMN quantity;

DROP TRIGGER IF EXISTS trg_reduce_tier_quantity ON public.bookings;
DROP FUNCTION IF EXISTS reduce_tier_quantity_after_booking();


CREATE OR REPLACE FUNCTION reduce_tier_after_item()
RETURNS TRIGGER AS $$
BEGIN

  IF EXISTS (
    SELECT 1
    FROM bookings
    WHERE id = NEW.booking_id
      AND status = 'paid'
  ) THEN

    UPDATE ticket_tiers
    SET available_quantity = available_quantity - NEW.quantity
    WHERE id = NEW.tier_id
      AND available_quantity >= NEW.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough tickets in this tier';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_reduce_tier_after_item
AFTER INSERT ON booking_items
FOR EACH ROW
EXECUTE FUNCTION reduce_tier_after_item();

CREATE OR REPLACE FUNCTION reduce_tiers_on_payment()
RETURNS TRIGGER AS $$
BEGIN

  IF OLD.status <> 'paid' AND NEW.status = 'paid' THEN

    UPDATE ticket_tiers t
    SET available_quantity = t.available_quantity - bi.quantity
    FROM booking_items bi
    WHERE bi.booking_id = NEW.id
      AND bi.tier_id = t.id
      AND t.available_quantity >= bi.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient tickets for one or more tiers';
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_reduce_tiers_on_payment
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION reduce_tiers_on_payment();




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


----paymnet and securit partner side --------

--------------------------------------------------
-- 1. PAYOUTS TABLE (Updated)
--------------------------------------------------
-- DROP TABLE IF EXISTS public.payouts; 

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  transaction_ref TEXT,
  requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner ON public.payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_event ON public.payouts(event_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

--------------------------------------------------
-- 2. TRANSACTIONS LEDGER (New)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'payout', 'fee', 'refund')),
  amount NUMERIC(12,2) NOT NULL, -- (+ Credit, - Debit)
  reference_id UUID, 
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_partner ON public.transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event ON public.transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);


-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can view their own payouts
CREATE POLICY "Partners can view own payouts" ON public.payouts
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM partners WHERE id = partner_id));

-- Policy: Partners can insert payout requests
CREATE POLICY "Partners can request payouts" ON public.payouts
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM partners WHERE id = partner_id));

-- Policy: Partners can view their own ledger transactions
-- Policy: Partners can view their own ledger transactions
CREATE POLICY "Partners can view own transactions" ON public.transactions
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM partners WHERE id = partner_id));


--------------------------------------------------
-- 3. LOGGING & SECURITY (Consolidated)
--------------------------------------------------

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL, -- e.g., 'LOGIN', 'CANCEL_EVENT', 'REQUEST_PAYOUT'
    details JSONB DEFAULT '{}', -- Store metadata like event_id, reason, changed_fields
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal Logs Table (Specific to payout security)
CREATE TABLE IF NOT EXISTS withdrawal_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payout_id UUID REFERENCES payouts(id),
    partner_id UUID REFERENCES partners(id),
    action_type VARCHAR(50) NOT NULL, -- 'INITIATE', 'CONFIRM_OTP', 'reject', 'process'
    status VARCHAR(50) NOT NULL, -- 'success', 'failed'
    failure_reason TEXT,
    ip_address VARCHAR(45),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification Codes (OTP)
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) DEFAULT 'PAYOUT',
    metadata JSONB DEFAULT '{}', -- Store amount, event_id here
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Partners can view their own withdrawal logs" ON withdrawal_logs
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM partners WHERE id = withdrawal_logs.partner_id));