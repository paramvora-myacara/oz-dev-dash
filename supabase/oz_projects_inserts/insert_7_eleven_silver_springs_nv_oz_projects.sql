-- Insert oz_projects for 7-Eleven Travel Center - Silver Springs (NV).
-- project_slug must match listings.slug on the homepage.
-- IRR is stored at display scale (e.g. 19.58 = 19.58%), not decimal (0.1958).
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
    '7-Eleven Travel Center - Silver Springs',
    '7-eleven-anchored-truck-stop-silver-springs-nevada-nv',
    'Equity recapitalization of a newly constructed, operating 7-Eleven-anchored travel center in Silver Springs, NV at USA Parkway and US-50 - 15-year corporate net lease, diversified QSR and gaming cash flow, and strong after-tax economics from bonus depreciation on an equipment-intensive asset.',
    'Retail',
    NULL,
    'NV',
    NULL,
    NULL,
    19.58,
    2.93,
    'Single-Asset',
    NULL
  );
