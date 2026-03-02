-- Migration: Update create_contact_full RPC to support upserting an existing person
--
-- This function handles the creation OR update of a person along with their emails, 
-- phones, linkedin profiles, and organization linkage in a single transaction.

CREATE OR REPLACE FUNCTION create_contact_full(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_person_id uuid;
    new_org_id uuid;
    contact_method record;
BEGIN
    -- 1. Determine if we are updating or creating
    IF payload->>'person_id' IS NOT NULL THEN
        target_person_id := (payload->>'person_id')::uuid;
        
        -- Update existing person
        UPDATE people SET
            first_name = COALESCE(payload->>'first_name', first_name),
            last_name = COALESCE(payload->>'last_name', last_name),
            lead_status = COALESCE(payload->>'lead_status', lead_status),
            tags = CASE 
                WHEN payload ? 'tags' THEN ARRAY(SELECT jsonb_array_elements_text(payload->'tags'))
                ELSE tags
            END,
            details = details || COALESCE(payload->'details', '{}'::jsonb),
            updated_at = now()
        WHERE id = target_person_id;
    ELSE
        -- Insert new person
        INSERT INTO people (
            first_name, 
            last_name, 
            lead_status, 
            tags, 
            details
        ) VALUES (
            payload->>'first_name',
            payload->>'last_name',
            COALESCE(payload->>'lead_status', 'new'),
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'tags', '[]'::jsonb))),
            COALESCE(payload->'details', '{}'::jsonb)
        ) RETURNING id INTO target_person_id;
    END IF;

    -- 2. Handle Contact Methods (Emails)
    IF payload ? 'emails' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'emails') LOOP
            -- Upsert email to get ID
            WITH inserted_email AS (
                INSERT INTO emails (address, status, metadata)
                VALUES (contact_method->>'address', 'active', jsonb_build_object('verification_status', 'Valid'))
                ON CONFLICT (address) DO UPDATE SET address = EXCLUDED.address
                RETURNING id
            )
            -- Link to person if not already linked
            INSERT INTO person_emails (person_id, email_id, is_primary, label)
            SELECT target_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false), contact_method->>'label'
            FROM inserted_email
            ON CONFLICT (person_id, email_id) DO UPDATE SET
                is_primary = EXCLUDED.is_primary,
                label = COALESCE(EXCLUDED.label, person_emails.label);
        END LOOP;
    END IF;

    -- 3. Handle Contact Methods (Phones)
    IF payload ? 'phones' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'phones') LOOP
            -- Upsert phone to get ID
            WITH inserted_phone AS (
                INSERT INTO phones (number)
                VALUES (contact_method->>'number')
                ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number
                RETURNING id
            )
            -- Link to person if not already linked
            INSERT INTO person_phones (person_id, phone_id, is_primary, label)
            SELECT target_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false), contact_method->>'label'
            FROM inserted_phone
            ON CONFLICT (person_id, phone_id) DO UPDATE SET
                is_primary = EXCLUDED.is_primary,
                label = COALESCE(EXCLUDED.label, person_phones.label);
        END LOOP;
    END IF;

    -- 4. Handle Contact Methods (LinkedIn)
    IF payload ? 'linkedin' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'linkedin') LOOP
            -- Upsert LinkedIn to get ID
            WITH inserted_linkedin AS (
                INSERT INTO linkedin_profiles (url)
                VALUES (contact_method->>'url')
                ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
                RETURNING id
            )
            -- Link to person if not already linked
            INSERT INTO person_linkedin (person_id, linkedin_id, is_primary)
            SELECT target_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false)
            FROM inserted_linkedin
            ON CONFLICT (person_id, linkedin_id) DO UPDATE SET
                is_primary = EXCLUDED.is_primary;
        END LOOP;
    END IF;

    -- 5. Handle Organization Link
    IF payload->>'organization_id' IS NOT NULL THEN
        -- Link existing
        INSERT INTO person_organizations (person_id, organization_id, title, is_primary)
        VALUES (target_person_id, (payload->>'organization_id')::uuid, payload->>'title', true)
        ON CONFLICT (person_id, organization_id) DO UPDATE SET
            title = COALESCE(EXCLUDED.title, person_organizations.title),
            is_primary = EXCLUDED.is_primary;
    ELSIF payload->>'organization_name' IS NOT NULL AND payload->>'organization_name' != '' THEN
        -- Create new org and link
        INSERT INTO organizations (name) 
        VALUES (payload->>'organization_name') 
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO new_org_id;

        INSERT INTO person_organizations (person_id, organization_id, title, is_primary)
        VALUES (target_person_id, new_org_id, payload->>'title', true)
        ON CONFLICT (person_id, organization_id) DO UPDATE SET
            title = COALESCE(EXCLUDED.title, person_organizations.title),
            is_primary = EXCLUDED.is_primary;
    END IF;

    RETURN jsonb_build_object('success', true, 'person_id', target_person_id);
EXCEPTION WHEN OTHERS THEN
    -- Transaction rolls back automatically
    RAISE EXCEPTION 'Failed to process contact: %', SQLERRM;
END;
$$;
