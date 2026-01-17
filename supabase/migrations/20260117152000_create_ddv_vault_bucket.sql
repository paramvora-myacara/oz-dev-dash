-- Migration: Create ddv-vault bucket for unified due diligence vault storage
-- This replaces the per-listing bucket structure (ddv-{slug}) with a single bucket
-- using folder-based organization by listing ID ({listingId}/filename.pdf)

-- Create the ddv-vault bucket
-- Public bucket (public = true) - accessible to all users
INSERT INTO storage.buckets (
  id,
  name,
  owner,
  created_at,
  updated_at,
  public,
  avif_autodetection,
  file_size_limit,
  allowed_mime_types,
  owner_id,
  type
) VALUES (
  'ddv-vault',
  'ddv-vault',
  NULL,
  NOW(),
  NOW(),
  true, -- Public bucket, accessible to all users
  false,
  NULL, -- No file size limit (or set a limit if needed)
  NULL, -- Allow all mime types (or restrict if needed)
  NULL,
  'STANDARD'
) ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public users to list files in the bucket
CREATE POLICY "Allow public users to list ddv-vault files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ddv-vault');

-- Policy: Allow public users to upload files to the bucket
CREATE POLICY "Allow public users to upload to ddv-vault"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'ddv-vault');

-- Policy: Allow public users to update files in the bucket
CREATE POLICY "Allow public users to update ddv-vault files"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'ddv-vault')
WITH CHECK (bucket_id = 'ddv-vault');

-- Policy: Allow public users to delete files from the bucket
CREATE POLICY "Allow public users to delete from ddv-vault"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'ddv-vault');

-- Note: Folder-level access control (restricting access to specific listing IDs)
-- is handled in application code by checking user permissions against the listing
-- before generating signed URLs or allowing file operations.
