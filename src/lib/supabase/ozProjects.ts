import { createClient } from '@/utils/supabase/client';

export async function getProjectMetricsBySlug(listingSlug: string) {
  const supabase = createClient();

  // Step 1: Get the project_slug from listings
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('project_slug')
    .eq('slug', listingSlug)
    .single();

  if (listingError || !listing?.project_slug) {
    console.error('Error fetching project_slug from listings:', listingError);
    return { projected_irr_10yr: null, equity_multiple_10yr: null };
  }

  // Step 2: Get the metrics from oz_projects using project_slug
  const { data: project, error: projectError } = await supabase
    .from('oz_projects')
    .select('projected_irr_10yr, equity_multiple_10yr, minimum_investment')
    .eq('slug', listing.project_slug)
    .single();

  if (projectError) {
    console.error('Error fetching project metrics:', projectError);
    return { projected_irr_10yr: null, equity_multiple_10yr: null };
  }

  return {
    projected_irr_10yr: project?.projected_irr_10yr ?? null,
    equity_multiple_10yr: project?.equity_multiple_10yr ?? null,
    minimum_investment: project?.minimum_investment ?? null,
  };
} 