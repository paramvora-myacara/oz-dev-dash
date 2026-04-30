-- Insert oz_projects for RailRoad Lofts (TX).
-- project_slug must match listings.slug on the homepage.
-- IRR is stored at display scale (e.g. 19 = 19%), not decimal (0.19).
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
    'RailRoad Lofts',
    'railroad-lofts-tx',
    '351-unit ground-up Class A multifamily development in Cleburne (DFW), TX with a 40-year HUD 221(d)(4) loan and a new 1.7M SF Amazon operations center under construction adjacent to the site.',
    'Multifamily',
    NULL,
    'TX',
    NULL,
    100000,
    NULL,
    1.63,
    'Single-Asset',
    'class-A'
  );

