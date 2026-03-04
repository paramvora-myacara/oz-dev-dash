import type { CampaignRecipientSelectionPayload } from '@/types/campaign-recipient-selection';
import { create } from 'zustand';

interface CampaignDraftState {
  pendingRecipientSelection: CampaignRecipientSelectionPayload | null;
  setPendingRecipientSelection: (selection: CampaignDraftState['pendingRecipientSelection']) => void;
  clearPendingRecipientSelection: () => void;
}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
  pendingRecipientSelection: null,
  setPendingRecipientSelection: (selection) => set({ pendingRecipientSelection: selection }),
  clearPendingRecipientSelection: () => set({ pendingRecipientSelection: null }),
}));
