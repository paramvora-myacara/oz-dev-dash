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
    initializeDraftWithPersistence, 
    setIsEditing 
  } = useListingDraftStore();

  useEffect(() => {
    // Initialize the draft with persistence - this handles loading from localStorage
    // and only resets if we're switching to a different listing
    initializeDraftWithPersistence(listing);
    
    // Set editing mode to true
    setIsEditing(true);

    // Cleanup when component unmounts
    return () => {
      setIsEditing(false);
    };
  }, [listing, initializeDraftWithPersistence, setIsEditing]);

  return <>{children}</>;
} 