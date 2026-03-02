import { create } from 'zustand';

interface CampaignDraftState {
  pendingContactIds: string[];
  setPendingContacts: (ids: string[]) => void;
  clearPendingContacts: () => void;
}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
  pendingContactIds: [],
  setPendingContacts: (ids) => set({ pendingContactIds: ids }),
  clearPendingContacts: () => set({ pendingContactIds: [] }),
}));
