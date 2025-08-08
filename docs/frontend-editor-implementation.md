# Frontend Editor Implementation Plan

## Goal
Enable in-place editing of all dynamic content on listing pages and detail pages without changing the presentational layout. Changes are drafted on the client, logged to console on change, and versioned with rollbacks.

## Constraints and Scope
- **Editable**: Any dynamic text/metric coming from our listing data model (labels, values, paragraphs, etc.)
- **Not editable**: Layout/structure (no adding/removing sections or changing counts like number of metrics in a card)
- **Types**: Enforce `Listing` TypeScript types; constrain inputs by expected type (string/number/percent/date where applicable)
- **Frontend only**: No server-side backend changes for this phase

## Data Addressing (Paths)
- **Problem**: Array index-based paths are brittle (e.g., `sections[4].data.cards[0].keyMetrics[0].label`)
- **Solution**: Prefer stable keys over indices wherever possible
  - **Short term**: Continue paths that include indices for arrays that represent ordered content (e.g., metrics), but use section type names as object keys when possible
  - **Medium term**: Refactor `listing.sections` from an array to an object with section keys and a separate `sectionOrder` array
- Each `<Editable>` receives a `dataPath` string and optional `inputType` hint

## State Management
- Use Zustand for global draft state to avoid cascade re-renders from Context
- Use Immer inside the store actions to perform deep, immutable updates with concise code
- Store shape:
  - `originalData: Listing` (snapshot loaded from server/static file)
  - `draftData: Listing` (cloned from original and mutated via Immer)
  - `isEditing: boolean` (true when on edit page)
  - `isDirty: boolean` (true if draft differs from original)
  - Actions:
    - `initializeDraft(listing: Listing)`
    - `setEditing(isEditing: boolean)`
    - `updateField(path: string, value: unknown)` (Immer-based deep set)
    - `resetDraft()` (discard changes back to original)
    - `applyServerData(listing: Listing)` (after successful save)

## Editable Primitives
- Component: `Editable`
  - Props: `dataPath`, `value?`, `placeholder?`, `inputType?: 'text'|'number'|'percent'|'currency'|'multiline'|'select'`, `constraints?: { min? max? pattern? options? }`
  - Behavior:
    - In edit pages, render appropriate input (text, number, textarea, select) bound to `draftData` via `dataPath`
    - In view pages, render value as plain text
  - Validation: Apply basic client-side validation per `inputType` and `constraints`

## Step-by-Step Implementation Plan

### 1. Install Dependencies
```bash
npm i zustand immer
```

### 2. Create Editor Store
**File**: `src/hooks/useListingEditor.ts`

Add:
- State: `originalData: Listing | null`, `draftData: Listing | null`, `isEditing: boolean`, `isDirty: boolean`
- Actions:
  - `initializeDraft(listing: Listing)` (clone into `draftData` and set `originalData`)
  - `setEditing(isEditing: boolean)`
  - `updateField(path: string, value: unknown)` → use Immer to deep-set, console.log `{ path, oldValue, newValue }`, set `isDirty`
  - `resetDraft()` → `draftData = originalData`, `isDirty=false`
- Helpers: Small `getAtPath(obj, path)` and `setAtPath(draft, path, value)` using string paths like `sections.tickerMetrics.data.metrics[0].label`

### 3. Create Editable Primitive
**File**: `src/components/Editable.tsx`

Props: `dataPath`, `inputType?: 'text'|'number'|'percent'|'currency'|'multiline'|'select'`, `placeholder?`, `constraints?`

Behavior:
- Read `isEditing`, `draftData` from store
- Resolve current value via `getAtPath(draftData, dataPath)`
- If `isEditing`: render input/textarea; on change call `updateField(dataPath, parsedValue)`
- Else: render plain text

### 4. Refactor Types (Overview Only)
**File**: `src/types/listing.ts`

Change overview `sections`:
- From: `sections: ListingOverviewSection[]`
- To:
  ```typescript
  sections: {
    sectionOrder: Array<'hero'|'tickerMetrics'|'compellingReasons'|'executiveSummary'|'investmentCards'>;
    hero?: HeroSectionData;
    tickerMetrics?: TickerMetricsSectionData;
    compellingReasons?: CompellingReasonsSectionData;
    executiveSummary?: ExecutiveSummarySectionData;
    investmentCards?: InvestmentCardsSectionData;
  }
  ```
- Keep detail page `sections` as arrays (no change)

### 5. Migrate Overview Data Files to New Shape
**Files**:
- `src/lib/listings/the-edge-on-main.ts`
- `src/lib/listings/marshall-st-louis.ts`
- `src/lib/listings/sogood-dallas.ts`
- `src/lib/listings/up-campus-reno.ts`

Change:
- Replace `sections: [ { type, data }, ... ]` with:
  ```typescript
  sections: {
    sectionOrder: ['hero','tickerMetrics','compellingReasons','executiveSummary','investmentCards'],
    hero: {...},
    tickerMetrics: {...},
    compellingReasons: {...},
    executiveSummary: {...},
    investmentCards: {...}
  }
  ```
- Do not touch `details` objects

### 6. Update Overview Page Renderer
**File**: `src/app/[slug]/listing-page-client.tsx`

Edits:
- Import store: `useListingEditor`
- On mount: `initializeDraft(listing)` if not set
- Pick `const liveListing = isEditing ? draftData ?? listing : listing;`
- Replace `listing.sections.map(...)` with iteration over `liveListing.sections.sectionOrder`, producing `{ type, data }` on the fly:
  - For each key `t` in `sectionOrder`: call correct section component with `liveListing.sections[t]` and `listingSlug`
- Keep other logic unchanged

### 7. Create Edit Shell Page
**File**: `src/app/[slug]/edit/page.tsx`

Add:
- Load the `Listing` via `getListingBySlug(params.slug)`
- Render the same `ListingPageClient`, but set global editing: `setEditing(true)` on mount
- Include a small sticky toolbar (top-right): Save, Cancel
  - Save: `console.log('SAVE', draftData)` and `resetDirty` (or `initializeDraft(draftData)`)
  - Cancel: `resetDraft()`

### 8. Wrap Overview Leaf Values with Editable
**File**: `src/components/listing/TickerMetricsSection.tsx`
- Wrap each label/value/change:
  - Paths:
    - `sections.tickerMetrics.data.metrics[${idx}].label`
    - `sections.tickerMetrics.data.metrics[${idx}].value`
    - `sections.tickerMetrics.data.metrics[${idx}].change`

**File**: `src/components/listing/InvestmentCardsSection.tsx`
- Wrap:
  - Card title: `sections.investmentCards.data.cards[${idx}].title`
  - Key metrics label/value:
    - `sections.investmentCards.data.cards[${idx}].keyMetrics[${metricIdx}].label`
    - `sections.investmentCards.data.cards[${idx}].keyMetrics[${metricIdx}].value`
  - Summary: `sections.investmentCards.data.cards[${idx}].summary`

**File**: `src/components/listing/ExecutiveSummarySection.tsx`
- Wrap:
  - Quote: `sections.executiveSummary.data.summary.quote`
  - Paragraphs: `sections.executiveSummary.data.summary.paragraphs[${i}]`
  - Conclusion: `sections.executiveSummary.data.summary.conclusion`

### 9. Show Edited Values Live
- The `Editable` should display current `draftData` values
- Non-wrapped text keeps using props; the above wrappers cover all visible leaf values in those sections

### 10. Wire Console Logging
- In `updateField(path, value)`:
  - Read `oldValue = getAtPath(draftData, path)`
  - `console.log('[Editor] update', { path, oldValue, newValue: value });`
- In Save button:
  - `console.log('[Editor] save payload', draftData);`
- In Cancel:
  - `console.log('[Editor] cancel -> reset');`

### 11. Optional (Later): Detail Page Wrappers
- Mirror the approach for detail components under `src/components/listing/details/**` with paths like:
  - `details.financialReturns.sections[0].data.projections[${i}].label`
  - Keep arrays, use indices

### 12. Manual QA Checklist
- Start dev, visit `/the-edge-on-main/edit`, toggle inputs and verify:
  - Inputs render only on `/edit`
  - Console logs emit path + old + new on each change
  - Save logs full payload; Cancel reverts fields
  - Overview renders in refactored order via `sectionOrder`

## Notes
- Keep presentational components layout unchanged; only wrap leaf values
- Use stable keys in overview `sections` for durable paths; arrays keep indices for now
- No persistence/localStorage in this phase per request
- Console logging provides immediate feedback for development and testing

## Key Files to Touch
1. `src/hooks/useListingEditor.ts` - Global state management
2. `src/components/Editable.tsx` - Generic editable component
3. Data files in `src/lib/listings/**` - Migrate to new section structure
4. `src/types/listing.ts` - Update overview section types
5. `src/app/[slug]/listing-page-client.tsx` - Wire up editing state
6. `src/app/[slug]/edit/page.tsx` - Edit shell page
7. Overview section components - Wrap leaf values with Editable 