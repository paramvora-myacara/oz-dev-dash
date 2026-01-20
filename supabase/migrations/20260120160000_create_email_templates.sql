
-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    default_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read templates
CREATE POLICY "Allow public read access" ON public.email_templates
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update templates
CREATE POLICY "Allow authenticated insert" ON public.email_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.email_templates
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed initial templates
INSERT INTO public.email_templates (name, description, default_sections)
VALUES 
(
    'Outreach Marketing',
    'Cold outreach email for OZ developers',
    '[
      {
        "id": "opening",
        "name": "Opening Line",
        "type": "text",
        "mode": "personalized",
        "content": "Mention their specific project and location. Sound impressed by what they''re building.",
        "selectedFields": ["FirstName", "Company", "City", "Address"]
      },
      {
        "id": "pitch",
        "name": "Your Pitch",
        "type": "text",
        "mode": "static",
        "content": "I''m Jeff Richmond, founder of OZListings—the premier AI-powered marketplace for Opportunity Zone investments.\n\nWe connect developers like you with qualified investors actively seeking OZ deals, streamline your capital raise process, and provide comprehensive deal marketing services."
      },
      {
        "id": "cta-text",
        "name": "Call to Action",
        "type": "text",
        "mode": "static",
        "content": "Would you be open to a 15-minute call this week to discuss how we can help accelerate your capital raise?"
      },
      {
        "id": "cta-button",
        "name": "CTA Button",
        "type": "button",
        "mode": "static",
        "content": "Book Your Complimentary Call",
        "buttonUrl": "https://ozlistings.com/schedule-a-call"
      },
      {
        "id": "urgency",
        "name": "Urgency Reminder",
        "type": "text",
        "mode": "personalized",
        "content": "Add in some urgency reminder for this - make it more urgent",
        "selectedFields": ["FirstName", "Company"]
      },
      {
        "id": "signoff",
        "name": "Sign-off",
        "type": "text",
        "mode": "static",
        "content": "Best,\nJeff"
      }
    ]'::jsonb
),
(
    'Follow-up Email',
    'Follow-up for non-responders',
    '[
      {
        "id": "reminder",
        "name": "Reminder",
        "type": "text",
        "mode": "personalized",
        "content": "Reference your previous email and their project briefly.",
        "selectedFields": ["FirstName", "Company"]
      },
      {
        "id": "value-add",
        "name": "Value Add",
        "type": "text",
        "mode": "static",
        "content": "I wanted to share a quick case study of how we helped a similar developer raise $15M in just 6 weeks through our platform."
      },
      {
        "id": "cta",
        "name": "Call to Action",
        "type": "text",
        "mode": "static",
        "content": "Would a brief call be helpful? I''m happy to walk you through the process."
      },
      {
        "id": "cta-button",
        "name": "CTA Button",
        "type": "button",
        "mode": "static",
        "content": "Schedule a Call",
        "buttonUrl": "https://ozlistings.com/schedule-a-call"
      }
    ]'::jsonb
)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    default_sections = EXCLUDED.default_sections,
    updated_at = timezone('utc'::text, now());
