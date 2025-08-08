'use client';

import { useListingDraftStore } from '@/hooks/useListingDraftStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, RotateCcw, Loader2 } from 'lucide-react';

interface VersionMeta {
  id: string;
  version_number: number;
  created_at: string;
  published_at: string;
  is_current?: boolean;
}

export function EditorToolbar() {
  const { 
    isEditing, 
    isDirty, 
    draftData, 
    listingSlug, 
    resetDraft, 
    persistDraftToLocalStorage,
    initializeDraft,
    markAsSaved
  } = useListingDraftStore();
  const router = useRouter();
  
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced persistence
  useEffect(() => {
    if (!isDirty || !isEditing) return;

    const timeoutId = setTimeout(() => {
      persistDraftToLocalStorage();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isDirty, isEditing, persistDraftToLocalStorage]);

  // Load versions when editing starts
  useEffect(() => {
    if (isEditing && listingSlug) {
      loadVersions();
    }
  }, [isEditing, listingSlug]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVersionDropdown(false);
      }
    };

    if (showVersionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVersionDropdown]);

  // Clear error/success messages after a delay
  useEffect(() => {
    if (rollbackError) {
      const timer = setTimeout(() => setRollbackError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [rollbackError]);

  useEffect(() => {
    if (rollbackSuccess) {
      const timer = setTimeout(() => setRollbackSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [rollbackSuccess]);



  const loadVersions = async () => {
    if (!listingSlug) return;
    
    setIsLoadingVersions(true);
    try {
      const response = await fetch(`/api/listings/${listingSlug}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      } else {
        console.error('Failed to load versions');
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    if (draftData && listingSlug) {
      console.log('SAVE_DRAFT', { slug: listingSlug, draftData });
      
      try {
        const response = await fetch(`/api/listings/${listingSlug}/versions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: draftData }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Draft saved successfully:', result);
          setShowSaveSuccess(true);
          setSaveError(null);
          
          // Mark the draft as saved to clear the dirty state
          markAsSaved();
          
          // Reload versions to show the new saved version
          await loadVersions();
        } else {
          const error = await response.json();
          console.error('❌ Save failed:', error);
          setSaveError(`Save failed: ${error.error || 'Unknown error'}`);
          setShowSaveSuccess(false);
        }
      } catch (error) {
        console.error('❌ Save error:', error);
        setSaveError('Save failed. Please try again.');
        setShowSaveSuccess(false);
      }
    }
  };

  const handleCancel = () => {
    resetDraft();
    // Navigate back to the non-edit version
    if (listingSlug) {
      router.push(`/${listingSlug}`);
    }
  };

  const handleRollbackClick = () => {
    if (isDirty) {
      setShowRollbackConfirm(true);
    } else {
      setShowVersionDropdown(true);
    }
  };

  const handleRollbackConfirm = () => {
    setShowRollbackConfirm(false);
    setShowVersionDropdown(true);
  };

  const handleRollbackCancel = () => {
    setShowRollbackConfirm(false);
    setSelectedVersionId(null);
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId);
    setShowVersionDropdown(false);
    performRollback(versionId);
  };

  const performRollback = async (versionId: string) => {
    if (!listingSlug) return;
    
    setIsRollingBack(true);
    setRollbackError(null);
    setRollbackSuccess(null);
    
    try {
      const response = await fetch(`/api/listings/${listingSlug}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Clear local draft
        resetDraft();
        
        // Show success message
        setRollbackSuccess(`Successfully rolled back to version ${result.message}`);
        
        // Reload the page to get the new current version after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        setRollbackError(`Rollback failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Rollback error:', error);
      setRollbackError('Rollback failed. Please try again.');
    } finally {
      setIsRollingBack(false);
      setSelectedVersionId(null);
    }
  };

  const formatVersionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isEditing) return null;

  return (
    <>
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
            {rollbackError && (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                {rollbackError}
              </span>
            )}
            {rollbackSuccess && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                {rollbackSuccess}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Rollback Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleRollbackClick}
                disabled={isRollingBack || isLoadingVersions}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isRollingBack ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>{isRollingBack ? 'Rolling back...' : 'Rollback'}</span>
                {!isRollingBack && <ChevronDown className="w-4 h-4" />}
              </button>
              
              {/* Version Dropdown */}
              {showVersionDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Select Version to Rollback</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      This will replace the current version with the selected version
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingVersions ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading versions...
                      </div>
                    ) : versions.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No versions available
                      </div>
                    ) : (
                      versions.map((version) => (
                        <button
                          key={version.id}
                          onClick={() => handleVersionSelect(version.id)}
                          disabled={isRollingBack || version.is_current}
                          className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                                <span>Version {version.version_number}</span>
                                {version.is_current && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatVersionDate(version.created_at)}
                              </div>
                            </div>
                            {isRollingBack && selectedVersionId === version.id && (
                              <div className="text-xs text-blue-600">Rolling back...</div>
                            )}
                            {version.is_current && (
                              <div className="text-xs text-gray-400">Already current</div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowVersionDropdown(false)}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

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
              Save and Publish
            </button>
          </div>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unsaved Changes
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Rolling back will discard these changes. Are you sure you want to continue?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleRollbackCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRollbackConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Discard & Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveSuccess && (
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-60"
          onClick={() => setShowSaveSuccess(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Successfully Published!
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSaveSuccess(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Your changes have been saved and published as a new version.
            </p>
          </div>
        </div>
      )}

      {/* Save Error Modal */}
      {saveError && (
        <div 
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-60"
          onClick={() => setSaveError(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Save Failed
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSaveError(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {saveError}
            </p>
          </div>
        </div>
      )}
    </>
  );
} 