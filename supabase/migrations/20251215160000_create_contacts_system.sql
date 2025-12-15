-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, -- Email is critical, so we enforce NOT NULL
  name TEXT, -- Raw name
  company TEXT,
  role TEXT,
  location TEXT, -- Raw location
  source TEXT, -- Origin file name
  phone_number TEXT,
  details JSONB DEFAULT '{}'::jsonb, -- Store extra metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add generated column for full-text search
  -- Concatenates name, email, company, and location
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(name, '') || ' ' || 
      coalesce(email, '') || ' ' || 
      coalesce(company, '') || ' ' || 
      coalesce(location, '')
    )
  ) STORED
);

-- Indexes for contacts
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);
CREATE INDEX IF NOT EXISTS idx_contacts_location ON contacts(location);

-- Create campaign_recipients table (Merged Selection & History)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  selected_email TEXT, -- The specific email chosen for this campaign (in case contact has multiple)
  status TEXT DEFAULT 'selected', -- 'selected', 'queued', 'sent', 'bounced', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure a contact is only added once per campaign
  UNIQUE(campaign_id, contact_id)
);

-- Indexes for campaign_recipients
CREATE INDEX IF NOT EXISTS idx_camp_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_camp_recipients_lookup ON campaign_recipients(contact_id, campaign_id);
