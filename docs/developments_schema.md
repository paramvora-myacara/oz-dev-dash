
# Proposed Supabase Schema for Dynamic Real Estate Listings

This document outlines a proposed database schema for storing the content and metrics for the real estate development listings. The goal is to replace all hardcoded text, metrics, and content on the main page with data fetched from a Supabase database.

This schema is designed to be flexible and scalable, allowing for variations in content between different development projects.

## Guiding Principles & Assumptions

1.  **Separation of Concerns**: The schema is designed to store data, not presentation details. Styling information like CSS gradients and color classes are assumed to be part of the frontend template and are intentionally not included in the database.
2.  **Flexibility**: Instead of a fixed number of columns for items like "compelling reasons" or "metrics", related tables and JSONB types are used. This allows each development project to have a variable number of these items without changing the database schema.
3.  **Content with HTML**: Some text content contains HTML tags (e.g., `<strong>`). The schema uses the `TEXT` type to store this content, assuming the frontend will be responsible for rendering the HTML.
4.  **Icons**: Icons are referenced by name (e.g., "Rocket"). It is assumed that the frontend has a mechanism to map these names to the actual icon components (e.g., from a library like `lucide-react`).

---

## Modified `developments` Table

The existing `developments` table is a good foundation. Here are the proposed modifications to better align it with the content on the page.

**Changes:**
-   Renamed `summary` to `opportunity_type` for clarity.
-   Renamed `image_url` to `hero_image_url`.
-   Added `ticker_metrics` as a `JSONB` field to flexibly store the scrolling ticker data.
-   Added fields for the Executive Summary content.
-   Removed some financial metrics that are now part of the `ticker_metrics` or will be in related tables to avoid data duplication.

```sql
CREATE TABLE developments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Basic Info (from header)
  title TEXT NOT NULL, -- e.g., "ACARA Opportunity Zone Fund I LLC"
  opportunity_type TEXT, -- e.g., "Premium Multifamily Investment Opportunity"

  -- Hero Image
  hero_image_url TEXT, -- URL from Supabase Storage

  -- Ticker Metrics (replaces individual metric fields)
  -- An array of objects, e.g., [{"label": "10-Yr Equity Multiple", "value": "2.8–3.2x", "change": "+12%"}, ...]
  ticker_metrics JSONB,

  -- Executive Summary
  executive_summary_quote TEXT,
  executive_summary_p1 TEXT,
  executive_summary_p2 TEXT,
  executive_summary_highlight TEXT,

  -- Core properties from original schema
  state TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Single Asset', 'Multi-Asset')),
  development_type TEXT NOT NULL CHECK (development_type IN ('Construction', 'Development', 'Refinance', 'Acquisition')),

  -- Status/Visibility
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false
);
```

---

## New Table: `compelling_reasons`

To handle the three "Compelling Reasons" cards, a separate table is proposed. This allows for flexibility in the number of reasons per development.

```sql
CREATE TABLE compelling_reasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    development_id UUID NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    highlight TEXT,
    icon_name TEXT, -- e.g., "Rocket", "BarChart3", "Train"
    display_order INT NOT NULL -- e.g., 1, 2, 3 to maintain order
);
```

---

## New Table: `due_diligence_cards`

This table will store the information for the four cards in the "Due Diligence Vault" section. The `slug` field is used for client-side routing.

```sql
CREATE TABLE due_diligence_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    development_id UUID NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
    slug TEXT NOT NULL, -- e.g., "financial-returns" for routing
    title TEXT NOT NULL,
    icon_name TEXT, -- e.g., "TrendingUp", "Building"
    summary TEXT,
    display_order INT NOT NULL, -- To maintain order on the page

    -- An array of objects for the key metrics within each card
    -- e.g., [{"label": "10-Yr Equity Multiple", "value": "2.8–3.2x"}, ...]
    key_metrics JSONB
);
```

---

## New Table: `card_details`

To handle the content for each of the "Due Diligence Vault" detail pages (e.g., `/details/financial-returns`), this table links content to a specific card. The `content` field is a flexible `JSONB` type, allowing you to store different data structures for each page (e.g., text blocks, lists of documents, or data for charts).

```sql
CREATE TABLE card_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES due_diligence_cards(id) ON DELETE CASCADE,
    
    -- Example structure: 
    -- { 
    --   "title": "Detailed Financial Projections",
    --   "blocks": [
    --     { "type": "paragraph", "text": "Our model projects strong returns..." },
    --     { "type": "table", "data": { ... } },
    --     { "type": "document_list", "files": [
    --       { "name": "Full Proforma.pdf", "url": "..." }
    --     ]}
    --   ]
    -- }
    content JSONB
);

```

---

## Clarifying Questions

To ensure the schema perfectly meets your needs, I have a few questions based on my assumptions:

1.  **Icons**: The icons (`Rocket`, `BarChart3`, etc.) appear to be from the `lucide-react` library. My proposed schema stores the icon name as a string (e.g., "Rocket"). Is this approach acceptable, or would you prefer a different way to manage icons?

2.  **HTML in Content**: For content like the Executive Summary paragraphs, which includes `<strong>` tags, I've assumed storing this as `TEXT` and rendering the HTML on the frontend is the desired behavior. Is that correct?

3.  **Styling**: I have intentionally omitted styling details like color gradients from the database to keep the data separate from the presentation. Do you agree with this decision?

I am ready to iterate on this schema based on your feedback.
---

## Further Considerations

Here are a few additional topics to think about as you build out your application:

1.  **Image & Document Management**: 
    - **Workflow**: For images and documents (like PDFs), the recommended workflow is to upload them to a **Supabase Storage** bucket. After a successful upload, you will get a public URL for the asset. This URL is what you should store in your database tables (e.g., in `hero_image_url` or in a `documents` table).
    - **Organization**: Consider creating different folders within your storage bucket to keep assets organized (e.g., `/hero-images`, `/documents/financials`).

2.  **Data Management & Seeding**:
    - **Manual Edits**: For day-to-day changes, the Supabase Studio UI is an excellent tool for editing your data directly.
    - **Automated Seeding**: For setting up a new environment or for testing purposes, you should create a `seed.sql` script. This script would contain `INSERT` statements to populate your tables with initial data. This ensures consistency and is easily version-controlled with your project.

3.  **API Security (Row Level Security - RLS)**:
    - **Public Read Access**: Since this data will be displayed on a public website, you should enable RLS on your tables. You'll want to create a policy that allows public, anonymous users to `SELECT` (read) the data.
    - **Restricted Write Access**: To protect your data, write operations (`INSERT`, `UPDATE`, `DELETE`) should be restricted. You can create policies that only allow these operations for users with a specific authenticated role, like `service_role` or a custom `admin` role.

4.  **Data Validation**:
    - The use of `JSONB` offers great flexibility but moves the responsibility of data structure enforcement from the database to your application. Before saving data, your application code should validate that the JSON object conforms to the expected structure. This prevents malformed data from being saved and causing potential errors on the frontend. 