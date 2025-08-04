# Dynamic Listing Content API

This document outlines the JSON structure required to dynamically render content on the listing pages. The frontend consumes a `Listing` object, which contains an array of `sections`. The order of sections in the array dictates the order they are rendered on the page.

## Core Concept: Content Blocks

The frontend is built with a "Content Blocks" or "Component-Based" architecture. The backend's responsibility is to provide a `sections` array, where each object in the array is a "block" that specifies its `type` and the `data` required to render it.

The frontend maintains a library of pre-built React components corresponding to each `type`. When the page loads, it iterates through the `sections` array and renders the appropriate component for each block, passing the `data` object as props.

**Example Structure:**

```json
{
  "listingName": "The Edge on Main",
  "listingSlug": "the-edge-on-main",
  "projectId": "edge-on-main-mesa-001",
  "sections": [
    {
      "type": "hero",
      "data": { ... }
    },
    {
      "type": "tickerMetrics",
      "data": { ... }
    },
    // ... other sections
  ],
  "details": { ... }
}
```

---

## Listing Overview Page Sections

These are the mandatory, fixed-order sections for the main listing overview page.

### 1. Hero Section

-   **`type`**: `"hero"`
-   **Description**: Renders the main header, key details, and the primary image carousel for the listing.
-   **Data Schema**:
    ```typescript
    interface HeroSectionData {
      listingName: string;   // The main title of the listing.
      location: string;      // e.g., "Mesa, AZ"
      minInvestment: number; // The minimum investment amount as a number, e.g., 250000.
      fundName: string;      // The name of the associated fund, e.g., "ACARA OZ Fund I LLC".
    }
    ```

### 2. Ticker Metrics Section

-   **`type`**: `"tickerMetrics"`
-   **Description**: A scrolling marquee of key financial and property metrics. This section must contain a fixed set of 6 metrics. The `label` for each metric should be one of the following: '10-Yr Equity Multiple', 'Preferred Return', 'Min Investment', 'Location', 'Hold Period', 'Tax Benefit'. Only the `value` and `change` fields should be customized per listing.
-   **Data Schema**:
    ```typescript
    interface TickerMetricsSectionData {
      // This array must always contain exactly 8 items with fixed labels.
      metrics: Array<{
        label: "10-Yr Equity Multiple" | "Preferred Return" | "Min Investment" | "Location" | "Hold Period" | "Tax Benefit";
        value: string;  // e.g., "2.8–3.2x"
        change: string; // A short descriptive string, e.g., "+12%" or "Guaranteed"
      }>;
    }
    ```

### 3. Compelling Reasons Section

-   **`type`**: `"compellingReasons"`
-   **Description**: Three highlighted cards explaining the top reasons to invest. This section must always contain exactly 3 reasons.
-   **Data Schema**:
    ```typescript
    interface CompellingReasonsSectionData {
      // This array must always contain exactly 3 items.
      reasons: Array<{
        title: string;       // The title of the reason, e.g., "100% Tax-Free Growth".
        description: string; // A short paragraph explaining the reason.
        icon: string;        // The name of a Lucide icon, e.g., "Rocket", "BarChart3", "Train".
      }>;
    }
    ```

### 4. Executive Summary Section

-   **`type`**: `"executiveSummary"`
-   **Description**: A detailed summary of the investment opportunity, including a standout quote.
-   **Data Schema**:
    ```typescript
    interface ExecutiveSummarySectionData {
      summary: {
        quote: string;      // An impactful quote to lead the section.
        paragraphs: [string, string]; // An array of exactly two paragraphs for the main body.
        conclusion: string; // A concluding sentence or two.
      };
    }
    ```

### 5. Investment Cards Section

-   **`type`**: `"investmentCards"`
-   **Description**: A grid of cards that link to the detailed sub-pages (Due Diligence Vault). Each card has specific content requirements:
    -   **Financial Returns Card**: The `keyMetrics` array must contain exactly 3 metrics with the labels: `"10-Yr Equity Multiple"`, `"IRR"`, and `"Preferred Return"`.
    -   **Property Overview & Market Analysis Cards**: The `keyMetrics` array must contain the 3 highest-impact metrics for the property/market. The `summary` should pinpoint why these metrics are significant.
    -   **Sponsor Profile Card**: The `keyMetrics` array must contain 3 pieces of information. The last metric should be a credibility stamp (e.g., track record, AUM, land ownership).
-   **Data Schema**:
    ```typescript
    interface InvestmentCardsSectionData {
      cards: Array<{
        id: "financial-returns" | "property-overview" | "market-analysis" | "sponsor-profile"; // The slug for the details page link.
        title: string; // The title of the card, e.g., "Financial Returns".
        keyMetrics: Array<{
          label: string; // e.g., "10-Yr Equity Multiple"
          value: string; // e.g., "2.8–3.2x"
        }>;
        summary: string; // A short summary sentence for the card.
      }>;
    }
    ```

---
## Detail Page Sections: Sponsor Profile

The Sponsor Profile page is composed of a flexible array of sections. The AI Agent must adhere to the composition rules outlined at the end of this section.

### Sponsor Introduction
- **`type`**: `"sponsorIntro"`
- **Description**: A full-page component providing a detailed introduction to the sponsor. Includes paragraphs of text and a list of highlights. At least one of `sponsorIntro` or `partnershipOverview` must be present.
- **Data Schema**:
  ```typescript
  interface SponsorIntroSectionData {
    sponsorName: string; // e.g., "About Juniper Mountain Capital"
    content: {
      paragraphs: string[];
      highlights: {
        type: 'list' | 'icons';
        items: Array<{
          icon?: string; // Lucide icon name, required if type is 'icons'
          text: string;
        }>;
      };
    };
  }
  ```

### Partnership Overview
- **`type`**: `"partnershipOverview"`
- **Description**: A full-page component used when there are multiple entities involved. Renders a two-column layout detailing each partner. At least one of `sponsorIntro` or `partnershipOverview` must be present.
- **Data Schema**:
  ```typescript
  interface PartnershipOverviewSectionData {
    partners: Array<{
      name: string; // e.g., "Hoque Global (Developer)"
      description: string[]; // Array of paragraphs describing the partner.
    }>;
  }
  ```

### Track Record
- **`type`**: `"trackRecord"`
- **Description**: A full-page component displaying a grid of key statistics and metrics that showcase the sponsor's track record.
- **Data Schema**:
  ```typescript
  interface TrackRecordSectionData {
    // This array must contain either 4 or 8 metrics.
    metrics: Array<{
      label?: string; // Optional title for the metric, e.g., "Total Units Developed".
      value: string; // The main statistic, e.g., "1,158+".
      description: string; // A short description for context.
    }>;
  }
  ```

### Leadership Team
- **`type`**: `"leadershipTeam"`
- **Description**: A full-page component displaying profiles for the key members of the leadership team in a grid.
- **Data Schema**:
  ```typescript
  interface LeadershipTeamSectionData {
    // This array must contain either 3 or 6 team members.
    teamMembers: Array<{
      name: string;
      title: string;
      experience: string; // e.g., "25+ years"
      background: string; // A detailed paragraph about their background.
    }>;
  }
  ```

### Development Portfolio
- **`type`**: `"developmentPortfolio"`
- **Description**: A full-page component with a table showcasing the sponsor's recent or relevant projects. Can optionally include an "Investment Philosophy" summary box.
- **Data Schema**:
  ```typescript
  interface DevelopmentPortfolioSectionData {
    projects: Array<{
      name: string;
      location: string;
      units: string;
      year: string;
      status: 'Completed' | 'In Progress' | 'Planning' | 'Operating';
      returnsOrFocus: string; // The content for the final column, can be financial returns or a description of the project's focus.
    }>;
    investmentPhilosophy?: {
      title: string;
      description: string;
    };
  }
  ```

### Key Development Partners
- **`type`**: `"keyDevelopmentPartners"`
- **Description**: An optional, full-page component highlighting other key partners involved in the project.
- **Data Schema**:
  ```typescript
  interface KeyDevelopmentPartnersSectionData {
    // This array must contain exactly 2 partners if this section is used.
    partners: Array<{
      name: string;
      role: string;
      description: string;
    }>;
  }
  ```

### Competitive Advantages
- **`type`**: `"competitiveAdvantages"`
- **Description**: An optional, full-page component that lists key competitive advantages in a two-column layout.
- **Data Schema**:
  ```typescript
  interface CompetitiveAdvantagesSectionData {
    // This array must contain 2, 4, or 6 advantages if this section is used.
    advantages: Array<{
      icon: string; // Lucide icon name.
      title: string;
      description: string;
    }>;
  }
  ```
---

## Detail Page Sections: Financial Returns

The Financial Returns page is composed of the following sections. The recommended order is as follows, with `taxBenefits` and `investmentStructure` grouped together in a two-column layout.

### Financial Projections
- **`type`**: `"projections"`
- **Description**: A grid of key financial projections for the project.
- **Data Schema**:
  ```typescript
  interface ProjectionsSectionData {
    // This array must always contain exactly 6 items.
    projections: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  }
  ```

### Distribution Timeline
- **`type`**: `"distributionTimeline"`
- **Description**: A timeline outlining the expected distribution phases over the life of the investment.
- **Data Schema**:
  ```typescript
  interface DistributionTimelineSectionData {
    timeline: Array<{
      year: string;
      phase: string;
      distribution: string;
      description: string;
    }>;
  }
  ```

### Tax Benefits
- **`type`**: `"taxBenefits"`
- **Description**: Details the tax advantages of investing in the project, specifically related to Opportunity Zones.
- **Data Schema**:
  ```typescript
  interface TaxBenefitsSectionData {
    benefits: Array<{
      title: string;
      description: string;
      icon?: string; // Optional icon for the tax benefit
    }>;
  }
  ```

*   **Example:**
    ```json
    {
      "type": "taxBenefits",
      "data": {
        "benefits": [
          {
            "icon": "Calendar",
            "title": "Capital Gains Deferral",
            "description": "Investors can defer capital gains taxes on the sale of any asset by reinvesting the gain into a Qualified Opportunity Fund within 180 days."
          },
          {
            "icon": "Target",
            "title": "Basis Step-Up",
            "description": "The original deferred capital gains tax liability is reduced by 10% after a 5-year hold."
          },
          {
            "icon": "DollarSign",
            "title": "Tax-Free Growth",
            "description": "After a 10-year hold, the appreciation on the Opportunity Zone investment is 100% free from capital gains tax."
          }
        ]
      }
    }
    ```

### Investment Structure
- **`type`**: `"investmentStructure"`
- **Description**: A list of the key terms and structure of the investment.
- **Data Schema**:
  ```typescript
  interface InvestmentStructureSectionData {
    structure: Array<{
      label: string;
      value: string;
    }>;
  }
  ```
---

## Detail Page Sections: Property Overview

The Property Overview page is composed of a flexible array of sections. The AI Agent must adhere to the composition rules outlined at the end of this section.

### Key Facts
- **`type`**: `"keyFacts"`
- **Description**: A full-page component showing a grid of top-level facts about the property.
- **Data Schema**:
  ```typescript
  interface KeyFactsSectionData {
    // This array must always contain exactly 4 items.
    facts: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  }
  ```

### Community Amenities
- **`type`**: `"amenities"`
- **Description**: A full-page component showcasing the community amenities available at the property in a grid.
- **Data Schema**:
  ```typescript
  interface AmenitiesSectionData {
    // This array must contain either 4 or 8 items.
    amenities: Array<{
      name: string;
      icon: string; // Lucide icon name
    }>;
  }
  ```

### Unit Mix
- **`type`**: `"unitMix"`
- **Description**: An optional, full-page component with a table detailing the different unit types, sizes, and rents. Can optionally include a "Special Features" summary box.
- **Data Schema**:
  ```typescript
  interface UnitMixSectionData {
    unitMix: Array<{
      type: string;
      count: number;
      sqft: string;
      rent: string;
    }>;
    specialFeatures?: {
      title: string;
      description: string;
    };
  }
  ```

### Location Highlights
- **`type`**: `"locationHighlights"`
- **Description**: An optional, full-page component for highlighting key location features.
- **Data Schema**:
  ```typescript
  interface LocationHighlightsSectionData {
    // This array must always contain exactly 3 items if this section is used.
    highlights: Array<{
      title: string;
      description: string;
      icon: string; // Lucide icon name
      colors?: {
        bg: string;   // TailwindCSS background color class, e.g., "bg-blue-50 dark:bg-blue-900/10"
        text: string; // TailwindCSS text color class, e.g., "text-blue-600 dark:text-blue-400"
      };
    }>;
  }
  ```

### Location Features (Advanced)
- **`type`**: `"locationFeatures"`
- **Description**: An optional, full-page component for a detailed, multi-column layout of location features.
- **Data Schema**:
  ```typescript
  interface LocationFeaturesSectionData {
    // This array must always contain exactly 3 items if this section is used.
    featureSections: Array<{
      category: string;
      icon: string; // Lucide icon name
      features: string[];
    }>;
  }
  ```

### Development Timeline
- **`type`**: `"developmentTimeline"`
- **Description**: An optional, full-page component with a simple vertical timeline showing the progress of the development.
- **Data Schema**:
  ```typescript
  interface DevelopmentTimelineSectionData {
    timeline: Array<{
      status: 'completed' | 'in_progress';
      title: string;
      description: string;
    }>;
  }
  ```

### Development Phases
- **`type`**: `"developmentPhases"`
- **Description**: An optional, full-page component with a detailed breakdown of the different phases of a large-scale development.
- **Data Schema**:
  ```typescript
  interface DevelopmentPhasesSectionData {
    phases: Array<{
      phase: string;
      units: number;
      sqft: string;
      features: string;
      timeline: string;
    }>;
  }
  ```

### Property Overview Page Composition Rules

-   **Compulsory Sections**: The page must always include the following two full-page sections:
    1.  `keyFacts` (must contain exactly 4 facts)
    2.  `amenities` (must contain 4 or 8 amenities)

-   **Optional Sections**: The following full-page sections are optional and can be included if relevant data is available:
    -   `locationHighlights` (must contain exactly 3 highlights if included)
    -   `locationFeatures` (must contain exactly 3 feature sections if included)
    -   `unitMix`
    -   `developmentTimeline`
    -   `developmentPhases`
---

## Detail Page Sections: Market Analysis

The Market Analysis page is composed of a flexible array of sections. To ensure a consistent and visually appealing layout, the AI Agent must adhere to the composition rules outlined at the end of this section.

### Market Metrics
- **`type`**: `"marketMetrics"`
- **Description**: A grid of top-level statistics about the target market. The agent must select exactly 6 of the most high-impact metrics.
- **Data Schema**:
  ```typescript
  interface MarketMetricsSectionData {
    // This array must always contain exactly 6 items.
    metrics: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  }
  ```

### Major Employers
- **`type`**: `"majorEmployers"`
- **Description**: A table listing the major employers in the area. This should include between 4 and 8 of the closest and largest employers.
- **Data Schema**:
  ```typescript
  interface MajorEmployersSectionData {
    // This array should contain between 4 and 8 items.
    employers: Array<{
      name: string;
      employees: string;
      industry: string;
      distance: string;
    }>;
  }
  ```

### Demographics
- **`type`**: `"demographics"`
- **Description**: A half-width component displaying key demographic data points for the target market.
- **Data Schema**:
  ```typescript
  interface DemographicsSectionData {
    demographics: Array<{
      category: string;
      value: string;
      description: string;
    }>;
  }
  ```

### Key Market Drivers
- **`type`**: `"keyMarketDrivers"`
- **Description**: A grid of icons and descriptions that highlight the primary factors driving the market's growth. This section must contain exactly 4 high-impact drivers.
- **Data Schema**:
  ```typescript
  interface KeyMarketDriversSectionData {
    // This array must always contain exactly 4 items.
    drivers: Array<{
      title: string;
      description: string;
      icon: string; // Lucide icon name
    }>;
  }
  ```

### Supply & Demand Analysis
- **`type`**: `"supplyDemand"`
- **Description**: A half-width component with a list of points analyzing the supply and demand dynamics of the market.
- **Data Schema**:
  ```typescript
  interface SupplyDemandSectionData {
    analysis: Array<{
      icon: string; // Lucide icon name
      title: string;
      description: string;
    }>;
  }
  ```

### Competitive Analysis
- **`type`**: `"competitiveAnalysis"`
- **Description**: A full-width table comparing competitor properties. Can optionally include a summary paragraph.
- **Data Schema**:
  ```typescript
  interface CompetitiveAnalysisSectionData {
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
  ```

### Economic Diversification
- **`type`**: `"economicDiversification"`
- **Description**: A half-width component highlighting the different economic sectors contributing to the market's strength.
- **Data Schema**:
  ```typescript
  interface EconomicDiversificationSectionData {
    sectors: Array<{
      title: string;
      description: string;
    }>;
  }
  ``` 

### Market Analysis Page Composition Rules

To ensure a consistent and visually appealing layout, the AI Agent must adhere to the following composition rules when constructing the Market Analysis page.

-   **Compulsory Sections**: The page must always include the following three sections:
    1.  `marketMetrics`
    2.  `majorEmployers`
    3.  `keyMarketDrivers`

-   **Optional Sections & Layout Logic**:
    -   **Full-Width Section**:
        -   The `competitiveAnalysis` section is a full-width component. It is optional and should be included if relevant competitive data is available.
    -   **Half-Width Sections**:
        -   The `demographics`, `supplyDemand`, and `economicDiversification` sections are half-width components designed to appear in a two-column layout.
        -   **Rule**: To maintain the layout, these sections should **only** be included if data is available for **exactly two** of the three types. If data exists for only one, or for all three, they should be omitted entirely. 

### Sponsor Profile Page Composition Rules

-   **Compulsory Sections**: The page must always include the following sections, adhering to their specific constraints:
    1.  **`sponsorIntro` and/or `partnershipOverview`**: At least one of these sections must be present. Both can be included if relevant data is available for both.
    2.  `trackRecord` (must contain 4 or 8 metrics)
    3.  `developmentPortfolio`
    4.  `leadershipTeam` (must contain 3 or 6 members)

-   **Optional Sections**: The following full-page sections are optional. They should only be included if their data is available and their content constraints are satisfied:
    -   `competitiveAdvantages` (must contain 2, 4, or 6 advantages)
    -   `keyDevelopmentPartners` (must contain exactly 2 partners) 