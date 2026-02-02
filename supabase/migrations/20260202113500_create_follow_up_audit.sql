-- Create prospect_follow_up_emails table for auditing
CREATE TABLE IF NOT EXISTS prospect_follow_up_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES prospect_calls(id) ON DELETE SET NULL,
    
    caller_name TEXT NOT NULL,
    to_email TEXT NOT NULL,
    outcome TEXT NOT NULL,
    template_used TEXT NOT NULL,
    
    gmail_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    error TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_prospect_follow_up_emails_prospect ON prospect_follow_up_emails(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_follow_up_emails_created_at ON prospect_follow_up_emails(created_at DESC);
