# Frontend Migration to Backend API

## Status

**Partially Complete** - The backend API client (`campaigns-backend.ts`) has been created, but the frontend pages are still using the old API client (`campaigns.ts`).

## Required Environment Variable

Add this to your `.env.local` file in `oz-dev-dash`:

```bash
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```

For production, set it to your deployed backend URL:
```bash
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.com
```

## Migration Steps

### 1. Update Campaign List Page

**File:** `src/app/admin/campaigns/page.tsx`

**Change:**
```typescript
// OLD:
import { getCampaigns, deleteCampaign } from '@/lib/api/campaigns'

// NEW:
import { getCampaigns, deleteCampaign } from '@/lib/api/campaigns-backend'
```

Also update `fetchCampaignStatus` to use:
```typescript
import { getGlobalStatus } from '@/lib/api/campaigns-backend'
```

### 2. Update Campaign Edit Page

**File:** `src/app/admin/campaigns/[id]/page.tsx`

**Change:**
```typescript
// OLD:
import { getCampaign, updateCampaign, generateEmails, getStagedEmails, launchCampaign, sendTestEmail, regenerateEmail, getCampaignSampleRecipients, type GenerateProgress } from '@/lib/api/campaigns'

// NEW:
import { getCampaign, updateCampaign, generateEmails, getStagedEmails, launchCampaign, sendTestEmail, regenerateEmail, getCampaignSampleRecipients } from '@/lib/api/campaigns-backend'
```

**Note:** `GenerateProgress` type is no longer used since background jobs return immediately. Use `useCampaignStatus` hook instead.

### 3. Update Campaign Creation Page

**File:** `src/app/admin/campaigns/new/page.tsx`

**Change:**
```typescript
// OLD:
import { createCampaign } from '@/lib/api/campaigns'

// NEW:
import { createCampaign } from '@/lib/api/campaigns-backend'
```

### 4. Add Status Polling

For pages that trigger background jobs (generate, launch), add status polling:

```typescript
import { useCampaignStatus } from '@/hooks/useCampaignStatus'

// In component:
const { status, refresh, isLoading } = useCampaignStatus(campaignId)

// After calling generateEmails or launchCampaign:
// Show refresh button and poll status
```

## API Differences

### Background Jobs

**Old API:** Returned progress via SSE stream
**New API:** Returns immediately with `{ status: "started", message: "..." }`

**Migration:**
- Remove SSE progress handling
- Use `useCampaignStatus` hook to poll status
- Show refresh button for manual status updates

### Error Handling

**Old API:** Errors in response body
**New API:** Errors in `{ detail: "..." }` format

The new client handles this automatically.

## Testing Checklist

- [ ] Set `NEXT_PUBLIC_BACKEND_API_URL` in `.env.local`
- [ ] Update imports in campaign pages
- [ ] Test campaign list page loads
- [ ] Test campaign creation
- [ ] Test campaign editing
- [ ] Test email generation (with status polling)
- [ ] Test campaign launch (with status polling)
- [ ] Test test email sending
- [ ] Test subject generation
- [ ] Verify error handling works

## Rollback

If issues arise, revert imports back to `@/lib/api/campaigns` to use the old Next.js API routes.

