import React from 'react';
import { FinancialReturns } from '@/types/listing';
import ProjectionsSection from './ProjectionsSection';
import DistributionTimelineSection from './DistributionTimelineSection';
import TaxBenefitsSection from './TaxBenefitsSection';
import InvestmentStructureSection from './InvestmentStructureSection';

const SectionRenderer = ({ section }: { section: any }) => {
  switch (section.type) {
    case 'projections':
      return <ProjectionsSection data={section.data} />;
    case 'distributionTimeline':
      return <DistributionTimelineSection data={section.data} />;
    case 'taxBenefits':
      return <TaxBenefitsSection data={section.data} />;
    case 'investmentStructure':
      return <InvestmentStructureSection data={section.data} />;
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
                <SectionRenderer section={section} />
                {data.sections[idx + 1] && (data.sections[idx + 1].type === 'taxBenefits' || data.sections[idx + 1].type === 'investmentStructure') &&
                  <SectionRenderer section={data.sections[idx + 1]} />
                }
              </div>
            )
          }
        } else {
          return <SectionRenderer key={idx} section={section} />
        }
        return null;
      })}
    </div>
  );
};

export default FinancialReturnsPage; 