# Dynamic Listing Content API

**Primary Task & Data Sourcing Guidelines**

Your task is to act as a real estate investment analyst. You will be provided with a deal document (PDF) for a real estate investment opportunity. Your goal is to extract the relevant information from this document and supplement it with web research to generate a structured JSON object that describes the investment, following the schema defined below. This JSON will be used to dynamically render a webpage for the listing.

**General Principles:**
-   **Prioritize the Deal Document**: The provided PDF is the primary source of truth. Information from the document should always be used in favor of web data if there is a conflict.
-   **Enhance with Web Research**: For certain sections specified below, you are required to use web research to supplement, verify, and enrich the data from the deal document. Use reputable sources (e.g., official government statistics, major real estate analytics firms, reputable news outlets).
-   **Maintain a Positive Frame**: The goal is to present the investment opportunity in the best possible light, while remaining truthful. For optional sections, if your web research uncovers information that significantly weakens the investment's appeal and is not addressed in the deal document, it is better to omit that section entirely. Your generated output should be optimistic yet realistic, based on the provided data.
-   **Follow the Schema**: Adhere strictly to the JSON schema, including constraints on the number of items in arrays.

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

**Example:**

```json
{
  "type": "hero",
  "data": {
    "listingName": "The Edge on Main",
    "location": "Mesa, AZ",
    "minInvestment": 250000,
    "fundName": "ACARA OZ Fund I LLC"
  }
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

**Example:**

```json
{
  "type": "tickerMetrics",
  "data": {
    "metrics": [
      { "label": "10-Yr Equity Multiple", "value": "4.29x", "change": "+329%" },
      { "label": "Preferred Return", "value": "8%", "change": "Guaranteed" },
      { "label": "Min Investment", "value": "$250K", "change": "Minimum" },
      { "label": "Location", "value": "St. Louis, MO", "change": "Prime Location" },
      { "label": "Hold Period", "value": "10 Years", "change": "OZ Qualified" },
      { "label": "Tax Benefit", "value": "100%", "change": "Tax-Free Exit" }
    ]
  }
}
```

### 3. Compelling Reasons Section

-   **`type`**: `"compellingReasons"`
-   **Description**: Three highlighted cards explaining the top reasons to invest. This section must always contain exactly 3 reasons.
-   **Data Sourcing**: The content for this section should be derived from the provided deal document. You may supplement this with information from web searches, but the deal document is the primary source of truth. Focus on the most positive aspects of the investment.
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

**Example:**

```json
{
  "type": "compellingReasons",
  "data": {
    "reasons": [
      {
        "title": "100% Tax-Free Growth",
        "description": "Opportunity Zone benefits provide complete federal tax exemption on investment appreciation after 10-year hold period, plus property tax abatement through PFC.",
        "icon": "Rocket"
      },
      {
        "title": "Innovation District Creation",
        "description": "SoGood represents a major innovation district featuring a pre-leased innovation center to GSV Ventures, transforming Dallas' southern sector into a tech hub.",
        "icon": "BarChart3"
      },
      {
        "title": "Strategic Dallas Location",
        "description": "Located near iconic neighborhoods including the Farmers Market, Deep Ellum, and Fair Park, with proximity to the $3.7B Convention Center expansion.",
        "icon": "Train"
      }
    ]
  }
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

**Example:**

```json
{
  "type": "executiveSummary",
  "data": {
    "summary": {
      "quote": "A landmark development poised to redefine urban living in downtown Mesa, The Edge on Main capitalizes on a critical housing shortage and a prime transit-oriented location.",
      "paragraphs": [
        "This two-phase, 439-unit multifamily project is situated in a qualified Opportunity Zone, offering investors significant tax advantages, including the potential for a 100% tax-free exit on appreciation.",
        "With Arizona's population booming and a housing deficit exceeding 56,000 units, The Edge on Main is perfectly positioned to meet the overwhelming demand for modern, accessible rental housing in one of the nation's fastest-growing cities."
      ],
      "conclusion": "This development represents a rare opportunity to invest in a high-growth market with strong fundamentals and powerful tax incentives, promising substantial returns and lasting community value."
    }
  }
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

### 6. News Links (Optional)

-   **Field**: `newsLinks` (Top-level array)
-   **Description**: A list of external news articles or press releases validating the project or location.
-   **Data Schema**:
    ```typescript
    interface NewsCardMetadata {
      url: string;
      title: string;
      description: string;
      image: string;
      source: string;
    }
    ```

**Example:**

```json
{
  "type": "investmentCards",
  "data": {
    "cards": [
      {
        "id": "financial-returns",
        "title": "Financial Returns",
        "keyMetrics": [
          { "label": "10-Yr Equity Multiple", "value": "4.29x" },
          { "label": "IRR Target", "value": "17.7%" },
          { "label": "Preferred Return", "value": "8%" }
        ],
        "summary": "Projected pre-tax returns for OZ investors over 10-year hold"
      },
      {
        "id": "property-overview",
        "title": "Property Overview",
        "keyMetrics": [
          { "label": "Total Units", "value": "177" },
          { "label": "Bedrooms", "value": "508" },
          { "label": "Occupancy", "value": "May 2025" }
        ],
        "summary": "The Marshall St. Louis – Student housing adjacent to SLU campus"
      },
      {
        "id": "market-analysis",
        "title": "Market Analysis",
        "keyMetrics": [
          { "label": "SLU Enrollment", "value": "15,200+" },
          { "label": "Growth Rate", "value": "25%" },
          { "label": "Pre-Lease Rate", "value": ">60%" }
        ],
        "summary": "Strong market fundamentals driven by university growth"
      },
      {
        "id": "sponsor-profile",
        "title": "Sponsor Profile",
        "keyMetrics": [
          { "label": "Fund Name", "value": "Aptitude St. Louis LLC" },
          { "label": "Developer", "value": "Aptitude Development" },
          { "label": "Track Record", "value": "20+ Years Experience" }
        ],
        "summary": "Experienced team with proven student housing development expertise"
      }
    ]
  }
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

**Example:**

```json
{
  "type": "sponsorIntro",
  "data": {
    "sponsorName": "About Juniper Mountain Capital",
    "content": {
      "paragraphs": [
        "Juniper Mountain Capital is a leading multifamily development firm specializing in Opportunity Zone investments across the Southwest United States. Founded in 2009, we have established ourselves as a trusted partner for institutional and individual investors seeking strong risk-adjusted returns in the multifamily sector.",
        "Our focus on transit-oriented developments in high-growth markets has consistently delivered superior returns while creating lasting value for the communities we serve. We leverage our deep local market knowledge and proven execution capabilities to identify and capitalize on emerging opportunities."
      ],
      "highlights": {
        "type": "icons",
        "items": [
          { "text": "NMHC Top 50 Developer (2021-2023)", "icon": "Award" },
          { "text": "Specialized in OZ Development", "icon": "Building" },
          { "text": "ESG-Focused Development", "icon": "Target" },
          { "text": "Phoenix Market Leader", "icon": "MapPin" }
        ]
      }
    }
  }
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

**Example:**

```json
{
  "type": "partnershipOverview",
  "data": {
    "partners": [
      {
        "name": "Hoque Global (Developer)",
        "description": [
          "Diversified investment company with primary focus on catalytic enterprises in real estate. Parent company of HG Real Estate Solutions, DRG Concepts, iDesign Meetings and RideCentric.",
          "Recognized leader in revitalization, redevelopment, and re-energization of properties with a focus on community impact and sustainable urban development."
        ]
      },
      {
        "name": "ACARA Management (Fund Manager)",
        "description": [
          "Provides accredited investors with direct investment opportunities in the multifamily industry through partnerships with top-tier development sponsors.",
          "Vertically integrated platform capturing layers of profit from site selection to management, providing strong long-term cash flow for investors."
        ]
      }
    ]
  }
}
```

### Track Record
- **`type`**: `"trackRecord"`
- **Description**: A full-page component displaying a grid of key statistics and metrics that showcase the sponsor's track record.
- **Data Sourcing**: Extract the sponsor's track record from the deal document. You can use web searches to find additional positive metrics or to verify information, but the deal document is the primary source. If there are discrepancies, prioritize the deal document's data.
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

**Example:**

```json
{
  "type": "trackRecord",
  "data": {
    "metrics": [
      { "label": "Total Units Developed", "value": "1,158+", "description": "Across 8 successful projects" },
      { "label": "Total Project Value", "value": "$485M", "description": "Combined development cost" },
      { "label": "Average Project IRR", "value": "22.4%", "description": "Across completed projects" },
      { "label": "OZ Projects Completed", "value": "3", "description": "Specialized OZ experience" }
    ]
  }
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

**Example:**

```json
{
  "type": "leadershipTeam",
  "data": {
    "teamMembers": [
      {
        "name": "Todd Vitzthum",
        "title": "President, ACARA",
        "experience": "20+ years",
        "background": "Corporate commercial real estate expert with extensive experience in institutional investments and fund management."
      },
      {
        "name": "Jeff Richmond",
        "title": "Partner, ACARA",
        "experience": "15+ years",
        "background": "Business development specialist with deep expertise in opportunity zone investments and investor relations."
      },
      {
        "name": "Aptitude Development Team",
        "title": "Development Sponsor",
        "experience": "10+ years",
        "background": "Specialized student housing developers with proven track record in university-adjacent properties and complex urban developments."
      }
    ]
  }
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

**Example:**

```json
{
  "type": "developmentPortfolio",
  "data": {
    "projects": [
      { "name": "Phoenix Gateway Commons", "location": "Phoenix, AZ", "units": "324", "year": "2022", "status": "Completed", "returnsOrFocus": "24.1% IRR" },
      { "name": "Tempe Station Apartments", "location": "Tempe, AZ", "units": "287", "year": "2021", "status": "Completed", "returnsOrFocus": "19.8% IRR" },
      { "name": "Scottsdale Reserve", "location": "Scottsdale, AZ", "units": "196", "year": "2020", "status": "Completed", "returnsOrFocus": "21.3% IRR" },
      { "name": "Mesa Transit Village", "location": "Mesa, AZ", "units": "351", "year": "2023", "status": "In Progress", "returnsOrFocus": "Projected 23%" }
    ]
  }
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

**Example:**

```json
{
  "type": "keyDevelopmentPartners",
  "data": {
    "partners": [
      {
        "name": "Aptitude Development",
        "role": "Development Sponsor and Project Manager",
        "description": "Specialized student housing developer with extensive experience in university-adjacent properties. Leading The Marshall project from conception through completion with proven execution capabilities."
      },
      {
        "name": "Holland Construction",
        "role": "General Contractor",
        "description": "Experienced construction partner delivering The Marshall on schedule and on budget. Strong track record in complex urban student housing projects with quality finishes."
      }
    ]
  }
}
```

### Competitive Advantages
- **`type`**: `"competitiveAdvantages"`
- **Description**: An optional, full-page component that lists key competitive advantages in a two-column layout.
- **Data Sourcing**: Identify competitive advantages from the deal document. Supplement with web research to strengthen these points. This is an optional section. If web data reveals information that weakens the deal's competitive position, and this is not mentioned in the deal doc, consider omitting this section or framing the information positively if possible. Always prioritize data from the deal doc.
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

**Example:**

```json
{
  "type": "competitiveAdvantages",
  "data": {
    "advantages": [
      { "icon": "Building", "title": "Land Ownership", "description": "Hoque Global already owns all 14 acres, eliminating acquisition risk and streamlining development" },
      { "icon": "Award", "title": "Tax Abatements", "description": "Property tax abatement through Public Facility Corporation already established" }
    ]
  }
}
```

---

## Detail Page Sections: Financial Returns

The Financial Returns page is composed of a fixed set of sections that must all be present.

### Financial Projections
- **`type`**: `"projections"`
- **Description**: A grid of key financial projections. It must contain exactly 6 of the highest-impact metrics for the deal. The first three metrics are fixed: "10-Yr Equity Multiple", "Target IRR", and "Preferred Return". The remaining three should be selected to best represent the project's financial strengths.
- **Data Schema**:
  ```typescript
  interface ProjectionsSectionData {
    // This array must always contain exactly 6 items.
    // The first 3 labels must be "10-Yr Equity Multiple", "Target IRR", and "Preferred Return".
    projections: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  }
  ```

**Example:**

```json
{
  "type": "projections",
  "data": {
    "projections": [
      { "label": "10-Yr Equity Multiple", "value": "4.29x", "description": "Projected gross return on initial investment over the full 10-year hold period." },
      { "label": "Target IRR", "value": "17.7%", "description": "Projected Internal Rate of Return, net of fees." },
      { "label": "Preferred Return", "value": "8.0%", "description": "Compounded annually to investors before sponsor participation." },
      { "label": "Total Capital Requirement", "value": "$30.1M", "description": "New equity investment for recapitalization and stabilization." },
      { "label": "Year 1 Stabilized NOI", "value": "$2.5M", "description": "Projected Net Operating Income for the first full year of operations." },
      { "label": "10-Yr Avg. Cash-on-Cash", "value": "11.8%", "description": "Projected average annual pre-tax return on initial equity." }
    ]
  }
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

**Example:**

```json
{
  "type": "distributionTimeline",
  "data": {
    "timeline": [
      { "year": "Years 1-2", "phase": "Development & Pre-Leasing", "distribution": "0%", "description": "Construction of Phase I and pre-leasing of residential and retail spaces." },
      { "year": "Year 3", "phase": "Stabilization", "distribution": "7-9%", "description": "Property reaches stabilized occupancy and begins regular cash flow." },
      { "year": "Years 4-9", "phase": "Growth & Phased Expansion", "distribution": "8-10%+", "description": "Organic rent growth and development of subsequent phases." },
      { "year": "Year 10+", "phase": "Disposition", "distribution": "100% of net proceeds", "description": "At disposition, remaining capital and profits are distributed to investors." }
    ]
  }
}
```

### Tax Benefits
- **`type`**: `"taxBenefits"`
- **Description**: Details the tax advantages of investing in the project, specifically related to Opportunity Zones (OZ benefits).
- **Data Schema**:
  ```typescript
  interface TaxBenefitsSectionData {
    benefits: Array<{
      icon: string; // Lucide icon name
      title: string;
      description: string;
      icon?: string; // Lucide icon for the tax benefit
    }>;
  }
  ```

**Example:**

```json
{
  "type": "taxBenefits",
  "data": {
    "benefits": [
      { "icon": "Calendar", "title": "Capital Gains Deferral", "description": "Investors can defer capital gains taxes on the sale of any asset by reinvesting the gain into a Qualified Opportunity Fund within 180 days." },
      { "icon": "Target", "title": "Basis Step-Up", "description": "The original deferred capital gains tax liability is reduced by 10% after a 5-year hold." },
      { "icon": "DollarSign", "title": "Tax-Free Growth", "description": "After a 10-year hold, the appreciation on the Opportunity Zone investment is 100% free from capital gains tax." }
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

**Example:**

```json
{
  "type": "investmentStructure",
  "data": {
    "structure": [
      { "label": "Minimum Investment", "value": "$250,000" },
      { "label": "Asset Type", "value": "Student Housing" },
      { "label": "Target Hold Period", "value": "10 Years" },
      { "label": "Distribution Frequency", "value": "Annual" },
      { "label": "Sponsor Co-Invest", "value": "5%" }
    ]
  }
}
```

### Financial Returns Page Composition Rules
- **Compulsory Sections**: The page must always include all of the following sections:
    1. `projections`
    2. `distributionTimeline`
    3. `taxBenefits`
    4. `investmentStructure`
- **Optional Sections**:
    1. `capitalStack`
    2. `distributionWaterfall`
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

**Example:**

```json
{
  "type": "keyFacts",
  "data": {
    "facts": [
      { "label": "Total Units (Phase I & II)", "value": "388", "description": "Total residential units in the initial phases." },
      { "label": "Total Commercial SF", "value": "84,856 SF", "description": "Retail and innovation center space." },
      { "label": "Site Area", "value": "14 Acres", "description": "Total land area for the master-planned development." },
      { "label": "Phase I-VI Total", "value": "1,720 Units", "description": "Total residential units planned across all phases." }
    ]
  }
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

**Example:**

```json
{
  "type": "amenities",
  "data": {
    "amenities": [
      { "name": "Resort-Style Pool & Spa", "icon": "Sun" },
      { "name": "24/7 Fitness Center", "icon": "Dumbbell" },
      { "name": "Co-Working Lounge", "icon": "Laptop" },
      { "name": "Dog Park & Pet Spa", "icon": "Dog" },
      { "name": "Rooftop Terrace", "icon": "Building2" },
      { "name": "Resident Clubhouse", "icon": "Users" },
      { "name": "Secure Package Room", "icon": "Package" },
      { "name": "EV Charging Stations", "icon": "Zap" }
    ]
  }
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

**Example:**

```json
{
  "type": "unitMix",
  "data": {
    "unitMix": [
      { "type": "Studio", "count": 20, "sqft": "450", "rent": "$1,200" },
      { "type": "1-Bedroom", "count": 15, "sqft": "680", "rent": "$1,500" },
      { "type": "2-Bed / 2-Bath", "count": 40, "sqft": "950", "rent": "$2,200" },
      { "type": "3-Bed / 3-Bath", "count": 30, "sqft": "1,200", "rent": "$3,000" },
      { "type": "4-Bed / 4-Bath", "count": 80, "sqft": "1,400", "rent": "$3,800" }
    ],
    "specialFeatures": {
      "title": "Unit Features",
      "description": "All units are fully furnished and include granite countertops, stainless steel appliances, in-unit washer/dryer, and high-speed internet."
    }
  }
}
```

### Location Highlights
- **`type`**: `"locationHighlights"`
- **Description**: An optional, full-page component for highlighting key location features.
- **Data Sourcing**: Use the deal document to identify key location highlights. Use web searches (e.g., Google Maps, local news, city development sites) to find more details about transit, amenities, and local attractions. This is an optional section. If web data uncovers negative aspects about the location not present in the deal doc, it may be best to omit this section or focus only on the positive aspects mentioned in the deal doc.
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

**Example:**

```json
{
  "type": "locationHighlights",
  "data": {
    "highlights": [
      { "title": "Transit-Oriented", "description": "Adjacent to the Main Street Light Rail station, offering direct access across the valley.", "icon": "Train", "colors": { "bg": "bg-blue-50 dark:bg-blue-900/10", "text": "text-blue-600 dark:text-blue-400" } },
      { "title": "Downtown Mesa Hub", "description": "Walkable to dozens of restaurants, cafes, shops, and cultural venues.", "icon": "MapPin", "colors": { "bg": "bg-green-50 dark:bg-green-900/10", "text": "text-green-600 dark:text-green-400" } },
      { "title": "Innovation District", "description": "Located within Mesa's growing Innovation District, home to top educational and tech institutions.", "icon": "Cpu", "colors": { "bg": "bg-purple-50 dark:bg-purple-900/10", "text": "text-purple-600 dark:text-purple-400" } }
    ]
  }
}
```

### Location Features (Advanced)
- **`type`**: `"locationFeatures"`
- **Description**: An optional, full-page component for a detailed, multi-column layout of location features.
- **Data Sourcing**: Data for this section should be sourced from both the deal document and web research. The deal doc provides the core features, while web research can add specific names of places (e.g., parks, restaurants, employers). This is an optional section. Present the location in the best possible light. If web research reveals significant negative factors about the location that contradict the deal's narrative, consider omitting this section.
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

**Example:**

```json
{
  "type": "locationFeatures",
  "data": {
    "featureSections": [
      { "category": "Transit & Connectivity", "icon": "Bus", "features": ["Adjacent to future IH-30 deck park", "Near Dallas Farmers Market", "Close to Deep Ellum entertainment district", "Walking distance to Fair Park"] },
      { "category": "Urban Amenities", "icon": "MapPin", "features":["$3.7B Convention Center expansion nearby", "The Cedars historic district", "Farmers Market dining & shopping", "Multiple cultural venues"] },
      { "category": "Economic Drivers", "icon": "Building", "features": ["Innovation center pre-leased to GSV Ventures", "Property tax abatement through PFC", "Adaptive reuse of former industrial property", "Master-planned community catalyst"] }
    ]
  }
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

**Example:**

```json
{
  "type": "developmentTimeline",
  "data": {
    "timeline": [
      { "status": "completed", "title": "Groundbreaking", "description": "Q1 2023" },
      { "status": "in_progress", "title": "Construction", "description": "99% Complete" },
      { "status": "in_progress", "title": "Expected Delivery", "description": "April 2025" },
      { "status": "in_progress", "title": "Occupancy Start", "description": "May 2025 (>60% Pre-leased)" }
    ]
  }
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

**Example:**

```json
{
  "type": "developmentPhases",
  "data": {
    "phases": [
      { "phase": "Phase I - The Hub", "units": 116, "sqft": "123,777", "features": "Innovation Center (35,264 SF) + Retail", "timeline": "Est. 2027" },
      { "phase": "Phase II - MKT Residences", "units": 272, "sqft": "206,118", "features": "Retail Anchor + Farmers Commons", "timeline": "Est. 2027" }
    ]
  }
}
```

### 8. Development Timeline
-   **`type`**: `"developmentTimeline"`
-   **Description**: A vertical timeline showing project milestones.
-   **Data Schema**:
    ```typescript
    interface DevelopmentTimelineSectionData {
      timeline: Array<{
        status: 'completed' | 'in_progress';
        title: string;
        description: string;
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
- **Data Sourcing**: Source market metrics from the deal document first. Use reputable web sources (e.g., government statistics, real estate market reports like CBRE, JLL, Zillow Research) to verify and find additional metrics. Prioritize data from the deal document in case of conflicts. Select the 6 metrics that best highlight the market's strength and potential.
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

**Example:**

```json
{
  "type": "marketMetrics",
  "data": {
    "metrics": [
      { "label": "Population Growth (2020-2030)", "value": "+18.5%", "description": "Phoenix-Mesa MSA projected growth" },
      { "label": "Median Household Income", "value": "$68,400", "description": "Mesa city median (2023)" },
      { "label": "Job Growth Rate", "value": "+3.2%", "description": "Annual employment growth" },
      { "label": "Housing Shortage", "value": "56,000+", "description": "Units needed to meet demand" },
      { "label": "Rent Growth (5-year)", "value": "+42%", "description": "Class A multifamily rent appreciation" },
      { "label": "Occupancy Rate", "value": "96.2%", "description": "Current market occupancy" }
    ]
  }
}
```

### Major Employers
- **`type`**: `"majorEmployers"`
- **Description**: A table listing the major employers in the area. This should include between 4 and 8 of the closest and largest employers.
- **Data Sourcing**: Identify major employers from the deal document. Use web searches to verify these employers and find more details like the number of employees, industry, and exact distance from the property. You can also identify other major employers in the vicinity not listed in the document. Focus on reputable employers that add to the attractiveness of the location.
- **Data Schema**:
  ```typescript
  interface MajorEmployersSectionData {
    // This array should contain between 4 and 8 items.
    employers: Array<{
      name: string;
      emplo6. mayees: string;
      industry: string;
      distance: string;
    }>;
  }
  ```

**Example:**

```json
{
  "type": "majorEmployers",
  "data": {
    "employers": [
      { "name": "Saint Louis University", "employees": "7,000+", "industry": "Education", "distance": "0.1 miles" },
      { "name": "BJC HealthCare", "employees": "30,000+", "industry": "Healthcare", "distance": "0.5 miles" },
      { "name": "Cortex Innovation District", "employees": "6,000+", "industry": "Tech/Biotech", "distance": "0.5 miles" },
      { "name": "SSM Health", "employees": "40,000+", "industry": "Healthcare", "distance": "1 mile" }
    ]
  }
}
```

### Demographics
- **`type`**: `"demographics"`
- **Description**: A half-width component displaying key demographic data points for the target market.
- **Data Sourcing**: Extract demographic data from the deal document. Supplement and verify this with data from official sources like the US Census Bureau or city data portals. This is an optional, half-width section. If web research reveals demographic trends that are unfavorable for the investment (e.g., declining population, shrinking household income) and this section is not essential, it should be omitted to maintain a strong investment narrative, as per the layout rules.
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

**Example:**

```json
{
  "type": "demographics",
  "data": {
    "demographics": [
      { "category": "Median Age", "value": "32.1", "description": "Young and growing population." },
      { "category": "College Educated", "value": "41%", "description": "Highly educated workforce." },
      { "category": "Household Growth (5-Yr)", "value": "8.5%", "description": "Rapid formation of new households." },
      { "category": "Job Growth (1-Year)", "value": "3.9%", "description": "Significantly above national average." }
    ]
  }
}
```

### Key Market Drivers
- **`type`**: `"keyMarketDrivers"`
- **Description**: A grid of icons and descriptions that highlight the primary factors driving the market's growth. This section must contain exactly 4 high-impact drivers.
- **Data Sourcing**: Identify key market drivers from the deal document's narrative. Use web research on the local economy, development projects, and news to substantiate and elaborate on these drivers. Focus on the most compelling drivers that create a strong growth story for the investment.
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

**Example:**

```json
{
  "type": "keyMarketDrivers",
  "data": {
    "drivers": [
      { "title": "Migration", "description": "Net in-migration of 120,000+ annually to Arizona", "icon": "Users" },
      { "title": "Development", "description": "Transit-oriented development prioritized by Mesa", "icon": "Building" },
      { "title": "Industries", "description": "Healthcare, aerospace, and tech driving job growth", "icon": "Factory" },
      { "title": "Rent Growth", "description": "Strong rent appreciation across all asset classes", "icon": "TrendingUp" }
    ]
  }
}
```

### Supply & Demand Analysis
- **`type`**: `"supplyDemand"`
- **Description**: A half-width component with a list of points analyzing the supply and demand dynamics of the market.
- **Data Sourcing**: Analyze supply and demand based on information in the deal document. Use real estate market reports (e.g., from CoStar, CBRE, Yardi Matrix) and local planning department websites to get current data on housing supply, vacancy rates, and development pipelines. This is an optional, half-width section. If web data presents a negative supply/demand outlook (e.g., oversupply), and the deal doc doesn't offer a strong counter-narrative, it is better to omit this section.
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

**Example:**

```json
{
  "type": "supplyDemand",
  "data": {
    "analysis": [
      { "title": "Housing Deficit", "description": "Arizona needs 56,000+ additional housing units to meet current demand", "icon": "Home" },
      { "title": "Population Growth", "description": "Phoenix-Mesa MSA adding 80,000+ new residents annually", "icon": "TrendingUp" },
      { "title": "Limited New Supply", "description": "Construction constraints limit new multifamily development", "icon": "Building" },
      { "title": "Job Creation", "description": "Major employers continuing expansion in Phoenix metro", "icon": "Factory" }
    ]
  }
}
```

### Competitive Analysis
- **`type`**: `"competitiveAnalysis"`
- **Description**: A full-width table comparing competitor properties. Can optionally include a summary paragraph.
- **Data Sourcing**: The deal document may list competitor properties. Use web tools like apartment listing sites (e.g., Apartments.com, Zillow) and Google Maps to gather details on these competitors (year built, rents, occupancy, etc.) and to identify other relevant competitors. This is an optional section. Frame the analysis to highlight the subject property's strengths. If the competitive landscape appears overwhelmingly unfavorable based on web data, consider omitting this section or focusing only on competitors where the subject property has a clear advantage.
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

**Example:**

```json
{
  "type": "competitiveAnalysis",
  "data": {
    "competitors": [
      { "name": "Verve St. Louis", "built": "2021", "beds": "162", "rent": "$1,115", "occupancy": "100%", "rentGrowth": "18.4%" },
      { "name": "The Standard St. Louis", "built": "2015", "beds": "465", "rent": "$1,222", "occupancy": "96%", "rentGrowth": "37.1%" },
      { "name": "City Lofts at Laclede", "built": "2006", "beds": "408", "rent": "$989", "occupancy": "100%", "rentGrowth": "30.3%" }
    ],
    "summary": "Limited supply with only 162 new beds since 2017, while SLU enrollment has grown 25%. Strong rent growth and occupancy rates demonstrate robust demand."
  }
}
```

### Economic Diversification
- **`type`**: `"economicDiversification"`
- **Description**: A half-width component highlighting the different economic sectors contributing to the market's strength.
- **Data Sourcing**: The deal document may outline the market's economic strengths. Corroborate and expand on this by researching the local Chamber of Commerce, economic development agency reports, and business journals. This is an optional, half-width section. If the local economy is not well-diversified, it's better to omit this section to avoid drawing attention to a potential weakness.
- **Data Schema**:
  ```typescript
  interface EconomicDiversificationSectionData {
    sectors: Array<{
      title: string;
      description: string;
    }>;
  }
  ``` 

**Example:**

```json
{
  "type": "economicDiversification",
  "data": {
    "sectors": [
      { "title": "Technology Sector", "description": "One-third of all Texas tech jobs are located in DFW, with 59,000 new positions added in the past 5 years." },
      { "title": "Corporate Headquarters", "description": "Home to 43 Fortune 1000 and 22 Fortune 500 companies, providing a stable, high-income employment base." },
      { "title": "Population Growth", "description": "DFW leads all U.S. metro areas in population growth, adding over 120,000 new residents annually." }
    ]
  }
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

---
## Full Listing JSON Skeleton

This skeleton provides a complete example of a `Listing` object with all possible sections and their fields populated with placeholder data. Use this as a reference for constructing the full JSON payload.

```json
{
  "listingName": "Example Listing Name",
  "listingSlug": "example-listing-slug",
  "projectId": "example-project-id-001",
  "sections": [
    {
      "type": "hero",
      "data": {
        "listingName": "Example Listing Name",
        "location": "City, ST",
        "minInvestment": 100000,
        "fundName": "Example OZ Fund I LLC"
      }
    },
    {
      "type": "tickerMetrics",
      "data": {
        "metrics": [
          { "label": "10-Yr Equity Multiple", "value": "3.0x", "change": "+15%" },
          { "label": "Preferred Return", "value": "8%", "change": "Guaranteed" },
          { "label": "Min Investment", "value": "$100K", "change": "Minimum" },
          { "label": "Location", "value": "City, ST", "change": "Prime Location" },
          { "label": "Hold Period", "value": "10 Years", "change": "OZ Qualified" },
          { "label": "Tax Benefit", "value": "100%", "change": "Tax-Free Exit" }
        ]
      }
    },
    {
      "type": "compellingReasons",
      "data": {
        "reasons": [
          {
            "title": "Reason Title 1",
            "description": "Short description for compelling reason 1.",
            "icon": "IconName1"
          },
          {
            "title": "Reason Title 2",
            "description": "Short description for compelling reason 2.",
            "icon": "IconName2"
          },
          {
            "title": "Reason Title 3",
            "description": "Short description for compelling reason 3.",
            "icon": "IconName3"
          }
        ]
      }
    },
    {
      "type": "executiveSummary",
      "data": {
        "summary": {
          "quote": "An impactful quote to lead the section.",
          "paragraphs": [
            "This is the first paragraph of the executive summary.",
            "This is the second paragraph of the executive summary."
          ],
          "conclusion": "A concluding sentence or two for the summary."
        }
      }
    },
    {
      "type": "investmentCards",
      "data": {
        "cards": [
          {
            "id": "financial-returns",
            "title": "Financial Returns",
            "keyMetrics": [
              { "label": "10-Yr Equity Multiple", "value": "3.0x" },
              { "label": "IRR", "value": "15%" },
              { "label": "Preferred Return", "value": "8%" }
            ],
            "summary": "Summary for financial returns card."
          },
          {
            "id": "property-overview",
            "title": "Property Overview",
            "keyMetrics": [
              { "label": "Total Units", "value": "250" },
              { "label": "Asset Class", "value": "Multifamily" },
              { "label": "Year Built", "value": "2025" }
            ],
            "summary": "Summary for property overview card."
          },
          {
            "id": "market-analysis",
            "title": "Market Analysis",
            "keyMetrics": [
              { "label": "Population Growth", "value": "5%" },
              { "label": "Job Growth", "value": "3%" },
              { "label": "Median Income", "value": "$80,000" }
            ],
            "summary": "Summary for market analysis card."
          },
          {
            "id": "sponsor-profile",
            "title": "Sponsor Profile",
            "keyMetrics": [
              { "label": "Experience", "value": "20+ Years" },
              { "label": "AUM", "value": "$500M+" },
              { "label": "Track Record", "value": "Proven Success" }
            ],
            "summary": "Summary for sponsor profile card."
          }
        ]
      }
    }
  ],
  "details": {
    "financialReturns": {
      "pageTitle": "Financial Returns",
      "pageSubtitle": "Detailed financial breakdown.",
      "backgroundImages": [],
      "sections": [
        {
          "type": "projections",
          "data": {
            "projections": [
              { "label": "10-Yr Equity Multiple", "value": "3.0x", "description": "Description for equity multiple." },
              { "label": "Target IRR", "value": "15%", "description": "Description for IRR." },
              { "label": "Preferred Return", "value": "8%", "description": "Description for preferred return." },
              { "label": "Metric 4", "value": "Value 4", "description": "Description 4" },
              { "label": "Metric 5", "value": "Value 5", "description": "Description 5" },
              { "label": "Metric 6", "value": "Value 6", "description": "Description 6" }
            ]
          }
        },
        {
          "type": "distributionTimeline",
          "data": {
            "timeline": [
              { "year": "Year 1-2", "phase": "Development", "distribution": "0%", "description": "Description for phase 1." },
              { "year": "Year 3-5", "phase": "Stabilization", "distribution": "8%", "description": "Description for phase 2." }
            ]
          }
        },
        {
          "type": "taxBenefits",
          "data": {
            "benefits": [
              { "icon": "IconName1", "title": "Benefit 1", "description": "Description for tax benefit 1." },
              { "icon": "IconName2", "title": "Benefit 2", "description": "Description for tax benefit 2." }
            ]
          }
        },
        {
          "type": "investmentStructure",
          "data": {
            "structure": [
              { "label": "Min. Investment", "value": "$100,000" },
              { "label": "Asset Type", "value": "Multifamily" }
            ]
          }
        }
      ]
    },
    "propertyOverview": {
        "pageTitle": "Property Overview",
        "pageSubtitle": "Detailed property overview.",
        "backgroundImages": [],
        "sections": [
            {
                "type": "keyFacts",
                "data": {
                    "facts": [
                        { "label": "Fact 1", "value": "Value 1", "description": "Description 1" },
                        { "label": "Fact 2", "value": "Value 2", "description": "Description 2" },
                        { "label": "Fact 3", "value": "Value 3", "description": "Description 3" },
                        { "label": "Fact 4", "value": "Value 4", "description": "Description 4" }
                    ]
                }
            },
            {
                "type": "amenities",
                "data": {
                    "amenities": [
                        { "name": "Amenity 1", "icon": "IconName1" },
                        { "name": "Amenity 2", "icon": "IconName2" },
                        { "name": "Amenity 3", "icon": "IconName3" },
                        { "name": "Amenity 4", "icon": "IconName4" }
                    ]
                }
            },
            {
                "type": "unitMix",
                "data": {
                    "unitMix": [
                        { "type": "Studio", "count": 50, "sqft": "500", "rent": "$1500" },
                        { "type": "1-Bed", "count": 100, "sqft": "750", "rent": "$2000" }
                    ],
                    "specialFeatures": {
                        "title": "Special Features",
                        "description": "Description of special features."
                    }
                }
            },
            {
                "type": "locationHighlights",
                "data": {
                    "highlights": [
                        { "title": "Highlight 1", "description": "Description 1", "icon": "Icon1" },
                        { "title": "Highlight 2", "description": "Description 2", "icon": "Icon2" },
                        { "title": "Highlight 3", "description": "Description 3", "icon": "Icon3" }
                    ]
                }
            },
            {
                "type": "locationFeatures",
                "data": {
                    "featureSections": [
                        { "category": "Category 1", "icon": "Icon1", "features": ["Feature 1.1", "Feature 1.2"] },
                        { "category": "Category 2", "icon": "Icon2", "features": ["Feature 2.1", "Feature 2.2"] },
                        { "category": "Category 3", "icon": "Icon3", "features": ["Feature 3.1", "Feature 3.2"] }
                    ]
                }
            },
            {
                "type": "developmentTimeline",
                "data": {
                    "timeline": [
                        { "status": "completed", "title": "Phase 1", "description": "Description 1" },
                        { "status": "in_progress", "title": "Phase 2", "description": "Description 2" }
                    ]
                }
            },
            {
                "type": "developmentPhases",
                "data": {
                    "phases": [
                        { "phase": "Phase 1", "units": 100, "sqft": "100,000", "features": "Features 1", "timeline": "2025" },
                        { "phase": "Phase 2", "units": 150, "sqft": "150,000", "features": "Features 2", "timeline": "2026" }
                    ]
                }
            }
        ]
    },
    "marketAnalysis": {
        "pageTitle": "Market Analysis",
        "pageSubtitle": "Detailed market analysis.",
        "backgroundImages": [],
        "sections": [
            {
                "type": "marketMetrics",
                "data": {
                    "metrics": [
                        { "label": "Metric 1", "value": "Value 1", "description": "Description 1" },
                        { "label": "Metric 2", "value": "Value 2", "description": "Description 2" },
                        { "label": "Metric 3", "value": "Value 3", "description": "Description 3" },
                        { "label": "Metric 4", "value": "Value 4", "description": "Description 4" },
                        { "label": "Metric 5", "value": "Value 5", "description": "Description 5" },
                        { "label": "Metric 6", "value": "Value 6", "description": "Description 6" }
                    ]
                }
            },
            {
                "type": "majorEmployers",
                "data": {
                    "employers": [
                        { "name": "Employer 1", "employees": "1000+", "industry": "Industry 1", "distance": "1 mi" },
                        { "name": "Employer 2", "employees": "2000+", "industry": "Industry 2", "distance": "2 mi" }
                    ]
                }
            },
            {
                "type": "demographics",
                "data": {
                    "demographics": [
                        { "category": "Category 1", "value": "Value 1", "description": "Description 1" },
                        { "category": "Category 2", "value": "Value 2", "description": "Description 2" }
                    ]
                }
            },
            {
                "type": "keyMarketDrivers",
                "data": {
                    "drivers": [
                        { "title": "Driver 1", "description": "Description 1", "icon": "Icon1" },
                        { "title": "Driver 2", "description": "Description 2", "icon": "Icon2" },
                        { "title": "Driver 3", "description": "Description 3", "icon": "Icon3" },
                        { "title": "Driver 4", "description": "Description 4", "icon": "Icon4" }
                    ]
                }
            },
            {
                "type": "supplyDemand",
                "data": {
                    "analysis": [
                        { "icon": "Icon1", "title": "Supply", "description": "Supply analysis." },
                        { "icon": "Icon2", "title": "Demand", "description": "Demand analysis." }
                    ]
                }
            },
            {
                "type": "competitiveAnalysis",
                "data": {
                    "competitors": [
                        { "name": "Competitor 1", "built": "2020", "beds": "200", "rent": "$2000", "occupancy": "95%", "rentGrowth": "5%" }
                    ],
                    "summary": "Competitive analysis summary."
                }
            },
            {
                "type": "economicDiversification",
                "data": {
                    "sectors": [
                        { "title": "Sector 1", "description": "Description 1" },
                        { "title": "Sector 2", "description": "Description 2" }
                    ]
                }
            }
        ]
    },
    "sponsorProfile": {
      "sponsorName": "Example Sponsor Name",
      "sections": [
        {
          "type": "sponsorIntro",
          "data": {
            "sponsorName": "About Example Sponsor",
            "content": {
              "paragraphs": [ "Paragraph 1 about sponsor.", "Paragraph 2 about sponsor." ],
              "highlights": {
                "type": "icons",
                "items": [
                  { "text": "Highlight 1", "icon": "Icon1" },
                  { "text": "Highlight 2", "icon": "Icon2" }
                ]
              }
            }
          }
        },
        {
            "type": "partnershipOverview",
            "data": {
                "partners": [
                    { "name": "Partner 1", "description": ["Description of partner 1."] },
                    { "name": "Partner 2", "description": ["Description of partner 2."] }
                ]
            }
        },
        {
          "type": "trackRecord",
          "data": {
            "metrics": [
              { "label": "Metric 1", "value": "Value 1", "description": "Description 1" },
              { "label": "Metric 2", "value": "Value 2", "description": "Description 2" },
              { "label": "Metric 3", "value": "Value 3", "description": "Description 3" },
              { "label": "Metric 4", "value": "Value 4", "description": "Description 4" }
            ]
          }
        },
        {
          "type": "leadershipTeam",
          "data": {
            "teamMembers": [
              { "name": "Member 1", "title": "Title 1", "experience": "10+ years", "background": "Background of member 1." },
              { "name": "Member 2", "title": "Title 2", "experience": "15+ years", "background": "Background of member 2." }
            ]
          }
        },
        {
          "type": "developmentPortfolio",
          "data": {
            "projects": [
              { "name": "Project 1", "location": "Location 1", "units": "100", "year": "2022", "status": "Completed", "returnsOrFocus": "Focus 1" }
            ],
            "investmentPhilosophy": {
              "title": "Investment Philosophy",
              "description": "Description of investment philosophy."
            }
          }
        },
        {
            "type": "keyDevelopmentPartners",
            "data": {
                "partners": [
                    { "name": "Partner 1", "role": "Role 1", "description": "Description 1" },
                    { "name": "Partner 2", "role": "Role 2", "description": "Description 2" }
                ]
            }
        },
        {
            "type": "competitiveAdvantages",
            "data": {
                "advantages": [
                    { "icon": "Icon1", "title": "Advantage 1", "description": "Description 1" },
                    { "icon": "Icon2", "title": "Advantage 2", "description": "Description 2" }
                ]
            }
        }
      ]
    }
  }
}
``` 