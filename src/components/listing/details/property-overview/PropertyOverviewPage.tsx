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

const PropertyOverviewPage: React.FC<{ data: PropertyOverview, projectId: string }> = ({ data, projectId }) => {
  if (!data || !data.sections) {
    return <div>Property overview data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <FloorplanSitemapSection projectId={projectId} />
      {data.sections.map((section, idx) => (
        <SectionRenderer key={idx} section={section} sectionIndex={idx} />
      ))}
    </div>
  );
};

export default PropertyOverviewPage; 