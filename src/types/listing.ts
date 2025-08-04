export interface TickerMetric {
  label: string;
  value: string;
  change: string;
}

export interface CompellingReason {
  title: string;
  description: string;
  highlight: string;
  icon: string; 
}

export interface KeyMetric {
  label: string;
  value: string;
}

export interface InvestmentCard {
  id: 'financial-returns' | 'property-overview' | 'market-analysis' | 'sponsor-profile';
  title: string;
  keyMetrics: KeyMetric[];
  summary: string;
}

export interface FinancialProjection {
  label: string;
  value: string;
  description: string;
}

export interface DistributionPhase {
  year: string;
  phase: string;
  distribution: string;
  description: string;
}

export interface TaxBenefit {
  title: string;
  description: string;
}

export interface InvestmentStructureItem {
  label: string;
  value: string;
}

export interface FinancialReturns {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: FinancialReturnsSection[];
}

export interface KeyPropertyFact {
  label: string;
  value: string;
  description: string;
}

export interface Amenity {
  name: string;
  icon: string;
}

export interface UnitMixItem {
  type: string;
  count: number;
  sqft: string;
  rent: string;
}

export interface LocationHighlight {
  title: string;
  description: string;
  icon: string;
  colors?: {
    bg: string;
    text: string;
  };
}

export interface PropertyOverview {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: PropertyOverviewSection[];
}

export interface MarketMetric {
  label: string;
  value: string;
  description: string;
}

export interface MajorEmployer {
  name: string;
  employees: string;
  industry: string;
  distance: string;
}

export interface Demographic {
  category: string;
  value: string;
  description: string;
}

export interface MarketDriver {
  title: string;
  description: string;
  icon: string;
}

export interface MarketAnalysis {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: MarketAnalysisSection[];
}

export interface TeamMember {
  name: string;
  title: string;
  experience: string;
  background: string;
}

export interface TrackRecordItem {
  metric: string;
  value: string;
  description: string;
}

export interface PreviousProject {
  name: string;
  location: string;
  units: string;
  year: string;
  status: 'Completed' | 'In Progress' | 'Planning' | 'Operating';
  returns: string;
}

export interface DevelopmentPartner {
    name: string;
    role: string;
    description: string;
}

// =================================================================================================
// SECTION TYPES FOR BLOCK-BASED RENDERING
// =================================================================================================

export interface HeroSectionData {
  listingName: string;
  location: string;
  minInvestment: number;
  fundName: string;
}

export interface TickerMetricsSectionData {
  metrics: TickerMetric[];
}

export interface CompellingReasonsSectionData {
  reasons: CompellingReason[];
}

export interface ExecutiveSummarySectionData {
  summary: {
    quote: string;
    paragraphs: string[];
    conclusion: string;
  };
}

export interface InvestmentCardsSectionData {
  cards: InvestmentCard[];
}

export type ListingOverviewSection = 
  | { type: 'hero'; data: HeroSectionData }
  | { type: 'tickerMetrics'; data: TickerMetricsSectionData }
  | { type: 'compellingReasons'; data: CompellingReasonsSectionData }
  | { type: 'executiveSummary'; data: ExecutiveSummarySectionData }
  | { type: 'investmentCards'; data: InvestmentCardsSectionData };

// --- Sponsor Profile Detail Page Sections ---

export interface SponsorIntroSectionData {
  sponsorName: string;
  content: {
    paragraphs: string[];
    // Can be a bulleted list or a list of items with icons
    highlights: {
      type: 'list' | 'icons';
      items: Array<{
        icon?: string; // Lucide icon name, e.g., "Award"
        text: string;
      }>;
    };
  };
}

export interface PartnershipOverviewSectionData {
  partners: Array<{
    name: string;
    description: string[];
  }>;
}

export interface TrackRecordSectionData {
  // The grid of key stats
  metrics: Array<{
    label?: string; // Optional label/metric title
    value: string;
    description: string;
  }>;
}

export interface LeadershipTeamSectionData {
  teamMembers: TeamMember[]; // Re-using the existing TeamMember interface
}

export interface DevelopmentPortfolioSectionData {
  projects: Array<{
    name:string;
    location: string;
    units: string;
    year: string;
    status: 'Completed' | 'In Progress' | 'Planning' | 'Operating';
    returnsOrFocus: string; // The last column can be "Returns" or "Focus"
  }>;
  // An optional summary box that appears below the table
  investmentPhilosophy?: {
    title: string;
    description: string;
  };
}

export interface KeyDevelopmentPartnersSectionData {
  partners: Array<{
    name: string;
    role: string;
    description: string;
  }>;
}

export interface CompetitiveAdvantagesSectionData {
  advantages: Array<{
    icon: string; // Lucide icon name
    title: string;
    description: string;
  }>;
}


export type SponsorProfileSection =
  | { type: 'sponsorIntro'; data: SponsorIntroSectionData }
  | { type: 'partnershipOverview'; data: PartnershipOverviewSectionData }
  | { type: 'trackRecord'; data: TrackRecordSectionData }
  | { type: 'leadershipTeam'; data: LeadershipTeamSectionData }
  | { type: 'developmentPortfolio'; data: DevelopmentPortfolioSectionData }
  | { type: 'keyDevelopmentPartners'; data: KeyDevelopmentPartnersSectionData }
  | { type: 'competitiveAdvantages'; data: CompetitiveAdvantagesSectionData };


// --- Financial Returns Detail Page Sections ---

export interface ProjectionsSectionData {
  projections: FinancialProjection[];
}

export interface DistributionTimelineSectionData {
  timeline: DistributionPhase[];
}

export interface TaxBenefitsSectionData {
  benefits: TaxBenefit[];
}

export interface InvestmentStructureSectionData {
  structure: InvestmentStructureItem[];
}

export type FinancialReturnsSection =
  | { type: 'projections'; data: ProjectionsSectionData }
  | { type: 'distributionTimeline'; data: DistributionTimelineSectionData }
  | { type: 'taxBenefits'; data: TaxBenefitsSectionData }
  | { type: 'investmentStructure'; data: InvestmentStructureSectionData };


// --- Property Overview Detail Page Sections ---

export interface KeyFactsSectionData {
  facts: KeyPropertyFact[]; // Re-uses existing KeyPropertyFact
}

export interface AmenitiesSectionData {
  amenities: Amenity[]; // Re-uses existing Amenity
}

export interface UnitMixSectionData {
  unitMix: UnitMixItem[]; // Re-uses existing UnitMixItem
  specialFeatures?: {
    title: string;
    description: string;
  };
}

export interface LocationHighlightsSectionData {
  highlights: LocationHighlight[]; // Re-uses existing LocationHighlight
}

// This is for the more complex, multi-column layout seen in SoGood Dallas
export interface LocationFeaturesSectionData {
  featureSections: Array<{
    category: string;
    icon: string;
    features: string[];
  }>;
}

export interface DevelopmentTimelineSectionData {
  timeline: Array<{
    status: 'completed' | 'in_progress';
    title: string;
    description: string;
  }>;
}

export interface DevelopmentPhasesSectionData {
  phases: Array<{
    phase: string;
    units: number;
    sqft: string;
    features: string;
    timeline: string;
  }>;
}


export type PropertyOverviewSection =
  | { type: 'keyFacts'; data: KeyFactsSectionData }
  | { type: 'amenities'; data: AmenitiesSectionData }
  | { type: 'unitMix'; data: UnitMixSectionData }
  | { type: 'locationHighlights'; data: LocationHighlightsSectionData }
  | { type: 'locationFeatures'; data: LocationFeaturesSectionData }
  | { type: 'developmentTimeline'; data: DevelopmentTimelineSectionData }
  | { type: 'developmentPhases'; data: DevelopmentPhasesSectionData };


// --- Market Analysis Detail Page Sections ---

export interface MarketMetricsSectionData {
  metrics: MarketMetric[]; // Re-uses existing MarketMetric
}

export interface MajorEmployersSectionData {
  employers: MajorEmployer[]; // Re-uses existing MajorEmployer
}

export interface DemographicsSectionData {
  demographics: Demographic[]; // Re-uses existing Demographic
}

export interface KeyMarketDriversSectionData {
  drivers: MarketDriver[]; // Re-uses existing MarketDriver
}

export interface SupplyDemandSectionData {
  analysis: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface CompetitiveAnalysisSectionData {
  competitors: Array<{
    name: string;
    built: string;
    beds: string;
    rent: string;
    occupancy: string;
    rentGrowth: string;
  }>;
  summary?: string;
}

export interface EconomicDiversificationSectionData {
  sectors: Array<{
    title: string;
    description: string;
  }>;
}

export type MarketAnalysisSection =
  | { type: 'marketMetrics'; data: MarketMetricsSectionData }
  | { type: 'majorEmployers'; data: MajorEmployersSectionData }
  | { type: 'demographics'; data: DemographicsSectionData }
  | { type: 'keyMarketDrivers'; data: KeyMarketDriversSectionData }
  | { type: 'supplyDemand'; data: SupplyDemandSectionData }
  | { type: 'competitiveAnalysis'; data: CompetitiveAnalysisSectionData }
  | { type: 'economicDiversification'; data: EconomicDiversificationSectionData };


export interface FinancialReturns {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: FinancialReturnsSection[];
}

export interface PropertyOverview {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: PropertyOverviewSection[];
}

export interface MarketAnalysis {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sections: MarketAnalysisSection[];
}

export interface SponsorProfile {
  sponsorName: string;
  sections: SponsorProfileSection[];
}

export interface Listing {
  listingName: string;
  listingSlug: string;
  projectId: string; 
  sections: ListingOverviewSection[];
  details: {
    financialReturns: FinancialReturns;
    propertyOverview: PropertyOverview;
    marketAnalysis: MarketAnalysis;
    sponsorProfile: SponsorProfile;
  };
} 