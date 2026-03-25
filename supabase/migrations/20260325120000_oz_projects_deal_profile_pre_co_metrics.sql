-- Listing grid: alternate card metrics for pre–Certificate of Occupancy deals.
-- deal_profile is open-ended (no CHECK) so more tiers can be added later.

ALTER TABLE public.oz_projects
  ADD COLUMN IF NOT EXISTS deal_profile text NOT NULL DEFAULT 'standard';

ALTER TABLE public.oz_projects
  ADD COLUMN IF NOT EXISTS cap_rate numeric;

ALTER TABLE public.oz_projects
  ADD COLUMN IF NOT EXISTS purchase_price numeric;

ALTER TABLE public.oz_projects
  ADD COLUMN IF NOT EXISTS marketing_status text;

COMMENT ON COLUMN public.oz_projects.deal_profile IS 'standard: IRR / min inv / multiple card; pre_co: cap rate / purchase price / status';
COMMENT ON COLUMN public.oz_projects.cap_rate IS 'Cap rate as a number shown as percent, e.g. 5 => 5%';
COMMENT ON COLUMN public.oz_projects.purchase_price IS 'Purchase price in dollars';
COMMENT ON COLUMN public.oz_projects.marketing_status IS 'e.g. For Sale';
