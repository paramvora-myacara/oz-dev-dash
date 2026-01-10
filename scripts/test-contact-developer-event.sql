-- Example SQL to insert a contact_developer event for testing Slack notifications
-- Replace 'your-email@example.com' with your actual user email

-- Option 1: Insert with your user email (replace the email)
INSERT INTO "public"."user_events" (
    "id",
    "user_id",
    "event_type",
    "endpoint",
    "metadata",
    "created_at"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "public"."users" WHERE email = 'aryan@ozlistings.com' LIMIT 1),
    'contact_developer',
    '/alden-brockton-ma',
    '{
        "propertyId": "alden-brockton-ma",
        "url": "https://ozlistings.com/listings/alden-brockton-ma",
        "developerContactEmail": "contact@alden.com"
    }'::jsonb,
    NOW()
);

-- Option 2: Insert with a specific user_id (if you know your user ID)
-- Replace 'YOUR_USER_ID_HERE' with your actual UUID
/*
INSERT INTO "public"."user_events" (
    "id",
    "user_id",
    "event_type",
    "endpoint",
    "metadata",
    "created_at"
) VALUES (
    gen_random_uuid(),
    'YOUR_USER_ID_HERE'::uuid,
    'contact_developer',
    '/alden-brockton-ma',
    '{
        "propertyId": "alden-brockton-ma",
        "url": "https://ozlistings.com/listings/alden-brockton-ma",
        "developerContactEmail": "contact@alden.com"
    }'::jsonb,
    NOW()
);
*/

-- Option 3: Query to find your user ID first
-- Run this first to get your user ID, then use Option 2
/*
SELECT id, email, full_name 
FROM "public"."users" 
WHERE email = 'aryan@ozlistings.com';
*/
