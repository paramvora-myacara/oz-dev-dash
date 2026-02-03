-- Create prospect_phones table (phone-first model)
-- One row per (prospect_id, phone_number) with merged labels when same person has multiple roles
CREATE TABLE IF NOT EXISTS prospect_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    labels TEXT[] NOT NULL DEFAULT '{}',
    contact_name TEXT,
    contact_email TEXT,
    entity_names TEXT,
    entity_addresses TEXT,
    call_status prospect_call_status DEFAULT 'new',
    lockout_until TIMESTAMPTZ,
    follow_up_at TIMESTAMPTZ,
    last_called_at TIMESTAMPTZ,
    last_called_by TEXT,
    call_count INT DEFAULT 0,
    viewing_by TEXT,
    viewing_since TIMESTAMPTZ,
    extras JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(prospect_id, phone_number),
    search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
        coalesce(phone_number, '') || ' ' ||
        coalesce(contact_name, '') || ' ' ||
        coalesce(contact_email, '') || ' ' ||
        coalesce(entity_names, '') || ' ' ||
        coalesce(entity_addresses, '')
    )
) STORED
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prospect_phones_prospect ON prospect_phones(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_phones_phone ON prospect_phones(phone_number);
CREATE INDEX IF NOT EXISTS idx_prospect_phones_call_status ON prospect_phones(call_status);
CREATE INDEX IF NOT EXISTS idx_prospect_phones_search ON prospect_phones USING GIN(search_vector);

-- Add prospect_phone_id to prospect_calls
ALTER TABLE prospect_calls ADD COLUMN IF NOT EXISTS prospect_phone_id UUID REFERENCES prospect_phones(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_prospect_calls_prospect_phone ON prospect_calls(prospect_phone_id);

-- Enable Realtime for prospect_phones
ALTER PUBLICATION supabase_realtime ADD TABLE prospect_phones;
