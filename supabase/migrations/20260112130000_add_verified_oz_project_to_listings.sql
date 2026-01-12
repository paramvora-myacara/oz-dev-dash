-- Migration: Add is_verified_oz_project column to listings table
-- This flag controls whether a verified OZ project badge is displayed on the listing page

ALTER TABLE listings 
ADD COLUMN is_verified_oz_project BOOLEAN DEFAULT FALSE;
