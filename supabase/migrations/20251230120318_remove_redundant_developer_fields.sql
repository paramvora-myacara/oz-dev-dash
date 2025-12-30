-- Remove redundant developer fields that are no longer used after CA signing changes
-- These fields were previously used for SignWell CA disclosing party, but developer info is now in document text

ALTER TABLE public.listings DROP COLUMN IF EXISTS developer_entity_name;
ALTER TABLE public.listings DROP COLUMN IF EXISTS developer_ca_email;
ALTER TABLE public.listings DROP COLUMN IF EXISTS developer_ca_name;
