-- Migration: Add role column to admin_users table
-- Run this in Supabase SQL Editor

-- Add the role column with default value 'customer'
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- Create an index on the role column for better query performance
CREATE INDEX IF NOT EXISTS admin_users_role_idx ON public.admin_users(role);

-- Update existing internal team members to have 'internal_admin' role
-- (You'll need to manually update this for your actual internal team emails)
-- UPDATE public.admin_users 
-- SET role = 'internal_admin' 
-- WHERE email IN ('admin@example.com', 'team@example.com');

-- Verify the changes
SELECT id, email, role, created_at 
FROM public.admin_users 
ORDER BY created_at DESC; 