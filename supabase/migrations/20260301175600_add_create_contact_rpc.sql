-- Migration: Create create_contact_full RPC for atomic contact creation
--
-- This function handles the creation of a person along with their emails, 
-- phones, linkedin profiles, and organization linkage in a single transaction.

CREATE OR REPLACE FUNCTION create_contact_full(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_person_id uuid;
    new_org_id uuid;
    contact_method record;
BEGIN
    -- 1. Insert Person
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
    ) RETURNING id INTO new_person_id;

    -- 2. Insert Contact Methods (Emails)
    IF payload ? 'emails' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'emails') LOOP
            -- Upsert email to get ID
            WITH inserted_email AS (
                INSERT INTO emails (address, status, metadata)
                VALUES (contact_method->>'address', 'active', jsonb_build_object('verification_status', 'Valid'))
                ON CONFLICT (address) DO UPDATE SET address = EXCLUDED.address
                RETURNING id
            )
            INSERT INTO person_emails (person_id, email_id, is_primary, label)
            SELECT new_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false), contact_method->>'label'
            FROM inserted_email;
        END LOOP;
    END IF;

    -- 3. Insert Contact Methods (Phones)
    IF payload ? 'phones' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'phones') LOOP
            -- Upsert phone to get ID
            WITH inserted_phone AS (
                INSERT INTO phones (number)
                VALUES (contact_method->>'number')
                ON CONFLICT (number) DO UPDATE SET number = EXCLUDED.number
                RETURNING id
            )
            INSERT INTO person_phones (person_id, phone_id, is_primary, label)
            SELECT new_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false), contact_method->>'label'
            FROM inserted_phone;
        END LOOP;
    END IF;

    -- 4. Insert Contact Methods (LinkedIn)
    IF payload ? 'linkedin' THEN
        FOR contact_method IN SELECT * FROM jsonb_array_elements(payload->'linkedin') LOOP
            -- Upsert LinkedIn to get ID
            WITH inserted_linkedin AS (
                INSERT INTO linkedin_profiles (url)
                VALUES (contact_method->>'url')
                ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
                RETURNING id
            )
            INSERT INTO person_linkedin (person_id, linkedin_id, is_primary)
            SELECT new_person_id, id, COALESCE((contact_method->>'is_primary')::boolean, false)
            FROM inserted_linkedin;
        END LOOP;
    END IF;

    -- 5. Handle Organization Link
    IF payload->>'organization_id' IS NOT NULL THEN
        -- Link existing
        INSERT INTO person_organizations (person_id, organization_id, title)
        VALUES (new_person_id, (payload->>'organization_id')::uuid, payload->>'title');
    ELSIF payload->>'organization_name' IS NOT NULL AND payload->>'organization_name' != '' THEN
        -- Create new org and link
        INSERT INTO organizations (name) 
        VALUES (payload->>'organization_name') 
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO new_org_id;

        INSERT INTO person_organizations (person_id, organization_id, title)
        VALUES (new_person_id, new_org_id, payload->>'title');
    END IF;

    RETURN jsonb_build_object('success', true, 'person_id', new_person_id);
EXCEPTION WHEN OTHERS THEN
    -- Transaction rolls back automatically
    RAISE EXCEPTION 'Failed to create contact: %', SQLERRM;
END;
$$;
