# Campaign API Backend Migration Plan

## Overview

This document outlines the plan to migrate campaign-related API routes from Next.js (Vercel) to a Python FastAPI backend service. The primary motivation is to avoid Vercel's API timeout limits (10 seconds on free plan) for long-running operations like email generation and campaign launch.

**Status**: Planning Phase  
**Last Updated**: 2025-01-XX  
**Related Docs**: 
- `campaign-system-implementation-summary.md` - Current implementation
- `email-campaign-system-implementation-plan.md` - Original plan

---

## Current State Analysis

### Architecture Overview

The current system consists of three components:

1. **Frontend (oz-dev-dash - Next.js)**
   - Campaign management UI
   - Email editor and preview
   - CSV import and recipient selection
   - Campaign status monitoring
   - Test email sending

2. **Backend (ozl-backend - Python worker)**
   - Python worker (`campaign-runner`) running on GCP VM
   - Polls database every 60 seconds
   - Sends emails via SparkPost API
   - Just-in-time AI content generation

3. **Database (Supabase/PostgreSQL)**
   - `campaigns` table: Campaign configuration
   - `email_queue` table: Individual emails to send
   - `campaign_recipients` table: Recipient selection for campaigns
   - `contacts` table: Contact database

### Current Flow

#### Phase 1: Campaign Creation
- Frontend: User creates campaign via `/api/campaigns` (POST)
- Stores campaign config in `campaigns` table
- Status: `draft`

#### Phase 2: Recipient Import & Staging
- Frontend: User uploads CSV or selects from database via `/api/campaigns/:id/generate` (POST)
- CSV parsing (PapaParse) - **TO BE REMOVED**
- Email validation
- Creates rows in `email_queue` with:
  - `status: 'staged'`
  - `body: ""` (empty - triggers JIT generation)
  - `metadata`: CSV row data
- Campaign status → `staged`

#### Phase 3: Campaign Launch
- Frontend: User launches campaign via `/api/campaigns/:id/launch` (POST)
- Fetches all `staged` emails
- Domain rotation: assigns `domain_index` (round-robin across 7+ domains)
- Scheduling: calculates `scheduled_for` timestamps
  - 3.5 min interval between same-domain emails
  - Working hours only (9am-5pm)
  - Cross-campaign domain coordination
- Updates `email_queue`:
  - `status: 'queued'`
  - `from_email`, `domain_index`, `scheduled_for`
- Campaign status → `scheduled`

#### Phase 4: Email Sending (Backend Worker)
- Backend: Python worker (`main.py`) runs continuously
- Polls every 60 seconds during working hours
- Fetches emails where `scheduled_for <= NOW()` and `status = 'queued'`
- For each email:
  - Locks row: `status → 'processing'`
  - If `body` is empty: Generates AI content, renders HTML/text
  - Sends via SparkPost API
  - Updates status: `sent` or `failed`
- Campaign status → `sending` → `completed`

### Problem Statement

1. **Vercel Timeout Limits**: Long-running operations (generate, launch) can exceed 10-second timeout
2. **CSV Parsing Overhead**: No longer needed - all contacts are in database
3. **Code Redundancy**: Multiple implementations of same logic (variable replacement, HTML generation, SparkPost calls)
4. **Progress Tracking**: No way to show progress for long-running operations

---

## Architecture Decisions

### 1. Service Naming: `api` instead of `campaign-api`

**Decision**: Create unified API service called `api` to allow future expansion.

**Rationale**:
- Scalable: Can add other API domains (contacts, listings, analytics)
- Single deployment: One API service to manage
- Shared infrastructure: Common auth, middleware, utilities
- Future-proof: Avoids creating many small services

**Structure**:
```
ozl-backend/
├── services/
│   ├── campaign-runner/     # Existing worker (keeps running)
│   └── api/                 # NEW: Unified API service
│       ├── main.py          # FastAPI app entry point
│       ├── routers/
│       │   ├── campaigns.py      # Campaign endpoints
│       │   ├── emails.py         # Email management
│       │   ├── recipients.py     # Recipient selection
│       │   └── [future: contacts.py, listings.py, analytics.py]
│       ├── middleware/
│       │   ├── auth.py           # Admin auth
│       │   └── cors.py           # CORS config
│       ├── shared/
│       │   ├── db.py             # Supabase client
│       │   ├── email.py          # Email utilities
│       │   └── scheduling.py     # Scheduling logic
│       └── tasks/
│           ├── generate.py       # Background: email generation
│           └── launch.py         # Background: campaign launch
```

### 2. Remove CSV Parsing

**Decision**: Remove all CSV parsing logic - only use database contacts.

**Rationale**:
- All contacts are already in `contacts` table
- No need for CSV upload functionality
- Simplifies code significantly
- Reduces attack surface

**Impact**:
- Remove CSV validation endpoint
- Simplify `/generate` endpoint to only use `campaign_recipients`
- Remove PapaParse dependency from backend

### 3. Long-Running Job Handling: Simplified Approach

**Decision**: Use `scheduled_for IS NULL` check instead of jobs table.

**Rationale**:
- No new tables needed
- Uses existing `scheduled_for` column
- Simple queries: `WHERE scheduled_for IS NULL`
- User controls refresh timing (manual refresh button)
- Clear states: staged vs queued

**Status Determination**:
- `scheduled_for IS NULL` = Staged but not queued (generation/launch in progress)
- `scheduled_for IS NOT NULL` = Queued and ready to send

**No Auto-Polling**: User clicks refresh button to check status.

### 4. Security: Next.js Proxy Layer

**Decision**: Use Next.js API routes as a proxy layer between frontend and FastAPI backend.

**Architecture**:
```
Frontend → Next.js Proxy (/api/backend-proxy/campaigns) → FastAPI Backend
```

**Rationale**:
- ✅ **Security**: Credentials never exposed to JavaScript (httpOnly cookies)
- ✅ **XSS Protection**: Even if malicious JS runs, it can't access auth credentials
- ✅ **No Timeout Risk**: Proxy just forwards requests, work happens in FastAPI background tasks
- ✅ **Future Flexibility**: Can add rate limiting, caching, logging at proxy layer
- ✅ **Best Practice**: Follows security best practices for credential handling

**Implementation**:
- Frontend calls `/api/backend-proxy/campaigns/*` routes (Next.js API routes)
- Proxy routes read `oz_admin_basic` httpOnly cookie server-side
- Proxy converts cookie to Basic auth header and forwards to FastAPI backend
- FastAPI backend receives requests with `Authorization: Basic ...` header
- Responses returned through proxy to frontend

**Tradeoffs**:
- ⚠️ Slight latency increase (~50-100ms per request)
- ⚠️ Reintroduces Next.js API routes (but only as thin proxies)
- ✅ Significantly better security posture

**Note**: This is a security enhancement that doesn't conflict with the core migration goals (avoiding timeouts, moving work to FastAPI).

---

## Migration Plan

### Phase 1: Backend API Service Setup

#### 1.1 Create FastAPI Service Structure

**Files to Create**:
- `ozl-backend/services/api/main.py` - FastAPI app
- `ozl-backend/services/api/pyproject.toml` - Dependencies
- `ozl-backend/services/api/Dockerfile` - Container config
- `ozl-backend/services/api/.env.example` - Environment variables

**Dependencies**:
```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "supabase>=2.0.0",
    "python-dotenv>=1.0.0",
    "pydantic>=2.0.0",
    "httpx>=0.25.0",
]
```

#### 1.2 Shared Utilities

**Files to Create**:
- `ozl-backend/services/api/shared/db.py` - Supabase client
- `ozl-backend/services/api/shared/email.py` - Email utilities (variable replacement, etc.)
- `ozl-backend/services/api/shared/scheduling.py` - Scheduling logic

**Files to Reuse from campaign-runner**:
- `email_renderer.py` - HTML/text generation
- `prompts.py` - AI prompt building
- `email_sender.py` - SparkPost integration (with modifications)

#### 1.3 Authentication Middleware

**File**: `ozl-backend/services/api/middleware/auth.py`

**Requirements**:
- Verify admin Basic auth from frontend
- Check against `admin_users` table
- Return admin user object for use in routes

**Note**: Authentication is handled via Next.js proxy routes (see Architecture Decision #4 below)

### Phase 2: Simple CRUD Routes (Synchronous)

These routes can move directly without background processing:

| Current Route | New Backend Route | Method | Notes |
|--------------|-------------------|--------|-------|
| `/api/campaigns` | `/api/v1/campaigns` | GET, POST | List/create campaigns |
| `/api/campaigns/:id` | `/api/v1/campaigns/{id}` | GET, PUT, DELETE | Single campaign |
| `/api/campaigns/:id/emails` | `/api/v1/campaigns/{id}/emails` | GET | List staged emails |
| `/api/campaigns/:id/emails/:emailId` | `/api/v1/campaigns/{id}/emails/{email_id}` | GET, PUT, DELETE | Single email |
| `/api/campaigns/:id/summary` | `/api/v1/campaigns/{id}/summary` | GET | Campaign stats |
| `/api/campaigns/status` | `/api/v1/campaigns/status` | GET | Global status |
| `/api/campaigns/domains` | `/api/v1/campaigns/domains` | GET | Domain config |
| `/api/campaigns/:id/recipients` | `/api/v1/campaigns/{id}/recipients` | GET, POST | Recipient selection |

**Implementation Priority**: High (can be done first)

### Phase 3: Long-Running Operations (Background Jobs)

These routes need background processing:

| Current Route | New Backend Route | Strategy |
|--------------|-------------------|----------|
| `/api/campaigns/:id/generate` | `/api/v1/campaigns/{id}/generate` | Background task + status check |
| `/api/campaigns/:id/launch` | `/api/v1/campaigns/{id}/launch` | Background task + status check |
| `/api/campaigns/:id/retry-failed` | `/api/v1/campaigns/{id}/retry-failed` | Background task + status check |

**Implementation Pattern**:
1. API endpoint returns immediately with "started" message
2. Background task processes in background
3. Frontend checks status via `/status` endpoint
4. Status determined by `scheduled_for IS NULL` check

### Phase 4: Quick Operations (Can Stay Synchronous)

| Current Route | New Backend Route | Notes |
|--------------|-------------------|-------|
| `/api/campaigns/:id/test-send` | `/api/v1/campaigns/{id}/test-send` | Fast (< 5s) |
| `/api/campaigns/:id/generate-subject` | `/api/v1/campaigns/{id}/generate-subject` | Fast (< 3s) |

**Implementation Priority**: Medium (can be done after CRUD routes)

### Phase 5: Status Check Endpoint

**New Route**: `/api/v1/campaigns/{id}/status`

**Purpose**: Check if generation/launch is in progress

**Logic**:
```python
# Count staged emails (scheduled_for IS NULL)
staged_count = COUNT(*) WHERE campaign_id = X AND scheduled_for IS NULL

# Count queued emails (scheduled_for IS NOT NULL)
queued_count = COUNT(*) WHERE campaign_id = X AND scheduled_for IS NOT NULL

# Determine status:
is_generating = campaign.status == 'draft' AND staged_count == 0
is_launching = campaign.status == 'staged' AND queued_count == 0
is_ready = campaign.status == 'staged' AND staged_count > 0
is_launched = campaign.status == 'scheduled' AND queued_count > 0
```

**Response**:
```json
{
  "campaign_status": "staged",
  "staged_count": 1500,
  "queued_count": 0,
  "total_recipients": 1500,
  "is_generating": false,
  "is_launching": false,
  "is_ready": true,
  "is_launched": false
}
```

---

## Implementation Details

### Backend: Generate Endpoint

```python
# services/api/routers/campaigns.py
@router.post("/{campaign_id}/generate")
async def generate_emails(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    admin_user: dict = Depends(verify_admin)
):
    """Start email generation - returns immediately."""
    supabase = get_supabase_admin()
    
    # Verify campaign exists
    campaign = supabase.table("campaigns").select("*").eq("id", campaign_id).single().execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.data["status"] not in ["draft", "staged"]:
        raise HTTPException(status_code=400, detail="Campaign must be draft or staged")
    
    # Start background task
    background_tasks.add_task(process_generate_task, campaign_id, supabase)
    
    return {
        "status": "started",
        "message": "Email generation started. Click refresh to check progress."
    }

async def process_generate_task(campaign_id: str, supabase: Client):
    """Background task - fetch recipients and stage emails."""
    try:
        # 1. Fetch recipients from campaign_recipients table
        # 2. Build email queue rows (with scheduled_for = NULL)
        # 3. Bulk insert into email_queue
        # 4. Update campaign status to 'staged'
        
        # On error: Delete partial inserts, keep campaign in 'draft'
    except Exception as e:
        # Handle error
        pass
```

### Backend: Launch Endpoint

```python
@router.post("/{campaign_id}/launch")
async def launch_campaign(
    campaign_id: str,
    request: LaunchRequest,
    background_tasks: BackgroundTasks,
    admin_user: dict = Depends(verify_admin)
):
    """Start campaign launch - returns immediately."""
    supabase = get_supabase_admin()
    
    # Verify campaign
    # Start background task
    background_tasks.add_task(process_launch_task, campaign_id, supabase, request)
    
    return {
        "status": "started",
        "message": "Campaign launch started. Click refresh to check progress."
    }

async def process_launch_task(campaign_id: str, supabase: Client, request: LaunchRequest):
    """Background task - set scheduled_for timestamps."""
    try:
        # 1. Fetch staged emails (scheduled_for IS NULL)
        # 2. Calculate scheduling with domain rotation
        # 3. Update emails with scheduled_for timestamps
        # 4. Update campaign status to 'scheduled'
    except Exception as e:
        # Handle error
        pass
```

### Frontend: Status Hook

```typescript
// src/hooks/useCampaignStatus.ts
export function useCampaignStatus(campaignId: string) {
  const [status, setStatus] = useState<CampaignStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/campaigns/${campaignId}/status`,
        { headers: await getAuthHeaders() }
      );
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [campaignId]);

  return { status, refresh, isLoading };
}
```

### Frontend: Status Component

```typescript
// src/components/campaign/CampaignStatus.tsx
export function CampaignStatus({ campaignId }: { campaignId: string }) {
  const { status, refresh, isLoading } = useCampaignStatus(campaignId);

  return (
    <div>
      {/* Refresh Button */}
      <button onClick={refresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : '🔄 Refresh'}
      </button>

      {/* Status Indicators */}
      {status?.is_generating && (
        <div>⏳ Generating emails... ({status.staged_count} staged)</div>
      )}
      
      {status?.is_launching && (
        <div>⏳ Scheduling emails... ({status.queued_count} queued)</div>
      )}

      {/* Stats */}
      <div>
        <div>Staged: {status?.staged_count} / {status?.total_recipients}</div>
        <div>Queued: {status?.queued_count} / {status?.total_recipients}</div>
      </div>
    </div>
  );
}
```

### Frontend: API Client Updates

**Proxy-Based Approach** (Implemented):

```typescript
// src/lib/api/campaigns-backend.ts
// Uses Next.js proxy routes - no auth headers needed client-side
const PROXY_BASE = '/api/backend-proxy/campaigns';

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch(PROXY_BASE);
  if (!response.ok) throw new Error('Failed to fetch campaigns');
  return response.json();
}

export async function generateEmails(campaignId: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${PROXY_BASE}/${campaignId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ use_database_recipients: true }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to start generation');
  }
  return response.json();
}

export async function launchCampaign(
  campaignId: string,
  options?: { all?: boolean; emailIds?: string[] }
): Promise<{ status: string; message: string }> {
  const response = await fetch(`${PROXY_BASE}/${campaignId}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || { all: true }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to start launch');
  }
  return response.json();
}
```

**Proxy Route Implementation**:

```typescript
// src/app/api/backend-proxy/campaigns/route.ts
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend('/api/v1/campaigns', { method: 'GET' })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  return proxyToBackend('/api/v1/campaigns', { method: 'POST', body })
}
```

**Proxy Helper**:

```typescript
// src/lib/api/backend-proxy.ts
import { readBasicAuthCookie } from '@/lib/admin/auth'

export async function proxyToBackend(path: string, options: any): Promise<Response> {
  const creds = await readBasicAuthCookie()
  if (!creds) {
    return new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401 })
  }
  
  const basic = Buffer.from(`${creds.email}:${creds.password}`).toString('base64')
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`
  
  return fetch(backendUrl, {
    ...options,
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
```

---

## Code Redundancy Cleanup

### High Priority Redundancies

1. **Variable Replacement Logic** (8+ locations)
   - Extract to `shared/email.py` → `replace_variables()`
   - Use in all routers and tasks

2. **SparkPost API Calls** (3 implementations)
   - Consolidate to shared SparkPost client
   - Reuse from `campaign-runner/email_sender.py` with modifications

### Medium Priority Redundancies

3. **Email HTML Generation** (2 implementations)
   - Backend: Use `email_renderer.py` from campaign-runner
   - Frontend: Keep for preview only, or call backend API

4. **Prompt Building Logic** (2 implementations)
   - Backend: Use `prompts.py` from campaign-runner
   - Frontend: Remove, use backend API for test sends

5. **Scheduling Constants** (3 files)
   - Extract to `shared/scheduling.py`
   - Single source of truth

### Low Priority Redundancies

6. **Domain Configuration** (2 files)
   - Move to database or shared config
   - Or keep in backend only

---

## Database Changes

### No New Tables Required

The simplified approach uses existing tables:
- `campaigns` - Campaign configuration
- `email_queue` - Email records (uses `scheduled_for` column)
- `campaign_recipients` - Recipient selection
- `contacts` - Contact database

### Status Determination Logic

```sql
-- Check if generation is in progress
SELECT COUNT(*) FROM email_queue 
WHERE campaign_id = $1 AND scheduled_for IS NULL;

-- Check if launch is in progress  
SELECT COUNT(*) FROM email_queue
WHERE campaign_id = $1 AND scheduled_for IS NOT NULL;

-- Campaign status mapping:
-- 'draft' + staged_count = 0 → Generating
-- 'staged' + staged_count > 0 → Ready to launch
-- 'staged' + queued_count = 0 → Launching
-- 'scheduled' + queued_count > 0 → Launched
```

---

## Deployment Plan

### Backend API Service

**Deployment Options**:
1. **GCP Cloud Run** (Recommended)
   - Serverless, auto-scaling
   - Pay per request
   - Easy deployment

2. **GCP VM** (Same as worker)
   - Run alongside campaign-runner
   - More control
   - Fixed cost

3. **Railway/Render** (Alternative)
   - Simple deployment
   - Good for development

**Environment Variables**:
```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SPARKPOST_API_KEY=...
GROQ_API_KEY=...
FRONTEND_URL=https://oz-dev-dash-ten.vercel.app
TIMEZONE=America/Los_Angeles
```

### Frontend Updates

**Environment Variables**:
```bash
NEXT_PUBLIC_BACKEND_API_URL=https://api.yourdomain.com
```

**Changes Required**:
- Update API client to point to backend
- Add status check endpoint calls
- Add refresh button to campaign status component
- Remove CSV upload UI (if present)

---

## Migration Checklist

### Phase 1: Backend Setup
- [ ] Create `services/api/` directory structure
- [ ] Set up FastAPI app with CORS
- [ ] Create authentication middleware
- [ ] Set up shared utilities (db, email, scheduling)
- [ ] Create Dockerfile and deployment config

### Phase 2: Simple Routes
- [ ] Move `/api/campaigns` (GET, POST)
- [ ] Move `/api/campaigns/:id` (GET, PUT, DELETE)
- [ ] Move `/api/campaigns/:id/emails` (GET)
- [ ] Move `/api/campaigns/:id/summary` (GET)
- [ ] Move `/api/campaigns/status` (GET)
- [ ] Move `/api/campaigns/domains` (GET)
- [ ] Move `/api/campaigns/:id/recipients` (GET, POST)
- [ ] Update frontend API client

### Phase 3: Background Jobs
- [ ] Implement `/generate` endpoint with background task
- [ ] Implement `/launch` endpoint with background task
- [ ] Implement `/retry-failed` endpoint with background task
- [ ] Create `/status` endpoint for progress checking
- [ ] Test background task execution

### Phase 4: Quick Operations
- [ ] Move `/test-send` endpoint
- [ ] Move `/generate-subject` endpoint
- [ ] Update frontend to use new endpoints

### Phase 5: Frontend Updates
- [ ] Create `useCampaignStatus` hook
- [ ] Create `CampaignStatus` component with refresh button
- [ ] Update campaign editor to use new API
- [ ] Remove CSV upload UI
- [ ] Update all API calls to use backend

### Phase 6: Cleanup
- [ ] Remove old Next.js API routes
- [ ] Remove CSV validation endpoint
- [ ] Remove PapaParse dependency
- [ ] Consolidate redundant code
- [ ] Update documentation
- [ ] Test end-to-end

---

## Testing Strategy

### Backend Testing
- Unit tests for shared utilities
- Integration tests for API endpoints
- Background task testing
- Error handling tests

### Frontend Testing
- API client tests
- Status hook tests
- Component tests
- End-to-end flow tests

### Integration Testing
- Full campaign creation → generation → launch flow
- Status checking at each stage
- Error scenarios
- Large batch processing (1000+ emails)

---

## Rollback Plan

If issues arise:
1. Keep old Next.js routes temporarily
2. Use feature flag to switch between old/new API
3. Monitor error rates
4. Rollback by switching feature flag

---

## Future Enhancements

### Potential Additions (Not in Scope)
- WebSocket/SSE for real-time updates (if needed)
- Job cancellation
- Retry mechanisms
- Detailed progress tracking (if needed)
- Email preview API endpoint

---

## Questions & Decisions Log

### Decisions Made
1. ✅ Use `api` service name (not `campaign-api`)
2. ✅ Remove CSV parsing entirely
3. ✅ Use `scheduled_for IS NULL` for status checking
4. ✅ Manual refresh (no auto-polling)
5. ✅ Background tasks for long-running operations
6. ✅ **Next.js proxy layer for security** (credentials never exposed to JavaScript)

### Open Questions
- [ ] Deployment platform choice (Cloud Run vs VM)
- [ ] Authentication token format (JWT vs Supabase session)
- [ ] Error notification strategy (toast vs inline)
- [ ] Rate limiting needs

---

## References

- Current Implementation: `campaign-system-implementation-summary.md`
- Original Plan: `email-campaign-system-implementation-plan.md`
- Backend Worker: `ozl-backend/services/campaign-runner/`
- Frontend Routes: `oz-dev-dash/src/app/api/campaigns/`

---

## Notes

- This plan prioritizes simplicity over complex job tracking
- User experience: Manual refresh gives users control
- Scalability: Background tasks can handle thousands of emails
- Maintainability: Less code, fewer moving parts
- Future-proof: Easy to add features later if needed

