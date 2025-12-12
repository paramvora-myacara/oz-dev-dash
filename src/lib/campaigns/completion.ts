import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Checks if a campaign is completed and updates its status if needed.
 * 
 * A campaign is considered completed when:
 * - Status is 'scheduled' or 'sending' (not already completed/paused/cancelled)
 * - No emails are queued or processing
 * - At least some emails were processed (sent + failed > 0)
 * - No future scheduled emails remain
 * 
 * @param supabase - Supabase client instance
 * @param campaignId - Campaign UUID to check
 * @returns Promise<boolean> - True if campaign was updated to completed, false otherwise
 */
export async function checkAndUpdateCompletedCampaign(
  supabase: SupabaseClient<any>,
  campaignId: string
): Promise<boolean> {
  try {
    // 1. Get campaign current status
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return false // Campaign not found or error
    }

    // 2. Only check campaigns that are 'scheduled' or 'sending'
    if (!['scheduled', 'sending'].includes(campaign.status)) {
      return false // Already completed, paused, cancelled, or not launched
    }

    // 3. Count email statuses efficiently
    const countForStatus = async (status: string): Promise<number> => {
      const { count } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', status)
      return count || 0
    }

    const [queued, processing, sent, failed] = await Promise.all([
      countForStatus('queued'),
      countForStatus('processing'),
      countForStatus('sent'),
      countForStatus('failed'),
    ])

    // 4. Check if there are any future scheduled emails
    const { data: futureEmails } = await supabase
      .from('email_queue')
      .select('id')
      .eq('campaign_id', campaignId)
      .in('status', ['queued', 'processing'])
      .gt('scheduled_for', new Date().toISOString())
      .limit(1)

    // 5. Determine if completed
    const isCompleted =
      queued === 0 &&
      processing === 0 &&
      (sent + failed) > 0 && // At least some emails were processed
      (futureEmails?.length || 0) === 0 // No future scheduled emails

    // 6. Update status if completed
    if (isCompleted) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('status', campaign.status) // Optimistic locking - only update if still in same status

      if (updateError) {
        console.error(`Failed to update campaign ${campaignId} to completed:`, updateError)
        return false
      }

      return true // Successfully updated
    }

    return false // Not completed yet
  } catch (error) {
    console.error(`Error checking campaign ${campaignId} completion:`, error)
    return false
  }
}

/**
 * Checks multiple campaigns and updates any that are completed.
 * 
 * @param supabase - Supabase client instance
 * @param campaignIds - Array of campaign UUIDs to check
 * @returns Promise<number> - Number of campaigns updated to completed
 */
export async function checkAndUpdateCompletedCampaigns(
  supabase: SupabaseClient<any>,
  campaignIds: string[]
): Promise<number> {
  if (campaignIds.length === 0) {
    return 0
  }

  // Check all campaigns in parallel
  const results = await Promise.all(
    campaignIds.map(id => checkAndUpdateCompletedCampaign(supabase, id))
  )

  // Return count of successfully updated campaigns
  return results.filter(Boolean).length
}
