-- Migration: Add campaign_steps table for multi-step email sequences
-- Unified model: campaigns with entry_step_id become sequences

-- ============================================
-- 1. Create campaign_steps table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Email Step',
  
  -- Email content (same structure as sections/subject_line in campaigns)
  subject JSONB NOT NULL DEFAULT '{"mode": "static", "content": ""}',
  sections JSONB NOT NULL DEFAULT '[]',
  
  -- Graph edges for sequence flow (supports future branching)
  -- Format: [{ "targetStepId": "uuid", "delayDays": 2, "delayHours": 0, "condition": null }]
  edges JSONB NOT NULL DEFAULT '[]',
  
  -- Ordering for linear sequences
  step_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_campaign_steps_campaign_id ON campaign_steps(campaign_id);
CREATE INDEX idx_campaign_steps_order ON campaign_steps(campaign_id, step_order);

-- ============================================
-- 2. Extend campaigns table for sequences
-- ============================================

-- Entry step ID: if set, campaign is a sequence
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS entry_step_id UUID REFERENCES campaign_steps(id) ON DELETE SET NULL;

-- Exit conditions: when to stop the sequence for a recipient
-- Format: { "reply": true, "unsubscribe": true, "bounce": true, "spamComplaint": true }
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS exit_conditions JSONB DEFAULT '{"reply": true, "unsubscribe": true, "bounce": true, "spamComplaint": true}';

-- Timezone for scheduling emails
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Working hours for sending (optional)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS working_hours_start INTEGER DEFAULT 9;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS working_hours_end INTEGER DEFAULT 17;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS skip_weekends BOOLEAN DEFAULT true;

-- ============================================
-- 3. Extend campaign_recipients for sequences
-- ============================================

-- Current position and next target in sequence
ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS current_step_id UUID REFERENCES campaign_steps(id) ON DELETE SET NULL;

ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS next_step_id UUID REFERENCES campaign_steps(id) ON DELETE SET NULL;

-- Next scheduled email time
ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS next_email_at TIMESTAMPTZ;

-- Exit reason when stopped
-- Values: 'completed', 'replied', 'unsubscribed', 'bounced', 'spam_complaint', 'manual'
ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS exit_reason TEXT;

-- Track replies
ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

ALTER TABLE campaign_recipients 
ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- Index for scheduling queries
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_next_email 
ON campaign_recipients(next_email_at) 
WHERE next_email_at IS NOT NULL AND exit_reason IS NULL;

-- ============================================
-- 4. Extend email_queue for step tracking
-- ============================================

-- Link to specific step
ALTER TABLE email_queue 
ADD COLUMN IF NOT EXISTS step_id UUID REFERENCES campaign_steps(id) ON DELETE SET NULL;

-- SparkPost message ID for reply threading
ALTER TABLE email_queue 
ADD COLUMN IF NOT EXISTS sparkpost_message_id TEXT;

-- Index for message ID lookups (reply detection)
CREATE INDEX IF NOT EXISTS idx_email_queue_sparkpost_message 
ON email_queue(sparkpost_message_id) 
WHERE sparkpost_message_id IS NOT NULL;

-- ============================================
-- 5. Trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_campaign_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaign_steps_updated_at
  BEFORE UPDATE ON campaign_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_steps_updated_at();

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE campaign_steps IS 'Email steps within a campaign sequence';
COMMENT ON COLUMN campaigns.entry_step_id IS 'If set, campaign is treated as a multi-step sequence starting from this step';
COMMENT ON COLUMN campaigns.exit_conditions IS 'Conditions that stop the sequence: reply, unsubscribe, bounce, spam';
COMMENT ON COLUMN campaign_recipients.current_step_id IS 'Current position in sequence for this recipient';
COMMENT ON COLUMN campaign_recipients.next_email_at IS 'When the next email in the sequence should be sent';
