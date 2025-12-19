import React from 'react';
import { FinancialReturns } from '@/types/listing';
import ProjectionsSection from './ProjectionsSection';
import CapitalStackSection from './CapitalStackSection';
import DistributionTimelineSection from './DistributionTimelineSection';
import TaxBenefitsSection from './TaxBenefitsSection';
import InvestmentStructureSection from './InvestmentStructureSection';
import WaterfallSection from './WaterfallSection';

const SectionRenderer = ({ section, sectionIndex }: { section: any; sectionIndex: number }) => {
  switch (section.type) {
    case 'projections':
      return <ProjectionsSection data={section.data} sectionIndex={sectionIndex} />;
    case 'capitalStack':
      return <CapitalStackSection data={section.data} sectionIndex={sectionIndex} />;
    case 'distributionTimeline':
      return <DistributionTimelineSection data={section.data} sectionIndex={sectionIndex} />;
    case 'taxBenefits':
      return <TaxBenefitsSection data={section.data} sectionIndex={sectionIndex} />;
    case 'investmentStructure':
      return <InvestmentStructureSection data={section.data} sectionIndex={sectionIndex} />;
    case 'distributionWaterfall':
      return <WaterfallSection data={section.data} sectionIndex={sectionIndex} />;
    default:
      return null;
  }
};

const FinancialReturnsPage: React.FC<{ data: FinancialReturns }> = ({ data }) => {
  if (!data || !data.sections) {
    return <div>Financial returns data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {data.sections.map((section, idx) => {
        if (section.type === 'taxBenefits' || section.type === 'investmentStructure') {
          if (idx === 0 || (data.sections[idx - 1].type !== 'taxBenefits' && data.sections[idx - 1].type !== 'investmentStructure')) {
            return (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <SectionRenderer section={section} sectionIndex={idx} />
                {data.sections[idx + 1] && (data.sections[idx + 1].type === 'taxBenefits' || data.sections[idx + 1].type === 'investmentStructure') &&
                  <SectionRenderer section={data.sections[idx + 1]} sectionIndex={idx + 1} />
                }
              </div>
            )
          }
        } else {
          return <SectionRenderer key={idx} section={section} sectionIndex={idx} />
        }
        return null;
      })}
    </div>
  );
};

export default FinancialReturnsPage; 