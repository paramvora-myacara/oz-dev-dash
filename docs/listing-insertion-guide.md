# Listing Insertion Guide

## Overview

This document explains the peculiar foreign key constraints between the `listings` and `listing_versions` tables and provides guidance on how to properly insert new listings into the database.

## Database Schema Overview

### Tables Involved

- **`listings`**: Main listing records
- **`listing_versions`**: Versioned data for each listing
- **`admin_user_listings`**: Associates admin users with listings for access control

### Foreign Key Constraints

The tables have **circular foreign key constraints**:

1. `listing_versions.listing_id` → `listings.id` (CASCADE DELETE)
2. `listings.current_version_id` → `listing_versions.id` (SET NULL on DELETE)

This creates a chicken-and-egg problem when inserting new data.

## The Problem

When trying to insert a new listing with its version, you encounter foreign key constraint violations because:

- You can't insert a `listing_versions` record without a `listings.id`
- You can't insert a `listings` record with a `current_version_id` that doesn't exist yet

## The Solution

### Correct Insertion Order

1. **Insert listing first** (without `current_version_id`)
2. **Insert listing version** (referencing the listing)
3. **Update listing** to set `current_version_id`

### Example SQL

```sql
-- Step 1: Insert listing without current_version_id
INSERT INTO listings (
  id,
  slug,
  title,
  has_vault,
  developer_entity_name,
  developer_ca_name,
  created_at,
  updated_at
) VALUES (
  'your-listing-uuid',
  'your-listing-slug',
  'Your Listing Title',
  true,
  'Developer Corp',
  'John Doe',
  NOW(),
  NOW()
);

-- Step 2: Insert listing version
INSERT INTO listing_versions (
  id,
  listing_id,
  version_number,
  data,
  created_at,
  published_at,
  news_links
) VALUES (
  'your-version-uuid',
  'your-listing-uuid', -- Must match the listing.id from step 1
  1, -- First version is always 1
  '{
    "title": "Your Listing Title",
    "description": "Project description...",
    "location": {
      "address": "123 Main St",
      "city": "City",
      "state": "ST",
      "coordinates": {"lat": 0.0, "lng": 0.0}
    },
    "projectDetails": {
      "propertyType": "Multifamily",
      "unitCount": 100,
      "squareFootage": 100000,
      "yearBuilt": 2024
    },
    "financials": {
      "totalInvestment": 10000000,
      "minimumInvestment": 25000,
      "targetIRR": 10.0,
      "projectedHoldPeriod": 5
    },
    "developer": {
      "entityName": "Developer Corp",
      "contactName": "John Doe",
      "contactEmail": "john@developer.com",
      "website": "https://developer.com"
    },
    "images": {
      "general": [],
      "floorplan": [],
      "sitemap": []
    },
    "status": "Development",
    "hasVault": true
  }'::jsonb,
  NOW(),
  NOW(),
  ARRAY[]::jsonb[]
);

-- Step 3: Update listing to reference the current version
UPDATE listings
SET current_version_id = 'your-version-uuid'
WHERE slug = 'your-listing-slug';
```

## Required Data Fields

### Listings Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `slug` | TEXT | Yes | URL-friendly identifier (unique) |
| `title` | TEXT | No | Display title |
| `current_version_id` | UUID | No | References current listing_versions.id |
| `has_vault` | BOOLEAN | Yes | Whether listing has a vault |
| `developer_entity_name` | TEXT | No | Developer company name |
| `developer_ca_name` | TEXT | No | Developer contact name |
| `developer_ca_email` | TEXT | No | Developer contact email |
| `developer_contact_email` | TEXT | No | Additional contact email |
| `developer_website` | TEXT | No | Developer website |
| `created_at` | TIMESTAMP | Yes | Creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

### Listing Versions Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `listing_id` | UUID | Yes | References listings.id |
| `version_number` | INTEGER | Yes | Version number (unique per listing) |
| `data` | JSONB | Yes | Complete listing data |
| `created_at` | TIMESTAMP | Yes | Creation timestamp |
| `published_at` | TIMESTAMP | Yes | Publication timestamp |
| `news_links` | JSONB[] | No | Array of news article links |

## Versioning Strategy

- **Version 1**: Always the first version when a listing is created
- **Subsequent versions**: Increment version_number for each update
- **Current version**: Always points to the latest published version
- **Data integrity**: All versions are preserved for audit/history

## Admin User Association

After creating a listing, associate it with admin users:

```sql
INSERT INTO admin_user_listings (user_id, listing_slug) VALUES
  ((SELECT id FROM admin_users WHERE email = 'admin@example.com'), 'your-listing-slug')
ON CONFLICT (user_id, listing_slug) DO NOTHING;
```

## Automated Scripts

For development/testing, use the provided scripts:

```bash
# Reset database and apply migrations
npx supabase db reset --debug --no-seed

# Run custom seed data (includes sample listing)
./scripts/seed-custom-data.sh
```

## Testing

Verify successful insertion:

```sql
SELECT
  l.slug,
  l.title,
  lv.version_number,
  lv.data->>'status' as status,
  lv.data->>'hasVault' as has_vault
FROM listings l
LEFT JOIN listing_versions lv ON l.current_version_id = lv.id
WHERE l.slug = 'your-listing-slug';
```

## Common Pitfalls

1. **Wrong insertion order**: Always insert listing before listing_version
2. **Missing current_version_id update**: Don't forget step 3
3. **Version number conflicts**: Ensure version_number is unique per listing
4. **Circular dependencies**: Never try to set both foreign keys simultaneously
5. **JSON structure**: Ensure `data` field contains valid JSON with required structure

## Migration Notes

- The circular foreign key constraints cannot be avoided due to the versioning requirements
- Always use transactions for multi-step insertions to maintain data integrity
- Consider using database triggers for automated version management in production
