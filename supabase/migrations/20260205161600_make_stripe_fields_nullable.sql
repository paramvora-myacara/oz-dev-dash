-- Make Stripe fields nullable to support free plans in both tables
ALTER TABLE subscriptions ALTER COLUMN stripe_subscription_id DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN stripe_customer_id DROP NOT NULL;
