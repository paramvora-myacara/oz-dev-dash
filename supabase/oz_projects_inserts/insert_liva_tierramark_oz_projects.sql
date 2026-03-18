-- Insert oz_projects for TierraMark at Camp Verde and Regal Apartments (2274 Shattuck).
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
  -- TierraMark at Camp Verde (Camp Verde, AZ)
  (
    gen_random_uuid(),
    'TierraMark at Camp Verde',
    'tierramark-at-camp-verde-az',
    '176-unit Class A workforce multifamily in high-growth Yavapai County—QOF, OZ tax-free appreciation after 10-year hold.',
    'Multifamily',
    NULL,
    'AZ',
    NULL,
    300000,
    19,
    3.08,
    'Single-Asset',
    'class-A'
  ),
  -- Regal Apartments (2274 Shattuck Street, Berkeley, CA)
  (
    gen_random_uuid(),
    'Regal Apartments',
    'regal-apartments-ca',
    'Entitled 17-story, 227-unit UC Berkeley student housing one block from campus—QOZB, past discretionary appeals.',
    'Student Housing',
    NULL,
    'CA',
    NULL,
    250000,
    27.3,
    2.59,
    'Single-Asset',
    'class-A'
  );
