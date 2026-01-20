-- Add campaign_type column to campaigns table
-- Default to 'batch' for existing records

ALTER TABLE campaigns 
ADD COLUMN campaign_type VARCHAR(50) DEFAULT 'batch';

-- Optional: Update existing records to ensure they have the default value (though DEFAULT handles new inserts)
UPDATE campaigns 
SET campaign_type = 'batch' 
WHERE campaign_type IS NULL;

-- Create an index if you plan to query by this field often
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
