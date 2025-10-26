'use client';

import { useEffect } from 'react';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { Listing } from '@/types/listing';

interface EditModeProviderProps {
  listing: Listing;
  slug: string;
  children: React.ReactNode;
}

export function EditModeProvider({ listing, slug, children }: EditModeProviderProps) {
  const { 
    initializeDraftWithPersistence, 
    setIsEditing 
  } = useListingDraftStore();

  useEffect(() => {
    // Initialize the draft with persistence - this handles loading from localStorage
    // and only resets if we're switching to a different listing
    initializeDraftWithPersistence(listing, slug);
    
    // Set editing mode to true
    setIsEditing(true);

    // Cleanup when component unmounts
    return () => {
      setIsEditing(false);
    };
  }, [listing, slug, initializeDraftWithPersistence, setIsEditing]);

  return <>{children}</>;
} 