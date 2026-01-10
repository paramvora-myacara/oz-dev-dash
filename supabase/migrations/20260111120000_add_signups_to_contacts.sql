-- Migration: Auto-add website signups to contacts table with "warm" tag
-- This trigger automatically adds new auth.users signups to the contacts table
-- If a contact with the same email already exists, it updates the lead_status to "warm"
-- Setting lead_status to "warm" is idempotent (no change if already warm, updates if cold)
-- New signups are set as contact_type = 'investor'

-- Function to add/update contact when a new user signs up
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
  INSERT INTO public.contacts (
    email,
    name,
    source,
    contact_type,
    details
  )
  VALUES (
    user_email,
    NULLIF(user_name, ''), -- Only set name if it's not empty
    'website_signup',
    'investor', -- Set contact_type as investor for new signups
    jsonb_build_object('lead_status', 'warm')
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    -- Update name if we have a new name and existing name is empty
    name = COALESCE(
      NULLIF(contacts.name, ''), 
      NULLIF(user_name, '')
    ),
    -- Update source if it's not already set
    source = COALESCE(contacts.source, 'website_signup'),
    -- Always update lead_status to "warm" (idempotent if already warm, updates if cold)
    details = COALESCE(contacts.details, '{}'::jsonb) || jsonb_build_object('lead_status', 'warm'),
    -- Update the updated_at timestamp
    updated_at = NOW();
    -- Note: We don't update contact_type on conflict to preserve existing type

  RETURN NEW;
END;
$$;

-- Create trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created_add_to_contacts
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.add_signup_to_contacts();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.add_signup_to_contacts() TO postgres;

-- Add comment for documentation
COMMENT ON FUNCTION public.add_signup_to_contacts() IS 'Automatically adds new website signups to contacts table with warm lead_status and investor contact_type. Updates existing contacts to warm if they already exist.';
