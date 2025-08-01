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
  projections: FinancialProjection[];
  distributionTimeline: DistributionPhase[];
  taxBenefits: TaxBenefit[];
  investmentStructure: InvestmentStructureItem[];
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
}

export interface PropertyOverview {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  keyPropertyFacts: KeyPropertyFact[];
  amenities: Amenity[];
  unitMix: UnitMixItem[];
  locationHighlights: LocationHighlight[];
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
  marketMetrics: MarketMetric[];
  majorEmployers: MajorEmployer[];
  demographics: Demographic[];
  supplyDemandAnalysis: { title: string; description: string; icon: string; }[];
  keyMarketDrivers: MarketDriver[];
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


export interface SponsorProfile {
  pageTitle: string;
  pageSubtitle: string;
  backgroundImages: string[];
  sponsorOverview: {
      title: string;
      description: string;
      points: string[];
  };
  trackRecord: TrackRecordItem[];
  teamMembers: TeamMember[];
  previousProjects: PreviousProject[];
  developmentPartners?: DevelopmentPartner[];
  investmentPhilosophy?: string;
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