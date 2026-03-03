-- Migration: Add website signups to CRM only (people + emails + person_emails).
-- Replaces the old contacts-only trigger; no writes to legacy contacts table.

-- 1. Create the new function (CRM only, no contacts)
CREATE OR REPLACE FUNCTION public.add_signup_to_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_person_id uuid;
    target_email_id uuid;
BEGIN
    -- 1. Check if the email already exists in our CRM global emails table
    SELECT id INTO target_email_id FROM public.emails WHERE address = NEW.email;

    -- 2. If the email exists, find the person it belongs to
    IF target_email_id IS NOT NULL THEN
        SELECT person_id INTO target_person_id
        FROM public.person_emails
        WHERE email_id = target_email_id
        LIMIT 1;
    END IF;

    -- 3. Route logic based on whether they exist in the CRM
    IF target_person_id IS NOT NULL THEN
        -- A: ENRICH EXISTING PERSON (They were imported before they signed up)
        UPDATE public.people
        SET
            user_id = NEW.id,
            lead_status = 'warm',
            tags = ARRAY(SELECT DISTINCT unnest(array_append(tags, 'website_signup')))
        WHERE id = target_person_id;
    ELSE
        -- B: CREATE BRAND NEW PERSON (Total stranger)
        -- Name: prefer first_name/last_name from metadata; else derive from full_name (split on first space)
        INSERT INTO public.people (user_id, lead_status, tags, first_name, last_name)
        VALUES (
            NEW.id,
            'warm',
            ARRAY['website_signup'],
            NULLIF(trim(COALESCE(
                NEW.raw_user_meta_data->>'first_name',
                split_part(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ' ', 1)
            )), ''),
            NULLIF(trim(COALESCE(
                NEW.raw_user_meta_data->>'last_name',
                CASE WHEN position(' ' IN trim(COALESCE(NEW.raw_user_meta_data->>'full_name', ''))) > 0
                     THEN trim(substring(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')) FROM position(' ' IN trim(COALESCE(NEW.raw_user_meta_data->>'full_name', ''))) + 1))
                     ELSE ''
                END
            )), '')
        )
        RETURNING id INTO target_person_id;

        -- Insert the email if it wasn't found
        IF target_email_id IS NULL THEN
            INSERT INTO public.emails (address, status, metadata)
            VALUES (NEW.email, 'active', jsonb_build_object('verification_status', 'Valid'))
            RETURNING id INTO target_email_id;
        END IF;

        -- Link the newly created email and person
        INSERT INTO public.person_emails (person_id, email_id, is_primary, source)
        VALUES (target_person_id, target_email_id, true, 'auth_trigger');
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.add_signup_to_crm() IS 'On website signup: creates or updates CRM person + email + person_emails. No writes to legacy contacts table.';

-- 2. Drop the old contacts-only trigger
DROP TRIGGER IF EXISTS on_auth_user_created_add_to_contacts ON auth.users;

-- 3. Create the new trigger
CREATE TRIGGER on_auth_user_created_add_to_crm
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.add_signup_to_crm();

-- 4. Drop the old functions (contacts-only and generic)
DROP FUNCTION IF EXISTS public.add_signup_to_contacts();
DROP FUNCTION IF EXISTS public.handle_new_user();
