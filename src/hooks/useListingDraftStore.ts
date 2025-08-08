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
  updateField: (path: string, value: unknown) => void;
  resetDraft: () => void;
  setIsEditing: (isEditing: boolean) => void;
  loadDraftFromLocalStorage: () => void;
  persistDraftToLocalStorage: () => void;
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
        state.originalData = listing;
        state.draftData = listing;
        state.listingSlug = listing.listingSlug;
        state.isDirty = false;
      })
    );
  },

  updateField: (path: string, value: unknown) => {
    set(
      produce((state) => {
        if (state.draftData) {
          const oldValue = getByPath(state.draftData, path);
          setByPath(state.draftData, path, value);
          state.isDirty = true;
          
          // Log the field update
          console.log('[Editor] update', { path, oldValue, newValue: value });
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
        
        // Only load if stored draft is newer than current or if current is empty
        const shouldLoad = !draftData || 
          (updatedAt && new Date(updatedAt) > new Date());
        
        if (shouldLoad && storedDraft) {
          set(
            produce((state) => {
              state.draftData = storedDraft;
              state.isDirty = true;
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
})); 