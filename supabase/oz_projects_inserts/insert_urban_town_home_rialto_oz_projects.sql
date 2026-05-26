-- Insert oz_projects for Urban Town Home (UTH) Rialto (149 W. Randall, Rialto, CA).
-- project_slug must match listings.slug on the homepage.
-- IRR is stored at display scale (e.g. 18.57 = 18.57%), not decimal (0.1857).
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
    'Urban Town Home (UTH) Rialto',
    'urban-town-home-ca',
    '48-unit build-for-rent Urban Town House community at 149 W. Randall in Rialto, CA—unique 5-bed workforce housing for multigenerational households in the Inland Empire, by-right zoned, targeting 18.57% project IRR on a 10-year OZ hold.',
    'Build-for-Rent',
    NULL,
    'CA',
    'Ground Up',
    NULL,
    18.57,
    NULL,
    'Single-Asset',
    'class-A'
  );
