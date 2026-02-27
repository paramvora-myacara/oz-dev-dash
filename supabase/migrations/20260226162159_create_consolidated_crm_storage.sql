-- Migration to create consolidated CRM storage tables
-- Based on oz-dev-dash/docs/consolidated-crm-planning.md

-- 1. Create Core Entity: people
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    first_name TEXT,
    last_name TEXT,
    display_name TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
            ELSE COALESCE(first_name, last_name)
        END
    ) STORED,

    -- Classification
    lead_status TEXT DEFAULT 'new',  -- new, warm, hot, customer, lost, do_not_contact
    tags TEXT[] DEFAULT '{}',

    -- Link to authenticated website user
    user_id UUID REFERENCES auth.users(id),

    -- Flexible metadata
    details JSONB DEFAULT '{}'::jsonb,

    -- Search (name only)
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(first_name, '') || ' ' ||
            COALESCE(last_name, '')
        )
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Core Entity: organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    org_type TEXT,  -- 'family_office', 'developer', 'fund', 'investor', 'law_firm', etc.
    category TEXT,  -- 'SFO', 'MFO', etc.

    website TEXT,
    company_email TEXT,
    phone TEXT,

    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT DEFAULT 'US',

    -- Outreach state
    status TEXT DEFAULT 'active',  -- active, blocked, do_not_contact

    details JSONB DEFAULT '{}'::jsonb,

    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            COALESCE(name, '') || ' ' ||
            COALESCE(city, '') || ' ' ||
            COALESCE(state, ''))
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Contact Point Entity: phones
CREATE TABLE IF NOT EXISTS phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,       -- normalized: digits only
    status TEXT DEFAULT 'active',      -- active, invalid, disconnected
    metadata JSONB DEFAULT '{}'::jsonb, -- carrier_type, display formatting, lookup data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Contact Point Entity: emails
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL UNIQUE,      -- lowercase, trimmed
    status TEXT DEFAULT 'active',      -- active, bounced, suppressed
    metadata JSONB DEFAULT '{}'::jsonb, -- bounce_type, suppression_reason, sparkpost details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Contact Point Entity: linkedin_profiles
CREATE TABLE IF NOT EXISTS linkedin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,          -- normalized URL
    profile_name TEXT,                 -- for display/matching before person link exists
    connection_status TEXT,            -- none, pending, connected
    metadata JSONB DEFAULT '{}'::jsonb, -- title, company, location, image_url, scrape data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Core Entity: properties
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,

    details JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(property_name, address)
);

-- 7. Create Junction Table: person_phones
CREATE TABLE IF NOT EXISTS person_phones (
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    phone_id UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
    label TEXT,                        -- 'work', 'mobile', 'property_line', 'switchboard'
    is_primary BOOLEAN DEFAULT false,
    source TEXT,                       -- 'qozb_import', 'manual', 'family_office_csv'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (person_id, phone_id)
);

-- 8. Create Junction Table: person_emails
CREATE TABLE IF NOT EXISTS person_emails (
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    label TEXT,                        -- 'work', 'personal', 'secondary'
    is_primary BOOLEAN DEFAULT false,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (person_id, email_id)
);

-- 9. Create Junction Table: person_linkedin
CREATE TABLE IF NOT EXISTS person_linkedin (
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    linkedin_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (person_id, linkedin_id)
);

-- 10. Create Junction Table: person_organizations
CREATE TABLE IF NOT EXISTS person_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT,                        -- their role/title at this org
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, organization_id)
);

-- 11. Create Junction Table: person_properties
CREATE TABLE IF NOT EXISTS person_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    role TEXT NOT NULL,  -- 'owner', 'manager', 'trustee', 'special_servicer', 'developer'

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(person_id, property_id, role)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_lead_status ON people(lead_status);
CREATE INDEX IF NOT EXISTS idx_people_search ON people USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_organizations_search ON organizations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(state);
CREATE INDEX IF NOT EXISTS idx_phones_number ON phones(number);
CREATE INDEX IF NOT EXISTS idx_emails_address ON emails(address);
CREATE INDEX IF NOT EXISTS idx_linkedin_url ON linkedin_profiles(url);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);

-- Enable updated_at triggers where applicable
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER tr_people_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER tr_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        CREATE TRIGGER tr_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Realtime for main entities
DO $$
BEGIN
    -- Check if tables are already in the publication to avoid errors
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'people') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE people;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'organizations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'phones') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE phones;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'emails') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE emails;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'linkedin_profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE linkedin_profiles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'properties') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE properties;
    END IF;
END $$;
