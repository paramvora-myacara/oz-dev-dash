-- Insert oz_projects for Redbrick Opportunity Fund V (Bridge District Parcel 2, Washington, DC).
-- project_slug must match listings.slug on the homepage.
-- IRR is stored at display scale (e.g. 13 = 13%), not decimal (0.13).
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
    'The Bridge District',
    'the-bridge-district-va',
    'OZ fund capitalizing Bridge District Parcel 2—a 625–650 unit net-zero multifamily tower one mile from the U.S. Capitol—with Class I growth or Class II 9% preferred equity options and an experienced DC master developer.',
    'Multifamily',
    NULL,
    'DC',
    'Ground Up',
    250000,
    13,
    NULL,
    'Single-Asset',
    'class-A'
  );
