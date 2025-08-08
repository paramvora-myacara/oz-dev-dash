### Frontend-only Editable Listing Implementation Plan (Auto Mode)

Scope: Implement client-side in-place editing for overview and details pages. Persist draft in localStorage. No backend. Save should just console.log the full draft payload.

---

## 0) Prerequisites
- Ensure TypeScript, React, Zustand, and Immer are available. If Immer is not installed, add it.
- Confirm the `Listing` types live in `src/types/listing.ts` and overview/details components render dynamic values as shown.

Tasks
- [ ] Install Immer if missing: `npm i immer`

---

## 1) Add editor state store (Zustand + Immer)
Create a global store to track original data, draft data, and UI editing state.

Files
- `src/hooks/useListingDraftStore.ts`
- `src/utils/objectPath.ts` (getByPath/setByPath helpers)

Store shape
- `originalData: Listing | null`
- `draftData: Listing | null`
- `listingSlug: string | null`
- `isDirty: boolean`
- `isEditing: boolean`
- Actions:
  - `initializeDraft(listing: Listing)`
  - `updateField(path: string, value: unknown)`
  - `resetDraft()`
  - `setIsEditing(isEditing: boolean)`
  - `loadDraftFromLocalStorage()`
  - `persistDraftToLocalStorage()`

Steps
- [ ] Implement `useListingDraftStore` using Zustand.
- [ ] Use Immer's `produce` inside actions to immutably update `draftData`.
- [ ] Implement `getByPath(path, obj)` and `setByPath(path, obj, value)` in `src/utils/objectPath.ts` supporting array indices like `sections[3].data.metrics[1].label`.
- [ ] In `persistDraftToLocalStorage`, use key `ozdash:draft:${listingSlug}`. Store `{ updatedAt, draftData }`.
- [ ] `loadDraftFromLocalStorage` should hydrate `draftData` only if newer than current or if empty.

---

## 2) Create `Editable` primitive
An inline control that renders either text or an input bound to the draft via `dataPath`.

File
- `src/components/Editable.tsx`

API
- Props: `dataPath: string`, `value?: string | number`, `placeholder?: string`, `inputType?: 'text'|'number'|'percent'|'currency'|'multiline'`, `constraints?: { min?: number; max?: number; pattern?: string; options?: string[] }`
- Behavior:
  - If `isEditing` is false (from store), render formatted `value` or `getByPath(draftData, dataPath)` as plain text.
  - If `isEditing` is true, render an appropriate input bound to `draftData` field value.
  - On change, call `updateField(dataPath, parsedValue)`.

Steps
- [ ] Read `isEditing` and `draftData` from the store.
- [ ] Resolve current field value via `value ?? getByPath(draftData, dataPath)`.
- [ ] Render controls: `input`, `textarea` for `multiline`.
- [ ] Handle basic parsing/formatting for `number`, `percent`, `currency` minimally (no backend, keep simple).

---

## 3) Add edit routes (shell pages)
Create explicit edit routes that keep the UI in editing mode across navigation.

Files
- `src/app/[slug]/edit/page.tsx`
- `src/app/[slug]/details/[detailPage]/edit/page.tsx`

Overview edit page responsibilities
- [ ] Load listing data (same as `src/app/[slug]/page.tsx`).
- [ ] Initialize store: `initializeDraft(listing)`, set `listingSlug` and `isEditing=true`, attempt `loadDraftFromLocalStorage()`.
- [ ] Render the same overview client component with an `isEditing` flag or the store will manage it globally.
- [ ] Render an `EditorToolbar` (see Step 6) that shows Save/Cancel.

Details edit page responsibilities
- [ ] Load listing and page data (same as `src/app/[slug]/details/[detailPage]/page.tsx`).
- [ ] Initialize store as above and set `isEditing=true`.
- [ ] Render detail client component; ensure it reads `isEditing` from store or passed prop.
- [ ] Render `EditorToolbar`.

Note
- Prefer a single source of truth for `isEditing` via the store; pages set it on mount/unmount.

---

## 4) Propagate section indices for stable dataPath construction
We currently render overview sections as an array. For Phase 1, use indices to construct paths.

Overview
- File: `src/app/[slug]/listing-page-client.tsx`
- [ ] In `SectionRenderer`, pass `sectionIndex={idx}` to each section component.
- [ ] Update each overview section component to accept `sectionIndex: number` and use it in `Editable` paths.

Details
- Each details page (e.g., `FinancialReturnsPage`) maps its sections.
- [ ] Modify each details page to pass `sectionIndex` to the leaf section components (e.g., `ProjectionsSection`).
- [ ] Update leaf components to accept `sectionIndex` and use it when composing `dataPath`.

---

## 5) Wrap dynamic values with `Editable`
Start with high-impact sections, then expand.

Overview
- File: `src/components/listing/TickerMetricsSection.tsx`
  - [ ] Wrap metric fields with:
    - `sections[${sectionIndex}].data.metrics[${idx}].label`
    - `sections[${sectionIndex}].data.metrics[${idx}].value`
    - `sections[${sectionIndex}].data.metrics[${idx}].change`
- File: `src/components/listing/InvestmentCardsSection.tsx`
  - [ ] Wrap card fields with:
    - Title: `sections[${sectionIndex}].data.cards[${idx}].title`
    - Summary: `sections[${sectionIndex}].data.cards[${idx}].summary`
    - Key metrics: `sections[${sectionIndex}].data.cards[${idx}].keyMetrics[${metricIdx}].label` and `.value`
- Also consider:
  - `CompellingReasonsSection`: titles/descriptions/highlight
  - `ExecutiveSummarySection`: quote/paragraphs/conclusion

Details
- Header
  - File: `src/components/listing/details/shared/HeaderContent.tsx`
  - [ ] If page ≠ sponsorProfile, wrap:
    - Title: `details.${camelCasePage}.pageTitle`
    - Subtitle: `details.${camelCasePage}.pageSubtitle`
  - [ ] If `sponsorProfile`, wrap:
    - Sponsor name: `details.sponsorProfile.sponsorName`
- Financial Returns → `ProjectionsSection`
  - File: `src/components/listing/details/financial-returns/ProjectionsSection.tsx`
  - [ ] Wrap each projection:
    - `details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].label`
    - `details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].value`
    - `details.financialReturns.sections[${sectionIndex}].data.projections[${idx}].description`
- Repeat pattern for other detail sections as needed (MarketMetrics, KeyFacts, Amenities, etc.).

Notes
- Do not allow add/remove items in arrays for Phase 1. Only edit existing values.

---

## 6) Editor toolbar (Save/Cancel)
Provide a consistent toolbar in edit routes.

File
- `src/components/editor/EditorToolbar.tsx`

Features
- [ ] Shows Save and Cancel buttons; optionally a subtle "Editing" indicator.
- [ ] `Save`: reads current `draftData` from store and `console.log('SAVE_DRAFT', { slug, draftData })`.
- [ ] `Cancel`: calls `resetDraft()` and clears the localStorage key.
- [ ] Debounced `persistDraftToLocalStorage` on changes triggered by `Editable` updates.

Usage
- [ ] Include in both `src/app/[slug]/edit/page.tsx` and `src/app/[slug]/details/[detailPage]/edit/page.tsx`.

---

## 7) Keep navigation in edit mode
Ensure links route to `/edit` variants when editing.

Overview → Details
- File: `src/components/listing/InvestmentCardsSection.tsx`
- [ ] When `isEditing` is true, link to `/${listingSlug}/details/${card.id}/edit` instead of non-edit route.

Details back link → Overview
- File: `src/components/listing/details/shared/HeaderContent.tsx`
- [ ] When `isEditing` is true, link to `/${slug}/edit#investment-cards`.

Implementation hint
- Read `isEditing` from the store in these components to choose the correct href.

---

## 8) Page wiring for initialization and persistence
Overview edit page
- [ ] On mount: `initializeDraft(listing)` → `loadDraftFromLocalStorage()` → `setIsEditing(true)`.
- [ ] On unmount: optional `setIsEditing(false)`.

Details edit page
- [ ] Same initialization as overview edit page. Ensure it uses the same localStorage key so drafts are shared across overview/details.

Draft persistence
- [ ] Subscribe to store changes and debounce `persistDraftToLocalStorage` (e.g., 500ms) when `draftData` changes.

---

## 9) Minimal formatting rules (optional now)
- `percent`: accept `12` or `12%`, store normalized as string with `%` suffix.
- `currency`: accept `$1,234` or `1234`, store as `$1,234` string for now.
- `number`: `parseFloat`, validate against `constraints.min/max` if provided.

---

## 10) Acceptance checks
- [ ] Visiting `/[slug]/edit` shows the same overview with inline inputs.
- [ ] Editing values updates UI immediately across sections.
- [ ] Draft persists after reload (localStorage).
- [ ] Navigating to details via cards keeps `/edit` in URL and shows editable fields.
- [ ] Back to overview uses `/edit` and preserves draft.
- [ ] Save logs the full `Listing` payload to console and does not clear draft unless explicitly desired.
- [ ] Cancel resets to original and clears localStorage draft.

---

## 11) Out of scope (for now)
- Backend APIs (`/api/listings/...`) and database versioning.
- Add/remove array items.
- Server-side validation.

---

## 12) DataPath examples reference
- Overview ticker metric label: `sections[1].data.metrics[0].label`
- Overview investment card summary: `sections[4].data.cards[2].summary`
- Details financial return projection value: `details.financialReturns.sections[0].data.projections[1].value`
- Details page title: `details.marketAnalysis.pageTitle`

Note: Indices depend on actual section ordering. We pass `sectionIndex` from the mapping call into components to construct these paths reliably in Phase 1. 