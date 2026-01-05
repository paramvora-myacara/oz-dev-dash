# Local-First Email Campaign System

## Overview

This document covers the implementation of a local-first email campaign editing system that provides immediate feedback while maintaining data integrity through background synchronization.

## Problem Solved

The original system required manual "Save Step" clicks for every change, creating a poor user experience. Users expected changes to save immediately, but the system needed to handle multi-step campaigns efficiently without overloading the backend.

## Solution: Local-First with Sync on Continue

### Architecture
- **Frontend**: All edits saved instantly to localStorage
- **Backend Sync**: Single batch operation when user clicks "Continue"
- **State Management**: Zustand store with persistence
- **Edge Resolution**: Database generates IDs, frontend preserves timing

### Key Benefits
- ✅ Immediate UI feedback for all changes
- ✅ No backend overload from individual saves
- ✅ Offline-capable (changes persist locally)
- ✅ Atomic sync operations
- ✅ Proper database ID generation

## Implementation Details

### Frontend Changes

#### 1. Campaign Store (Zustand)
**File:** `src/stores/campaignStore.ts`

- Uses `persist` middleware for localStorage
- Stores steps as `Record<string, CampaignStep & { needsSync: boolean, lastModified: string }>`
- Actions: `updateStep`, `addStep`, `removeStep`, `syncUnsavedChanges`
- Merges server data with local changes (local takes precedence)

#### 2. Email Steps Hook
**File:** `src/components/email-editor/hooks/useEmailSteps.ts`

- Provides sorted steps array (by `createdAt`)
- Manages local operations: `addStep`, `deleteStep`, `updateStep`
- **Fixed:** `syncUnsavedChanges` now uses sorted `steps` array instead of unsorted `Object.values(storeSteps)`

#### 3. Email Editor Integration
**Files:** `src/components/email-editor/EmailEditor.tsx`, `EmailEditorToolbar.tsx`

- Removed manual "Save Step" button
- Removed `onAutoSave` and `onManualSave` props
- `handleContinue` calls `stepsManager.syncUnsavedChanges()`

### Backend Changes

#### 1. Set-Based Replacement
**File:** `ozl-backend/services/api/routers/steps.py`

**Before:** Individual step CRUD operations with complex edge management
**After:** Single `PUT /{campaign_id}/steps` endpoint for complete replacement

**Key Changes:**
- Insert all steps with empty edges initially
- Rebuild edges based on linear sequence order
- Use preserved timing data from frontend
- Database generates proper IDs

**Algorithm:**
```python
# 1. Insert steps with empty edges
# 2. For each step i (except last):
#    - Get timing from original request data
#    - Create edge: step[i] → step[i+1] with preserved timing
# 3. Update steps with proper edges
```

#### 2. API Changes
- **Removed:** `PATCH /{campaign_id}/steps/{step_id}` (individual update)
- **Removed:** `POST /{campaign_id}/steps/reorder`
- **Removed:** `GET /{campaign_id}/steps/{step_id}` (individual fetch)
- **Removed:** `DELETE /{campaign_id}/steps/{step_id}`
- **Changed:** `POST /{campaign_id}/steps/batch-update` → `PUT /{campaign_id}/steps`

### Data Flow

#### Local Editing
1. User edits content/delay → Updates localStorage immediately
2. UI shows changes instantly (no loading states)
3. Changes marked as `needsSync: true`

#### Sync on Continue
1. Frontend sends sorted steps array (by `createdAt`)
2. Backend replaces all steps with new data
3. Backend rebuilds edges: `step[0] → step[1] → step[2]`
4. Frontend marks steps as synced

#### Edge Resolution
- **Frontend sends:** Steps with timing data in edges (no targetStepIds)
- **Backend creates:** Proper edges with database-generated IDs
- **Result:** Linear sequence with preserved delays

### Ordering Strategy

#### Why createdAt Sorting Works
- Steps created sequentially (Step 1, then Step 2, then Step 3)
- `createdAt` timestamps maintain this order naturally
- No reordering UI currently exists
- Simple and reliable for linear sequences

#### Future Considerations
If step reordering becomes needed:
- Add `stepOrder` field to database/frontend
- Implement drag-and-drop reordering
- Maintain `stepOrder` during add/delete operations

## Testing the Implementation

### Prerequisites
1. Backend container restarted to pick up route changes
2. Frontend rebuilt to include store changes

### Test Scenarios
1. **Create new campaign with multiple steps**
2. **Edit step content** - should save locally immediately
3. **Change step delays** - should update locally
4. **Add new step** - should appear immediately
5. **Delete step** - should remove immediately
6. **Click "Continue"** - should sync all changes to database
7. **Verify database** - edges should have proper IDs and timing

### Expected Behavior
- All UI changes happen instantly
- No "Save" buttons needed
- Single sync operation on continue
- Database shows proper edge relationships
- No temp IDs in final database

## Technical Decisions

### Why Not Frontend UUIDs?
**Considered:** Generate real UUIDs in frontend
**Rejected because:**
- Violates separation of concerns
- Requires frontend to know database ID format
- Potential collision risks
- Less maintainable

### Why Not Database ID Mapping?
**Considered:** Backend parses arbitrary edge graphs
**Rejected because:**
- Complex relationship resolution logic
- Error-prone ID mapping
- Overkill for linear sequences
- Harder to maintain

### Why Linear Timing Approach?
**Chosen:** Preserve timing, resolve relationships linearly
**Benefits:**
- Simple for current use case
- Future-proof for branching
- Database owns ID generation
- Preserves all timing data

## Migration Path

### From Old System
1. Remove individual step CRUD operations
2. Update frontend to use Zustand store
3. Change sync to batch replacement
4. Test edge rebuilding logic

### Future Extensions
- **Branching logic:** Extend edge rebuilding for conditional paths
- **Step reordering:** Add `stepOrder` field and UI controls
- **Offline sync:** Enhanced conflict resolution
- **Real-time collaboration:** Operational transforms

## Files Modified

### Frontend
- `src/stores/campaignStore.ts` - New Zustand store
- `src/components/email-editor/hooks/useEmailSteps.ts` - Updated for local-first
- `src/components/email-editor/EmailEditor.tsx` - Removed save buttons
- `src/components/email-editor/EmailEditorToolbar.tsx` - Removed save UI
- `src/lib/api/campaigns-backend.ts` - New batch endpoint

### Backend
- `ozl-backend/services/api/routers/steps.py` - Set-based replacement
- `oz-dev-dash/src/app/api/backend-proxy/campaigns/[id]/steps/route.ts` - New PUT route

## Performance Considerations

### Memory Usage
- LocalStorage stores complete campaign state
- Zustand provides efficient reactivity
- No memory leaks (proper cleanup)

### Network Efficiency
- Single batch request instead of multiple saves
- Reduced backend load
- Atomic operations

### User Experience
- Instant feedback for all interactions
- No loading states for local operations
- Predictable sync behavior

## Error Handling

### Sync Failures
- Local changes preserved if sync fails
- User can retry "Continue"
- Clear error messages

### Data Integrity
- Database transactions ensure consistency
- LocalStorage provides offline persistence
- Merge logic prevents data loss

## Conclusion

The local-first approach provides an excellent user experience while maintaining data integrity. The linear timing edge resolution strategy balances simplicity with extensibility, making it suitable for current needs while supporting future enhancements like branching logic.

**Key Achievement:** Users can now edit email campaigns with instant feedback, and all changes sync reliably to the database in a single operation.
