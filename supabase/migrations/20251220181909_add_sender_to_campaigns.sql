-- Add sender field to campaigns table
ALTER TABLE campaigns
ADD COLUMN sender TEXT CHECK (sender IN ('todd_vitzthum', 'jeff_richmond'));

-- Update existing campaigns to have a default sender (Jeff Richmond)
UPDATE campaigns SET sender = 'jeff_richmond' WHERE sender IS NULL;

-- Make sender field required for new campaigns
ALTER TABLE campaigns
ALTER COLUMN sender SET NOT NULL;
