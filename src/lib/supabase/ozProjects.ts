import { createClient } from '@/utils/supabase/client';

export async function getProjectMetricsBySlug(listingSlug: string) {
  console.log('getProjectMetricsBySlug called with listingSlug:', listingSlug);
  const supabase = createClient();

  // Step 1: Get the metrics from oz_projects using project_slug = listingSlug
  const { data: project, error: projectError } = await supabase
    .from('oz_projects')
    .select('projected_irr_10yr, equity_multiple_10yr, minimum_investment, executive_summary')
    .eq('project_slug', listingSlug)
    .single();

  if (projectError) {
    console.error('Error fetching project metrics:', projectError);
    return { projected_irr_10yr: null, equity_multiple_10yr: null, minimum_investment: null, executive_summary: null };
  }

  return {
    projected_irr_10yr: project?.projected_irr_10yr ?? null,
    equity_multiple_10yr: project?.equity_multiple_10yr ?? null,
    minimum_investment: project?.minimum_investment ?? null,
    executive_summary: project?.executive_summary ?? null,
  };
} 