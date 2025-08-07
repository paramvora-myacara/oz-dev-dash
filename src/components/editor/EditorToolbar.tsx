'use client';

import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function EditorToolbar() {
  const { 
    isEditing, 
    isDirty, 
    draftData, 
    listingSlug, 
    resetDraft, 
    persistDraftToLocalStorage 
  } = useListingDraftStore();
  const router = useRouter();

  // Debounced persistence
  useEffect(() => {
    if (!isDirty || !isEditing) return;

    const timeoutId = setTimeout(() => {
      persistDraftToLocalStorage();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isDirty, isEditing, persistDraftToLocalStorage]);

  const handleSave = () => {
    if (draftData && listingSlug) {
      console.log('SAVE_DRAFT', { slug: listingSlug, draftData });
      // In a real implementation, this would call an API
      alert('Draft saved! Check console for payload.');
    }
  };

  const handleCancel = () => {
    resetDraft();
    // Navigate back to the non-edit version
    if (listingSlug) {
      router.push(`/${listingSlug}`);
    }
  };

  if (!isEditing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">
            Editing Mode
          </span>
          {isDirty && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
} 