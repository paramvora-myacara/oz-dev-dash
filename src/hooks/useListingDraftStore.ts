import { create } from 'zustand';
import { produce } from 'immer';
import { Listing } from '@/types/listing';
import { getByPath, setByPath } from '@/utils/objectPath';

interface DraftStore {
  // State
  originalData: Listing | null;
  draftData: Listing | null;
  listingSlug: string | null;
  isDirty: boolean;
  isEditing: boolean;

  // Actions
  initializeDraft: (listing: Listing) => void;
  initializeDraftWithPersistence: (listing: Listing) => void;
  updateField: (path: string, value: unknown) => void;
  resetDraft: () => void;
  setIsEditing: (isEditing: boolean) => void;
  loadDraftFromLocalStorage: () => void;
  persistDraftToLocalStorage: () => void;
  checkForUnsavedChanges: () => boolean;
}

const STORAGE_KEY_PREFIX = 'ozdash:draft:';

export const useListingDraftStore = create<DraftStore>((set, get) => ({
  // Initial state
  originalData: null,
  draftData: null,
  listingSlug: null,
  isDirty: false,
  isEditing: false,

  // Actions
  initializeDraft: (listing: Listing) => {
    set(
      produce((state) => {
        // If we're switching to a different listing, reset everything
        if (state.listingSlug !== listing.listingSlug) {
          state.originalData = listing;
          state.draftData = listing;
          state.listingSlug = listing.listingSlug;
          state.isDirty = false;
        } else {
          // Same listing - only set original data if not already set
          if (!state.originalData) {
            state.originalData = listing;
          }
          // Don't reset draft data for the same listing - preserve existing changes
        }
      })
    );
  },

  updateField: (path: string, value: unknown) => {
    set(
      produce((state) => {
        if (state.draftData) {
          setByPath(state.draftData, path, value);
          // Update isDirty based on actual comparison with original data
          state.isDirty = JSON.stringify(state.originalData) !== JSON.stringify(state.draftData);
        }
      })
    );
  },

  resetDraft: () => {
    const { listingSlug } = get();
    if (listingSlug) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${listingSlug}`);
    }
    
    set(
      produce((state) => {
        state.draftData = state.originalData;
        state.isDirty = false;
      })
    );
  },

  setIsEditing: (isEditing: boolean) => {
    set({ isEditing });
  },

  loadDraftFromLocalStorage: () => {
    const { listingSlug, originalData, draftData } = get();
    
    if (!listingSlug || !originalData) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${listingSlug}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const { updatedAt, draftData: storedDraft } = JSON.parse(stored);
        
        // Always load if we have stored draft data, regardless of current state
        // This ensures changes persist across page navigation
        if (storedDraft) {
          set(
            produce((state) => {
              state.draftData = storedDraft;
              // Update isDirty based on actual comparison with original data
              state.isDirty = JSON.stringify(state.originalData) !== JSON.stringify(storedDraft);
            })
          );
        }
      } catch (error) {
        console.warn('Failed to load draft from localStorage:', error);
      }
    }
  },

  persistDraftToLocalStorage: () => {
    const { listingSlug, draftData } = get();
    
    if (!listingSlug || !draftData) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${listingSlug}`;
    const data = {
      updatedAt: new Date().toISOString(),
      draftData
    };
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist draft to localStorage:', error);
    }
  },

  initializeDraftWithPersistence: (listing: Listing) => {
    const { listingSlug } = get();
    
    // If we're switching to a different listing, reset everything
    if (listingSlug !== listing.listingSlug) {
      set(
        produce((state) => {
          state.originalData = listing;
          state.draftData = listing;
          state.listingSlug = listing.listingSlug;
          state.isDirty = false;
        })
      );
    } else {
      // Same listing - set original data if not set, then try to load from localStorage
      set(
        produce((state) => {
          if (!state.originalData) {
            state.originalData = listing;
          }
        })
      );
      
      // Load any existing draft from localStorage for the same listing
      const storageKey = `${STORAGE_KEY_PREFIX}${listing.listingSlug}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const { draftData: storedDraft } = JSON.parse(stored);
          if (storedDraft) {
            set(
              produce((state) => {
                state.draftData = storedDraft;
                state.isDirty = JSON.stringify(state.originalData) !== JSON.stringify(storedDraft);
              })
            );
          }
        } catch (error) {
          console.warn('Failed to load draft from localStorage:', error);
        }
      }
    }
  },

  checkForUnsavedChanges: () => {
    const { originalData, draftData } = get();
    if (!originalData || !draftData) return false;
    
    // Simple deep comparison - in a real app you might want a more sophisticated comparison
    return JSON.stringify(originalData) !== JSON.stringify(draftData);
  },
})); 