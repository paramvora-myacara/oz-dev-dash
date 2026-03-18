-- Insert oz_projects for Hidden Lake, Portland Hyatt conversion, 491 Baltic, Lake Wire.
-- project_slug must match listings.slug. IRR at display scale (e.g. 29.7 = 29.7%).
-- Note: No unique on project_slug; re-running inserts new rows. Delete existing by slug first if re-seeding.

INSERT INTO public.oz_projects (
  project_id,
  project_name,
  project_slug,
  executive_summary,
  property_type,
  status,
  state,
  construction_type,
  minimum_investment,
  projected_irr_10yr,
  equity_multiple_10yr,
  fund_type,
  property_class
) VALUES
  (
    gen_random_uuid(),
    'Hidden Lake Surf Resort',
    'hidden-lake-surf-resort-az',
    '120-acre Buckeye OZ surf resort with lagoon, hotel, RV/glamping, and fishing—large Phoenix catchment and operating covered-land economics.',
    'Hospitality / Mixed-Use Resort',
    NULL,
    'AZ',
    NULL,
    100000,
    29.7,
    3.0,
    'Single-Asset',
    'class-A'
  ),
  (
    gen_random_uuid(),
    'Portland Airport Hotel - Hyatt Conversion',
    'portland-airport-hotel-hyatt-conversion-or',
    'Distressed-basis PDX-adjacent dual-brand Hyatt House / JDV conversion with 8% cumulative pref in a tight, high-occupancy airport sub-market.',
    'Hospitality',
    NULL,
    'OR',
    NULL,
    NULL,
    14.1,
    NULL,
    'Single-Asset',
    'class-A'
  ),
  (
    gen_random_uuid(),
    '491 Baltic',
    '491-baltic-brooklyn-ny',
    'Shovel-ready 79-unit luxury multifamily in Boerum Hill—prime Brooklyn location, permits in hand, OZ-qualified long-hold story.',
    'Multifamily',
    NULL,
    'NY',
    NULL,
    NULL,
    NULL,
    NULL,
    'Single-Asset',
    'class-A'
  ),
  (
    gen_random_uuid(),
    'Lake Wire Apartments',
    'lakewire-at-lakeland-fl',
    'Fully permitted 90-unit lakefront Lakeland multifamily with non-dilutive city grant and TIF—fast construction timeline, walkable to downtown.',
    'Multifamily',
    NULL,
    'FL',
    NULL,
    NULL,
    23.38,
    1.7,
    'Single-Asset',
    'class-A'
  );
