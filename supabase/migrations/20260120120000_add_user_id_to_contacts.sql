-- Migration: Add user_id to contacts table and update signup trigger
-- This allows linking cold outreach contacts to authenticated website users

-- 1. Add user_id column
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);

-- 3. Backfill existing matches (case-insensitive)
UPDATE public.contacts c
SET user_id = u.id
FROM auth.users u
WHERE LOWER(c.email) = LOWER(u.email) 
  AND c.user_id IS NULL;

-- 4. Update existing signup trigger
CREATE OR REPLACE FUNCTION public.add_signup_to_contacts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Extract email and name from auth.users
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Insert or update contact with upsert logic
  -- ON CONFLICT handles the case where email already exists
  -- NOTE: contact_type is intentionally NOT updated on conflict to preserve
  --       manually set types (e.g., 'developer'). New signups default to 'investor'.
  INSERT INTO public.contacts (
    email,
    name,
    source,
    contact_type,
    details,
    user_id
  )
  VALUES (
    user_email,
    NULLIF(user_name, ''), -- Only set name if it's not empty
    'website_signup',
    'investor', -- Set contact_type as investor for new signups
    jsonb_build_object('lead_status', 'warm'),
    NEW.id -- ⭐ Set user_id directly
  )
  ON CONFLICT (email)
  DO UPDATE SET
    -- Update user_id if we have it now
    user_id = COALESCE(contacts.user_id, NEW.id),
    -- Update name if we have a new name and existing name is empty
    name = COALESCE(
      NULLIF(contacts.name, ''),
      NULLIF(user_name, '')
    ),
    -- Update source if it's not already set
    source = COALESCE(contacts.source, 'website_signup'),
    -- Always update lead_status to "warm"
    details = COALESCE(contacts.details, '{}'::jsonb) || jsonb_build_object('lead_status', 'warm'),
    -- Update the updated_at timestamp
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.add_signup_to_contacts() IS 'Automatically adds new website signups to contacts table and maintains the link via user_id.';
