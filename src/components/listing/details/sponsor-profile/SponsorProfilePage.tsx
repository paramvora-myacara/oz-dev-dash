import React from 'react';
import { SponsorProfile, SponsorProfileSection } from '@/types/listing';
import SponsorIntroSection from './SponsorIntroSection';
import PartnershipOverviewSection from './PartnershipOverviewSection';
import TrackRecordSection from './TrackRecordSection';
import LeadershipTeamSection from './LeadershipTeamSection';
import DevelopmentPortfolioSection from './DevelopmentPortfolioSection';
import KeyDevelopmentPartnersSection from './KeyDevelopmentPartnersSection';
import CompetitiveAdvantagesSection from './CompetitiveAdvantagesSection';

const SectionRenderer = ({ section, sectionIndex }: { section: SponsorProfileSection; sectionIndex: number }) => {
  switch (section.type) {
    case 'sponsorIntro':
      return <SponsorIntroSection data={section.data} sectionIndex={sectionIndex} />;
    case 'partnershipOverview':
        return <PartnershipOverviewSection data={section.data} sectionIndex={sectionIndex} />
    case 'trackRecord':
      return <TrackRecordSection data={section.data} sectionIndex={sectionIndex} />;
    case 'leadershipTeam':
      return <LeadershipTeamSection data={section.data} sectionIndex={sectionIndex} />;
    case 'developmentPortfolio':
      return <DevelopmentPortfolioSection data={section.data} sectionIndex={sectionIndex} />;
    case 'keyDevelopmentPartners':
        return <KeyDevelopmentPartnersSection data={section.data} sectionIndex={sectionIndex} />
    case 'competitiveAdvantages':
        return <CompetitiveAdvantagesSection data={section.data} sectionIndex={sectionIndex} />
    default:
      return null;
  }
};

const SponsorProfilePage: React.FC<{ data: SponsorProfile }> = ({ data }) => {
  if (!data || !data.sections) {
    return <div>Sponsor profile data is loading or missing...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {data.sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} sectionIndex={idx} />
      ))}
    </div>
  );
};

export default SponsorProfilePage; 