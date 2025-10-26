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
  initializeDraft: (listing: Listing, slug: string) => void;
  initializeDraftWithPersistence: (listing: Listing, slug: string) => void;
  updateField: (path: string, value: unknown) => void;
  resetDraft: () => void;
  setIsEditing: (isEditing: boolean) => void;
  loadDraftFromLocalStorage: () => void;
  persistDraftToLocalStorage: () => void;
  checkForUnsavedChanges: () => boolean;
  markAsSaved: () => void;
}

const STORAGE_KEY_PREFIX = 'ozdash:draft:';

// Helper function to validate Listing structure
function validateListingStructure(data: any): boolean {
  return data && 
         typeof data.listingName === 'string' &&
         Array.isArray(data.sections) &&
         data.details &&
         typeof data.details === 'object';
}

export const useListingDraftStore = create<DraftStore>((set, get) => ({
  // Initial state
  originalData: null,
  draftData: null,
  listingSlug: null,
  isDirty: false,
  isEditing: false,

  // Actions
  initializeDraft: (listing: Listing, slug: string) => {
    console.log('🔧 initializeDraft called with:', {
      listingName: listing.listingName,
      slug: slug,
      hasSections: Array.isArray(listing.sections),
      hasDetails: !!listing.details
    });
    
    set(
      produce((state) => {
        // If we're switching to a different listing, reset everything
        if (state.listingSlug !== slug) {
          state.originalData = listing;
          state.draftData = listing;
          state.listingSlug = slug;
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
    const { draftData } = get();
    
    // Validate draftData structure before update
    if (draftData && !validateListingStructure(draftData)) {
      console.error('❌ Invalid draftData structure before update:', {
        hasListingName: !!draftData.listingName,
        hasSections: Array.isArray(draftData.sections),
        hasDetails: !!draftData.details,
        path,
        value
      });
      return;
    }
    
    set(
      produce((state) => {
        if (state.draftData) {
          setByPath(state.draftData, path, value);
          
          // Validate after update
          if (!validateListingStructure(state.draftData)) {
            console.error('❌ Invalid draftData structure after update:', {
              hasListingName: !!state.draftData.listingName,
              hasSections: Array.isArray(state.draftData.sections),
              hasDetails: !!state.draftData.details,
              path,
              value
            });
          }
          
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
        
        // Validate stored draft before loading
        if (storedDraft && !validateListingStructure(storedDraft)) {
          console.error('❌ Invalid stored draft structure:', {
            hasListingName: !!storedDraft.listingName,
            hasSections: Array.isArray(storedDraft.sections),
            hasDetails: !!storedDraft.details
          });
          // Don't load invalid data
          return;
        }
        
        // Always load if we have stored draft data, regardless of current state
        // This ensures changes persist across page navigation
        if (storedDraft) {
          console.log('📥 Loading draft from localStorage:', {
            listingName: storedDraft.listingName,
            hasSections: Array.isArray(storedDraft.sections),
            hasDetails: !!storedDraft.details
          });
          
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

    // Validate before persisting
    if (!validateListingStructure(draftData)) {
      console.error('❌ Cannot persist invalid draftData structure:', {
        hasListingName: !!draftData.listingName,
        hasSections: Array.isArray(draftData.sections),
        hasDetails: !!draftData.details
      });
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${listingSlug}`;
    const data = {
      updatedAt: new Date().toISOString(),
      draftData
    };
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('💾 Persisted draft to localStorage:', {
        listingName: draftData.listingName,
        hasSections: Array.isArray(draftData.sections),
        hasDetails: !!draftData.details
      });
    } catch (error) {
      console.warn('Failed to persist draft to localStorage:', error);
    }
  },

  initializeDraftWithPersistence: (listing: Listing, slug: string) => {
    const { listingSlug } = get();
    
    console.log('🔧 initializeDraftWithPersistence called:', {
      currentSlug: listingSlug,
      newSlug: slug,
      listingName: listing.listingName,
      hasSections: Array.isArray(listing.sections),
      hasDetails: !!listing.details
    });
    
    // If we're switching to a different listing, reset everything
    if (listingSlug !== slug) {
      set(
        produce((state) => {
          state.originalData = listing;
          state.draftData = listing;
          state.listingSlug = slug;
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
      const storageKey = `${STORAGE_KEY_PREFIX}${slug}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const { draftData: storedDraft } = JSON.parse(stored);
          if (storedDraft) {
            // Validate stored draft before loading
            if (!validateListingStructure(storedDraft)) {
              console.error('❌ Invalid stored draft structure, resetting to original');
              return;
            }
            
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

  markAsSaved: () => {
    const { listingSlug, draftData } = get();
    
    if (!listingSlug || !draftData) return;

    set(
      produce((state) => {
        // Update original data to match the saved draft
        state.originalData = draftData;
        // Clear the dirty flag since changes are now saved
        state.isDirty = false;
      })
    );

    // Clear localStorage since the draft is now saved
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${listingSlug}`);
    
    console.log('✅ Marked draft as saved:', {
      listingName: draftData.listingName,
      listingSlug: listingSlug
    });
  },

  checkForUnsavedChanges: () => {
    const { originalData, draftData } = get();
    if (!originalData || !draftData) return false;
    
    // Simple deep comparison - in a real app you might want a more sophisticated comparison
    return JSON.stringify(originalData) !== JSON.stringify(draftData);
  },
})); 