/** Hook for checking campaign status and progress.
 * 
 * This hook polls the backend API to check if generation/launch is in progress.
 * It provides a refresh function for manual status updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { getCampaignStatus, type CampaignStatus } from '@/lib/api/campaigns-backend';

export function useCampaignStatus(campaignId: string | null) {
  const [status, setStatus] = useState<CampaignStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCampaignStatus(campaignId);
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      console.error('Failed to fetch campaign status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      refresh();
    }
  }, [campaignId, refresh]);

  return { status, refresh, isLoading, error };
}

