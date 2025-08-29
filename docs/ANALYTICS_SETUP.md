# Analytics Dashboard Setup Guide

This guide will help you set up the analytics dashboard in the `oz-dev-dash` application.

## Prerequisites

- Access to your Supabase database
- Admin user accounts already set up

## Setup Steps

### 1. Database Migration

First, run the SQL migration to add the `role` column to the `admin_users` table:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `scripts/add-role-column.sql`

This will:
- Add a `role` column with default value `'customer'`
- Create an index for better performance
- Provide commented examples for updating internal team members

### 2. Create User Events Table

If you don't already have a `user_events` table, run the creation script:

1. In the Supabase SQL Editor, run the contents of `scripts/create-user-events-table.sql`

This will:
- Create the `user_events` table with proper structure
- Add necessary indexes for performance
- Include sample data insertion (optional)

### 3. Update Internal Team Roles

After running the migration, manually update the roles for your internal team members:

```sql
UPDATE public.admin_users 
SET role = 'internal_admin' 
WHERE email IN ('your-admin@example.com', 'your-team@example.com');
```

### 4. Test the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `/admin` and log in
3. Click the "View Analytics" button to access `/admin/analytics`
4. Test both site-wide and listing-specific views

## Features

### For Internal Admins (`role = 'internal_admin'`)
- Access to site-wide analytics
- Can view analytics for any listing
- Dropdown includes "Site-Wide Analytics" option

### For Customers (`role = 'customer'`)
- Can only view analytics for their assigned listings
- No access to site-wide data
- Dropdown only shows their listings

## Data Structure

The analytics endpoint expects events in the `user_events` table with this structure:

```sql
CREATE TABLE user_events (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  event_type text NOT NULL,
  endpoint text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Events are filtered by `metadata->>'propertyId'` for listing-specific analytics.

## Troubleshooting

### Common Issues

1. **"Forbidden" errors**: Check user roles and listing assignments
2. **No data showing**: Ensure events exist in the `user_events` table
3. **Chart not rendering**: Verify Chart.js is properly installed

### Debug Queries

Check if events exist:
```sql
SELECT * FROM user_events ORDER BY created_at DESC LIMIT 10;
```

Verify user roles:
```sql
SELECT email, role FROM admin_users;
```

Check listing assignments:
```sql
SELECT * FROM admin_user_listings;
```

## Next Steps

- Add more event types to track
- Implement additional time periods (monthly, quarterly)
- Add export functionality
- Set up automated event tracking 