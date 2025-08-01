import React from 'react';
import { MarketAnalysis } from '@/types/listing';
import MarketMetricsSection from './MarketMetricsSection';
import MajorEmployersSection from './MajorEmployersSection';
import DemographicsSection from './DemographicsSection';
import KeyMarketDriversSection from './KeyMarketDriversSection';
import SupplyDemandSection from './SupplyDemandSection';
import CompetitiveAnalysisSection from './CompetitiveAnalysisSection';
import EconomicDiversificationSection from './EconomicDiversificationSection';

const SectionRenderer = ({ section }: { section: any }) => {
  switch (section.type) {
    case 'marketMetrics':
      return <MarketMetricsSection data={section.data} />;
    case 'majorEmployers':
      return <MajorEmployersSection data={section.data} />;
    case 'demographics':
        return <DemographicsSection data={section.data} />
    case 'keyMarketDrivers':
        return <KeyMarketDriversSection data={section.data} />
    case 'supplyDemand':
        return <SupplyDemandSection data={section.data} />
    case 'competitiveAnalysis':
        return <CompetitiveAnalysisSection data={section.data} />
    case 'economicDiversification':
        return <EconomicDiversificationSection data={section.data} />
    default:
      return null;
  }
};

const MarketAnalysisPage: React.FC<{ data: MarketAnalysis }> = ({ data }) => {
  if (!data || !data.sections) {
    return <div>Market analysis data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {data.sections.map((section, idx) => (
        <SectionRenderer key={idx} section={section} />
      ))}
    </div>
  );
};

export default MarketAnalysisPage; 