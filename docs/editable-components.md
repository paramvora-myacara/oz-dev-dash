### Goal
Enable in-place editing of all dynamic content on listing pages and detail pages without changing the presentational layout. Changes are drafted on the client, persisted to backend on explicit save, and versioned with rollbacks.

### Constraints and scope
- Editable: any dynamic text/metric coming from our listing data model (labels, values, paragraphs, etc.).
- Not editable: layout/structure (no adding/removing sections or changing counts like number of metrics in a card).
- Types: enforce `Listing` TypeScript types; constrain inputs by expected type (string/number/percent/date where applicable).

### Data addressing (paths)
- Problem: array index-based paths are brittle (e.g., `sections[4].data.cards[0].keyMetrics[0].label`).
- Plan: prefer stable keys over indices wherever possible.
  - Short term (no schema rewrite): continue paths that include indices for arrays that represent ordered content (e.g., metrics), but use section type names as object keys when possible.
  - Medium term (recommended): refactor `listing.sections` from an array to an object with section keys and a separate `sectionOrder` array. Paths become: `sections.investmentCards.data.cards[0].keyMetrics[0].label`.
- Each `<Editable>` receives a `dataPath` string and optional `inputType` hint.
- For details pages, prefix paths with the page key under `details`. Examples:
  - `details.financialReturns.sections[0].data.projections[0].label`
  - `details.marketAnalysis.sections[2].data.metrics[1].value`
  - `details.propertyOverview.sections[1].data.amenities[0]`

### State management
- Use Zustand for global draft state to avoid cascade re-renders from Context.
- Use Immer inside the store actions to perform deep, immutable updates with concise code.
- Store shape:
  - `originalData: Listing` (snapshot loaded from server/static file)
  - `draftData: Listing` (cloned from original and mutated via Immer)
  - `isDirty: boolean` (true if draft differs from original)
  - `isEditing: boolean` (global flag for edit UI across overview/details)
  - Actions:
    - `initializeDraft(listing: Listing)`
    - `updateField(path: string, value: unknown)` (Immer-based deep set)
    - `resetDraft()` (discard changes back to original)
    - `applyServerData(listing: Listing)` (after successful save)
    - `setIsEditing(isEditing: boolean)`
- Edit mode persistence: reflect `isEditing` in the URL (e.g., `/[slug]/edit` and `/[slug]/details/[detailPage]/edit`) and/or a query param `?edit=1` so navigation keeps the UI in edit mode.

### Editable primitives
- Component: `Editable`
  - Props: `dataPath`, `value?`, `placeholder?`, `inputType?: 'text'|'number'|'percent'|'currency'|'multiline'|'select'`, `constraints?: { min? max? pattern? options? }`
  - Behavior:
    - In edit pages, render appropriate input (text, number, textarea, select) bound to `draftData` via `dataPath`.
    - In view pages, render value as plain text.
  - Validation: apply basic client-side validation per `inputType` and `constraints`.

### Where to integrate
- Listing overview page: `src/app/[slug]/listing-page-client.tsx`
  - Wrap all dynamic values inside presentational sections with `<Editable>`.
- Detail pages: `src/app/[slug]/details/[detailPage]/detail-page-client.tsx` and child components under `src/components/listing/details/**`
  - Wrap all dynamic content similarly, including `HeaderContent` title/subtitle and each detail section's leaf values.
  - Use paths under `details.{camelCasePage}.…` as noted above.
- Routing while editing: when `isEditing` is true, links between overview and details should point to the `/edit` variants so the editor UI remains active (e.g., overview → `/[slug]/details/[detailPage]/edit`, back link → `/[slug]/edit#anchor`).

### Draft persistence (client-side)
- Persist `draftData` in `localStorage` keyed by `listingSlug` and `userId` to survive reloads.
- Both overview and details edit pages share the same draft key so edits are visible across pages.
- On edit page mount:
  - Load server/original data
  - Check localStorage for existing draft; if newer, hydrate `draftData` from it.
- On change:
  - Debounced (e.g., 500ms) write draft to localStorage.
- On cancel:
  - Clear local storage draft and reset to original.

### Save flow (server-side persistence)
- On Save in `/[slug]/edit` and `/[slug]/details/[detailPage]/edit`:
  - Validate draft on client (types + required fields) → show inline errors.
  - Call server route `POST /api/listings/{slug}/save` with full `draftData` and optional `commitMessage`.
  - Server responsibilities:
    - Verify admin session and authorization for `{slug}`
    - Versioning strategy: append-only ledger in a `listing_versions` table with `slug`, `data jsonb`, `created_at`, `user_id`, `commit_message`.
    - Insert a new row with the full payload (simple, immutable history).
    - Optionally maintain a `listings_current` table updated transactionally for fast reads (optional optimization).
  - On success: update `originalData = draftData`, clear `isDirty`, clear localStorage draft.
- Single source of truth: the Save action always writes the entire `draftData` (full `Listing`), regardless of whether you initiated Save from the overview or a details edit page.

### Versioning and rollback
- Tables:
  - `listing_versions`:
    - `id` uuid pk, `listing_slug` text, `data` jsonb, `created_at` timestamptz, `user_id` uuid, `commit_message` text
- API:
  - `GET /api/listings/{slug}/versions?limit=20` → list recent versions (timestamp, author, message)
  - `POST /api/listings/{slug}/rollback` body: `{ versionId }` → creates a new version by copying `data` from the selected version (never mutates old rows)
- UI in `/[slug]/edit` and `/[slug]/details/[detailPage]/edit`:
  - Versions drawer: list, preview differences (optional), and rollback.

### Data typing and validation
- Respect `Listing` TypeScript types to drive UI and validation.
- Input adapters for formatting/parsing:
  - Percent: display with `%`, store as string or number consistently (choose one and migrate)
  - Currency: display with `$` formatting, store normalized
  - Numbers: parseFloat with range checks
- Add small schema validators (zod/yup) for critical sections to prevent invalid saves.

### Environment and security
- Admin edit pages are protected via custom admin session cookie enforced in middleware (see `docs/admin-dash.md`).
- All save/version APIs verify authorization on the server using the cookie and cross-check against `admin_user_listings`.
- Do not expose service role keys to the client.

### Incremental implementation plan
1. Build the edit shell pages:
   - `src/app/[slug]/edit/page.tsx` (overview) and `src/app/[slug]/details/[detailPage]/edit/page.tsx` (details)
   - Both load listing data and render presentational components with an `isEditing` prop.
2. Add Zustand store + Immer actions, and wire `Editable` to update `draftData` via `dataPath`.
3. Wrap dynamic values in key sections:
   - Overview: start with `TickerMetricsSection`, `InvestmentCardsSection`.
   - Details: start with `HeaderContent` title/subtitle and high-traffic sections in each page (e.g., Financial Returns → Projections; Market Analysis → MarketMetrics; Property Overview → KeyFacts/Amenities).
4. Add localStorage draft persistence keyed by `listingSlug:userId` (shared across overview/details).
5. Implement server routes for save and versions; create `listing_versions` table; gate with admin session.
6. Add Save/Cancel toolbar and basic versions list with rollback action to both edit shells. Ensure Save posts full `draftData`.
7. Update internal links to respect edit mode: overview → details `/edit`, details back link → overview `/edit`.
8. Optional: refactor data structure to object + `sectionOrder` for stable paths; update paths in `Editable` usages.

### Notes on arrays and constraints
- Customers cannot add/remove items (e.g., always 3 metrics in a card) in Phase 1. Inputs exist only for labels/values.
- If we later allow add/remove, we’ll add guarded actions that update arrays while validating against business rules. 