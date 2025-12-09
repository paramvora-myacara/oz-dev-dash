-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_slug TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  subject_line JSONB NOT NULL DEFAULT '{"mode": "static", "content": ""}',
  email_format TEXT DEFAULT 'text' CHECK (email_format IN ('html', 'text')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'staged', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
