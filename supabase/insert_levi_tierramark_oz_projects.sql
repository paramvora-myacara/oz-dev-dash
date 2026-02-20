-- Insert oz_projects for Tierra Mark and Regal Apartments (2274 Shattuck).
-- Schema reference: project_id, project_name, project_slug, executive_summary, property_type, status, state, construction_type, minimum_investment, projected_irr_10yr, equity_multiple_10yr, fund_type, property_class, created_at
-- Listing slugs (must match homepage): tierramark-at-camp-verde-az, regal-apartments-ca
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
    '176-unit Class A multifamily addressing workforce housing shortage in Yavapai County, AZ. QOF structure with tax-free appreciation after 10-year hold.',
    'Multifamily',
    NULL,
    'AZ',
    NULL,
    300000,
    0.19,
    3.08,
    'Single-Asset',
    'class-A'
  ),
  -- Regal Apartments (2274 Shattuck Street, Berkeley, CA)
  (
    gen_random_uuid(),
    'Regal Apartments',
    'regal-apartments-ca',
    'Regal Apartments at 2274 Shattuck Street is a fully entitled 17-story student housing project (227 units / 780 beds) one block from UC Berkeley. QOZB structure; past discretionary appeals and exempt from Berkeley PLA mandates.',
    'Student Housing',
    NULL,
    'CA',
    NULL,
    250000,
    0.273,
    2.59,
    'Single-Asset',
    'class-A'
  );
