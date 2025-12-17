-- Seed subscription plans table with Stripe test mode price IDs
INSERT INTO subscription_plans (name, stripe_price_id_monthly, stripe_price_id_yearly) VALUES
  ('Standard', 'price_1SeswaB3EFT2LyfNW94zz6ii', 'price_1Set1DB3EFT2LyfN7v7PS9T8'),
  ('Pro', 'price_1SeszxB3EFT2LyfNm7NYL4vZ', 'price_1SeszxB3EFT2LyfNynegM1Th'),
  ('Elite', 'price_1Set3MB3EFT2LyfN7xIYWKOa', 'price_1Set3MB3EFT2LyfN2u5JbKpU')
ON CONFLICT (name) DO UPDATE SET
  stripe_price_id_monthly = EXCLUDED.stripe_price_id_monthly,
  stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly;