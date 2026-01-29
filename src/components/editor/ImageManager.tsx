'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { getAvailableImages, IMAGE_CATEGORIES } from '@/utils/supabaseImages';

// User-friendly display names for categories
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'general': 'General',
  'details/property-overview/floorplansitemapsection/floorplan': 'Floor Plans',
  'details/property-overview/floorplansitemapsection/sitemap': 'Site Maps',
  'details/property-overview/aerial-images': 'Aerial Images',
  'details/property-overview/property-context-images': 'Property Context',
  'details/sponsor-profile/about': 'Sponsor Photo',
  'details/sponsor-profile/leadership/': 'Leadership Photos',
  'details/portfolio-projects/': 'Portfolio Projects',
  'details/market-analysis/market-context-images': 'Market Context'
};
import { getProjectIdFromSlug } from '@/utils/listing';

interface ImageManagerProps {
  listingSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onImagesChange?: (images: string[]) => void;
  defaultCategory?: string;
}

export default function ImageManager({ 
  listingSlug, 
  isOpen, 
  onClose, 
  onImagesChange,
  defaultCategory = 'general'
}: ImageManagerProps) {
  const projectId = getProjectIdFromSlug(listingSlug);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selectedCategory when defaultCategory changes (e.g., when opening from different sections)
  useEffect(() => {
    if (isOpen && defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const imageUrls = await getAvailableImages(projectId, selectedCategory);
      setImages(imageUrls);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedCategory]);

  // Load images when category changes
  useEffect(() => {
    if (isOpen && projectId && selectedCategory) {
      loadImages();
    }
  }, [isOpen, projectId, selectedCategory, loadImages]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      formData.append('category', selectedCategory);

      const response = await fetch(`/api/listings/${listingSlug}/images`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Images uploaded successfully');
        // Reload images to show the new one
        await loadImages();
        // Notify parent component
        if (onImagesChange) {
          // We fetch the latest images from Supabase in loadImages, 
          // but we should pass the full list to the callback
          const imageUrls = await getAvailableImages(projectId, selectedCategory);
          onImagesChange(imageUrls);
        }
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeleteError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/listings/${listingSlug}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          category: selectedCategory,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Image deleted successfully');
        // Remove image from local state
        const updatedImages = images.filter(img => img !== imageUrl);
        setImages(updatedImages);
        // Notify parent component
        if (onImagesChange) {
          onImagesChange(updatedImages);
        }
      } else {
        setDeleteError(result.error || 'Delete failed');
      }
    } catch (error) {
      setDeleteError('Delete failed. Please try again.');
    }
  };

  const clearMessages = () => {
    setUploadError(null);
    setDeleteError(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Images - {selectedCategory}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Tabs - only show for standard categories */}
        {IMAGE_CATEGORIES.includes(selectedCategory as any) && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {IMAGE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  clearMessages();
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedCategory === category
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Section */}
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={16} />
                <span>{isUploading ? 'Uploading...' : 'Upload Images'}</span>
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG, WebP, GIF up to 10MB
              </span>
            </div>
          </div>

          {/* Messages */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {uploadError}
            </div>
          )}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {deleteError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Images Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading images...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No images in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteImage(imageUrl)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 