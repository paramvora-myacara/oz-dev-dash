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
-   **Description**: A scrolling marquee of key financial and property metrics.
-   **Data Schema**:
    ```typescript
    interface TickerMetricsSectionData {
      metrics: Array<{
        label: string;  // e.g., "10-Yr Equity Multiple"
        value: string;  // e.g., "2.8–3.2x"
        change: string; // A short descriptive string, e.g., "+12%" or "Guaranteed"
      }>;
    }
    ```

### 3. Compelling Reasons Section

-   **`type`**: `"compellingReasons"`
-   **Description**: Three highlighted cards explaining the top reasons to invest.
-   **Data Schema**:
    ```typescript
    interface CompellingReasonsSectionData {
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
        paragraphs: string[]; // An array of paragraphs for the main body. HTML can be embedded.
        conclusion: string; // A concluding sentence or two.
      };
    }
    ```

### 5. Investment Cards Section

-   **`type`**: `"investmentCards"`
-   **Description**: A grid of cards that link to the detailed sub-pages (Due Diligence Vault).
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