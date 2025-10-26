'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, Image as ImageIcon, Plus } from "lucide-react";
import ImageCarousel from '@/components/ImageCarousel';
import Lightbox from '@/components/Lightbox';
import ImageManager from '@/components/editor/ImageManager';
import { getAvailableImages } from '@/utils/supabaseImages';
import { slugify } from '@/utils/slugify';
import { ProjectOverviewSectionData, PortfolioProject } from '@/types/listing';
import { Editable } from '@/components/Editable';
import { useListingDraftStore } from '@/hooks/useListingDraftStore';

interface ProjectImagePlaceholderProps {
  projectName: string;
  isEditMode?: boolean;
  projectId: string;
  listingSlug: string;
  onImagesChange?: (images: string[]) => void;
}

const ProjectImagePlaceholder: React.FC<ProjectImagePlaceholderProps> = ({ 
  projectName, 
  isEditMode = false, 
  projectId, 
  listingSlug, 
  onImagesChange 
}) => {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  
  const handleUploadImages = () => {
    setIsImageManagerOpen(true);
  };
  
  return (
    <>
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            No images available for {projectName}
          </p>
          {isEditMode && (
            <button 
              onClick={handleUploadImages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Upload Images
            </button>
          )}
        </div>
      </div>
      
      {/* Image Manager Modal */}
      {isImageManagerOpen && (
        <ImageManager
          listingSlug={listingSlug}
          projectId={projectId}
          defaultCategory={`details/portfolio-projects/${slugify(projectName)}`}
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          onImagesChange={onImagesChange}
        />
      )}
    </>
  );
};

const ProjectImageSkeleton: React.FC = () => (
  <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg" />
  </div>
);

interface PortfolioProjectsSectionProps {
  data: ProjectOverviewSectionData;
  sectionIndex: number;
  projectId: string;
  isEditMode?: boolean;
  listingSlug?: string;
}

const PortfolioProjectsSection: React.FC<PortfolioProjectsSectionProps> = ({ 
  data, 
  sectionIndex, 
  projectId, 
  isEditMode = false,
  listingSlug = ''
}) => {
  const [projectImages, setProjectImages] = useState<{ [key: string]: string[] }>({});
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [openImageManagerFor, setOpenImageManagerFor] = useState<string | null>(null);
  const { updateField } = useListingDraftStore();
  
  useEffect(() => {
    const loadProjectImages = async () => {
      const images: { [key: string]: string[] } = {};
      const loading: { [key: string]: boolean } = {};
      
      // Initialize loading states
      data.projects.forEach(project => {
        loading[project.name] = true;
      });
      setLoadingStates(loading);
      
      // Load images for each project
      for (const project of data.projects) {
        try {
          const folderName = slugify(project.name);
          const projectImages = await getAvailableImages(
            projectId,
            `details/portfolio-projects/${folderName}`
          );
          
          images[project.name] = projectImages;
        } catch (error) {
          console.warn(`No images found for project: ${project.name}`);
          images[project.name] = []; // Empty array for no images
        }
        
        // Update loading state
        setLoadingStates(prev => ({
          ...prev,
          [project.name]: false
        }));
      }
      
      setProjectImages(images);
    };
    
    loadProjectImages();
  }, [data.projects, projectId]);

  const handleImageClick = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const handleImagesChange = (projectName: string, newImages: string[]) => {
    setProjectImages(prev => ({
      ...prev,
      [projectName]: newImages
    }));
  };

  const handleOpenImageManager = (projectName: string) => {
    setOpenImageManagerFor(projectName);
  };

  const handleCloseImageManager = () => {
    setOpenImageManagerFor(null);
  };

  const handleAddProject = () => {
    const newProject: PortfolioProject = {
      name: "New Project",
      location: "Location",
      units: 0,
      status: "Status",
      rentableSqFt: "0",
      stabilizedNOI: "$0",
      capRate: "0%"
    };
    
    updateField(`sections[${sectionIndex}].data.projects`, [...data.projects, newProject]);
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = data.projects.filter((_, i) => i !== index);
    updateField(`sections[${sectionIndex}].data.projects`, updatedProjects);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Portfolio Projects Management
            </h3>
            <button 
              onClick={handleAddProject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Project
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-12">
        {data.projects.map((project, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row overflow-hidden">
            {/* Project Details */}
            <div className="lg:w-1/2 p-8 flex flex-col">
              {/* Edit Mode Controls for Individual Project */}
              {isEditMode && (
                <div className="mb-4 flex justify-end">
                  <button 
                    onClick={() => handleRemoveProject(idx)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove Project
                  </button>
                </div>
              )}
              
              <Editable 
                dataPath={`sections[${sectionIndex}].data.projects[${idx}].name`}
                value={project.name}
                className="text-3xl font-bold text-indigo-900 dark:text-indigo-300 mb-6"
              />
              
              <div className="space-y-4 flex-grow mb-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />Location
                  </span>
                  <Editable 
                    dataPath={`sections[${sectionIndex}].data.projects[${idx}].location`}
                    value={project.location}
                    className="font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                    <Users className="w-5 h-5 mr-2" />Units
                  </span>
                  <Editable 
                    dataPath={`sections[${sectionIndex}].data.projects[${idx}].units`}
                    value={project.units.toString()}
                    className="font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />Cap Rate
                  </span>
                  <Editable 
                    dataPath={`sections[${sectionIndex}].data.projects[${idx}].capRate`}
                    value={project.capRate}
                    className="font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Rentable SF</span>
                  <Editable 
                    dataPath={`sections[${sectionIndex}].data.projects[${idx}].rentableSqFt`}
                    value={project.rentableSqFt}
                    className="font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Stabilized NOI</span>
                  <Editable 
                    dataPath={`sections[${sectionIndex}].data.projects[${idx}].stabilizedNOI`}
                    value={project.stabilizedNOI}
                    className="font-bold text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div className="mt-auto">
                <Editable 
                  dataPath={`sections[${sectionIndex}].data.projects[${idx}].status`}
                  value={project.status}
                  className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded-full font-medium"
                />
              </div>
            </div>
            
            {/* Image Section */}
            <div className="lg:w-1/2 h-64 lg:h-auto relative">
              {loadingStates[project.name] ? (
                <ProjectImageSkeleton />
              ) : projectImages[project.name]?.length > 0 ? (
                <>
                  <ImageCarousel
                    images={projectImages[project.name]}
                    className="h-full"
                    autoplay={true}
                    onImageClick={(index) => handleImageClick(projectImages[project.name], index)}
                  />
                  
                  {/* Manage Images Button - positioned over the carousel */}
                  {isEditMode && listingSlug && (
                    <button
                      onClick={() => handleOpenImageManager(project.name)}
                      className="absolute top-4 right-4 z-10 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                      title="Manage Images"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </>
              ) : (
                <ProjectImagePlaceholder 
                  projectName={project.name}
                  isEditMode={isEditMode}
                  projectId={projectId}
                  listingSlug={listingSlug}
                  onImagesChange={(images) => handleImagesChange(project.name, images)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Lightbox */}
      {isLightboxOpen && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxStartIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {/* Image Manager Modal for each project */}
      {isEditMode && listingSlug && openImageManagerFor && (
        <ImageManager
          listingSlug={listingSlug}
          projectId={projectId}
          isOpen={openImageManagerFor !== null}
          onClose={handleCloseImageManager}
          onImagesChange={(images) => handleImagesChange(openImageManagerFor, images)}
          defaultCategory={`details/portfolio-projects/${slugify(openImageManagerFor)}`}
        />
      )}
    </div>
  );
};

export default PortfolioProjectsSection;
