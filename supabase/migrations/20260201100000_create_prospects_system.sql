-- Create prospect_call_status enum
DO $$ BEGIN
    CREATE TYPE prospect_call_status AS ENUM (
        'new', 'called', 'answered', 'no_answer', 'invalid_number',
        'follow_up', 'closed', 'rejected', 'do_not_call', 'locked', 'pending_signup'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Property info
    property_name TEXT NOT NULL,
    market TEXT,
    submarket TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    
    UNIQUE(property_name, address),
    
    -- Multi-phone support: JSONB array
    -- Each: {label, number, contactName?, contactEmail?, details?, lastCalledAt?, callCount}
    phone_numbers JSONB DEFAULT '[]'::jsonb,
    
    -- Call tracking
    call_status prospect_call_status DEFAULT 'new',
    lockout_until TIMESTAMPTZ,
    follow_up_at TIMESTAMPTZ,
    last_called_at TIMESTAMPTZ,
    last_called_by TEXT,
    
    -- Optimistic locking
    viewing_by TEXT,
    viewing_since TIMESTAMPTZ,
    
    extras JSONB DEFAULT '{}'::jsonb,
    
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(property_name, ''))
    ) STORED,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prospects_state ON prospects(state);
CREATE INDEX IF NOT EXISTS idx_prospects_call_status ON prospects(call_status);
CREATE INDEX IF NOT EXISTS idx_prospects_search ON prospects USING GIN(search_vector);

-- Create prospect_calls table for history
CREATE TABLE IF NOT EXISTS prospect_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    
    caller_name TEXT NOT NULL,
    outcome prospect_call_status NOT NULL,
    phone_used TEXT,
    email_captured TEXT,
    
    called_at TIMESTAMPTZ DEFAULT now()
);

-- Index for history lookups
CREATE INDEX IF NOT EXISTS idx_prospect_calls_prospect ON prospect_calls(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_calls_called_at ON prospect_calls(called_at DESC);

-- Enable Realtime for prospects table
-- Note: This is usually done via ALTER PUBLICATION, which requires superuser or being part of the publication.
ALTER PUBLICATION supabase_realtime ADD TABLE prospects;
