-- Add type and config columns to campaign_steps table to support branching (Action/Switch nodes)
ALTER TABLE campaign_steps ADD COLUMN type text DEFAULT 'action';
ALTER TABLE campaign_steps ADD COLUMN config jsonb DEFAULT '{}';
