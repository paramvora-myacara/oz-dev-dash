-- Migration: Update signup trigger to set email_status to "Valid" and use contact_types array
-- This ensures new website signups get proper email validation status and use the new array column

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
  -- NOTE: contact_types is intentionally NOT updated on conflict to preserve
  --       manually set types (e.g., ['developer']). New signups default to ['investor'].
  INSERT INTO public.contacts (
    email,
    name,
    source,
    contact_types,
    details,
    user_id
  )
  VALUES (
    user_email,
    NULLIF(user_name, ''), -- Only set name if it's not empty
    'website_signup',
    ARRAY['investor'], -- Set contact_types as array for new signups
    jsonb_build_object(
      'lead_status', 'warm',
      'email_status', 'Valid'  -- Capitalized "Valid" to match UI filter
    ),
    NEW.id -- Set user_id directly
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
    -- Always update lead_status to "warm" and email_status to "Valid"
    details = COALESCE(contacts.details, '{}'::jsonb) ||
              jsonb_build_object('lead_status', 'warm', 'email_status', 'Valid'),
    -- Update the updated_at timestamp
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.add_signup_to_contacts() IS 'Automatically adds new website signups to contacts table with Valid email status and maintains the link via user_id.';