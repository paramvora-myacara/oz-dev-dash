import React from 'react';
import { PropertyOverview } from '@/types/listing';
import KeyFactsSection from './KeyFactsSection';
import AmenitiesSection from './AmenitiesSection';
import UnitMixSection from './UnitMixSection';
import LocationHighlightsSection from './LocationHighlightsSection';
import LocationFeaturesSection from './LocationFeaturesSection';
import DevelopmentTimelineSection from './DevelopmentTimelineSection';
import DevelopmentPhasesSection from './DevelopmentPhasesSection';
import FloorplanSitemapSection from '@/components/FloorplanSitemapSection';
import AerialImagesSection from '@/components/AerialImagesSection';
import PropertyContextImagesSection from './PropertyContextImagesSection';

interface PropertyOverviewPageProps {
  data: PropertyOverview;
  isEditMode?: boolean;
  listingSlug?: string;
}

const SectionRenderer = ({ section, sectionIndex }: { section: any; sectionIndex: number }) => {
  switch (section.type) {
    case 'keyFacts':
      return <KeyFactsSection data={section.data} sectionIndex={sectionIndex} />;
    case 'amenities':
      return <AmenitiesSection data={section.data} sectionIndex={sectionIndex} />;
    case 'unitMix':
      return <UnitMixSection data={section.data} sectionIndex={sectionIndex} />;
    case 'locationHighlights':
      return <LocationHighlightsSection data={section.data} sectionIndex={sectionIndex} />;
    case 'locationFeatures':
      return <LocationFeaturesSection data={section.data} sectionIndex={sectionIndex} />;
    case 'developmentTimeline':
      return <DevelopmentTimelineSection data={section.data} sectionIndex={sectionIndex} />;
    case 'developmentPhases':
      return <DevelopmentPhasesSection data={section.data} sectionIndex={sectionIndex} />;
    default:
      return null;
  }
};

const PropertyOverviewPage: React.FC<PropertyOverviewPageProps> = ({
  data,
  isEditMode = false,
  listingSlug = ''
}) => {
  if (!data || !data.sections) {
    return <div>Property overview data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PropertyContextImagesSection 
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />

      {/* FloorplanSitemapSection handles its own placeholder in edit mode */}
      <FloorplanSitemapSection
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />

      <AerialImagesSection
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />

      {data.sections.map((section, idx) => (
        <SectionRenderer key={idx} section={section} sectionIndex={idx} />
      ))}
    </div>
  );
};

export default PropertyOverviewPage; 