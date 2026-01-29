import React from 'react';
import { MarketAnalysis } from '@/types/listing';
import MarketMetricsSection from './MarketMetricsSection';
import MajorEmployersSection from './MajorEmployersSection';
import DemographicsSection from './DemographicsSection';
import KeyMarketDriversSection from './KeyMarketDriversSection';
import SupplyDemandSection from './SupplyDemandSection';
import CompetitiveAnalysisSection from './CompetitiveAnalysisSection';
import EconomicDiversificationSection from './EconomicDiversificationSection';
import MarketContextImagesSection from './MarketContextImagesSection';

interface MarketAnalysisPageProps {
  data: MarketAnalysis;
  isEditMode?: boolean;
  listingSlug?: string;
}

const SectionRenderer = ({ section, sectionIndex }: { section: any; sectionIndex: number }) => {
  switch (section.type) {
    case 'marketMetrics':
      return <MarketMetricsSection data={section.data} sectionIndex={sectionIndex} />;
    case 'majorEmployers':
      return <MajorEmployersSection data={section.data} sectionIndex={sectionIndex} />;
    case 'demographics':
        return <DemographicsSection data={section.data} sectionIndex={sectionIndex} />
    case 'keyMarketDrivers':
        return <KeyMarketDriversSection data={section.data} sectionIndex={sectionIndex} />
    case 'supplyDemand':
        return <SupplyDemandSection data={section.data} sectionIndex={sectionIndex} />
    case 'competitiveAnalysis':
        return <CompetitiveAnalysisSection data={section.data} sectionIndex={sectionIndex} />
    case 'economicDiversification':
        return <EconomicDiversificationSection data={section.data} sectionIndex={sectionIndex} />
    default:
      return null;
  }
};

const MarketAnalysisPage: React.FC<MarketAnalysisPageProps> = ({ 
  data,
  isEditMode = false,
  listingSlug = ''
}) => {
  if (!data || !data.sections) {
    return <div>Market analysis data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <MarketContextImagesSection 
        isEditMode={isEditMode}
        listingSlug={listingSlug}
      />

      {data.sections.map((section, idx) => (
        <SectionRenderer key={idx} section={section} sectionIndex={idx} />
      ))}
    </div>
  );
};

export default MarketAnalysisPage; 