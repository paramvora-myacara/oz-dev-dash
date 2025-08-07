'use client';

import { useEffect } from 'react';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { Listing } from '@/types/listing';

interface EditModeProviderProps {
  listing: Listing;
  children: React.ReactNode;
}

export function EditModeProvider({ listing, children }: EditModeProviderProps) {
  const { 
    initializeDraft, 
    loadDraftFromLocalStorage, 
    setIsEditing 
  } = useListingDraftStore();

  useEffect(() => {
    // Initialize the draft with the listing data
    initializeDraft(listing);
    
    // Load any existing draft from localStorage
    loadDraftFromLocalStorage();
    
    // Set editing mode to true
    setIsEditing(true);

    // Cleanup when component unmounts
    return () => {
      setIsEditing(false);
    };
  }, [listing, initializeDraft, loadDraftFromLocalStorage, setIsEditing]);

  return <>{children}</>;
} 