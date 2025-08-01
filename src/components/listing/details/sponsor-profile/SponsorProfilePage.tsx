import React from 'react';
import { SponsorProfile, SponsorProfileSection } from '@/types/listing';
import SponsorIntroSection from './SponsorIntroSection';
import PartnershipOverviewSection from './PartnershipOverviewSection';
import TrackRecordSection from './TrackRecordSection';
import LeadershipTeamSection from './LeadershipTeamSection';
import DevelopmentPortfolioSection from './DevelopmentPortfolioSection';
import KeyDevelopmentPartnersSection from './KeyDevelopmentPartnersSection';
import CompetitiveAdvantagesSection from './CompetitiveAdvantagesSection';

const SectionRenderer = ({ section }: { section: SponsorProfileSection }) => {
  switch (section.type) {
    case 'sponsorIntro':
      return <SponsorIntroSection data={section.data} />;
    case 'partnershipOverview':
        return <PartnershipOverviewSection data={section.data} />
    case 'trackRecord':
      return <TrackRecordSection data={section.data} />;
    case 'leadershipTeam':
      return <LeadershipTeamSection data={section.data} />;
    case 'developmentPortfolio':
      return <DevelopmentPortfolioSection data={section.data} />;
    case 'keyDevelopmentPartners':
        return <KeyDevelopmentPartnersSection data={section.data} />
    case 'competitiveAdvantages':
        return <CompetitiveAdvantagesSection data={section.data} />
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
          <SectionRenderer key={idx} section={section} />
      ))}
    </div>
  );
};

export default SponsorProfilePage; 