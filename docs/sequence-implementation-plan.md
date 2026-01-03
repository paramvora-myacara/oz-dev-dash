# Email Sequences Infrastructure - Design Document

## Problem Statement

Currently, the OZL outreach system only supports **one-time campaigns**. The goal is to build **multi-step email sequences** that:

1. Send a series of follow-up emails over time (e.g., Email 1 → wait 3 days → Email 2 → wait 4 days → Email 3)
2. Automatically stop sequences when a recipient **replies** (exit condition)
3. Respect existing suppression rules (unsubscribes, bounces, spam complaints)
4. Allow manual pausing/resuming at the sequence and contact level

---

## Key Architecture Decisions

### Decision 1: Unified Campaign/Sequence Model vs Separate Tables

> **User Question**: "Walk me through the tradeoffs - a campaign is technically a one-step sequence"

#### Option A: Unified Model (RECOMMENDED)

**Approach**: Extend `campaigns` table with sequence capabilities. A campaign with 1 step = current behavior. A campaign with multiple steps = sequence.

```sql
-- Extend campaigns table
ALTER TABLE campaigns ADD COLUMN is_sequence BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN exit_conditions JSONB DEFAULT '{"reply": true, "unsubscribe": true, "bounce": true, "spam_complaint": true}';

-- New table for steps (campaigns without steps behave as before)
CREATE TABLE campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  subject JSONB,
  sections JSONB,
  UNIQUE(campaign_id, step_order)
);
```

| Pros | Cons |
|------|------|
| ✅ Centralized logic - one runner handles both | ⚠️ Migration needed for existing campaigns |
| ✅ Unified analytics and reporting | ⚠️ Slightly more complex campaign model |
| ✅ Existing campaign UI patterns reusable | |
| ✅ `campaign_recipients` reused for enrollments | |
| ✅ Future-proof (sequences ARE campaigns) | |

**Migration Strategy**:
```sql
-- Existing campaigns: is_sequence = FALSE, no steps
-- They continue to work exactly as before
UPDATE campaigns SET is_sequence = FALSE WHERE is_sequence IS NULL;

-- Campaign runner checks: if (campaign.is_sequence) use step logic, else send immediately
```

#### Option B: Separate Tables

**Approach**: New `sequences`, `sequence_steps`, `sequence_enrollments` tables completely separate.

| Pros | Cons |
|------|------|
| ✅ No migration risk | ❌ Duplicated logic (two runners, two UIs) |
| ✅ Cleaner initial implementation | ❌ Two systems to maintain forever |
| | ❌ Analytics split between systems |
| | ❌ Contacts can be in both - confusion |

**Recommendation**: **Option A (Unified)** - A campaign IS a sequence with 1+ steps. This centralizes logic and avoids maintaining two parallel systems.

---

### Decision 2: "Dumb" vs "Smart" Campaign Runner

> **User Question**: "Keep campaign-runner dumb - only read DB and send. Shift scheduling complexity to API/other services."

This is an excellent architectural insight. Let's compare both approaches:

#### Option A: "Dumb" Campaign Runner (RECOMMENDED)

**Principle**: Campaign runner is a pure executor. It only knows how to:
1. Poll `email_queue` for emails where `scheduled_for <= NOW()`
2. Send via SparkPost
3. Mark as sent/failed

**All scheduling logic lives elsewhere**:
- **API** computes `scheduled_for` when launching campaigns
- **sequence-scheduler** (new lightweight cron job) handles step advancement
- **inbox-sync** marks replies and triggers exit conditions

```
┌─────────────────────────────────────────────────────────────┐
│                    DUMB CAMPAIGN RUNNER                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────────┐                   │
│  │ API Service │     │sequence-scheduler│                   │
│  │             │     │ (cron: every 1m) │                   │
│  │ - Launch    │     │                  │                   │
│  │ - Generate  │     │ - Check active   │                   │
│  │ - Schedule  │     │   enrollments    │                   │
│  │   step 1    │     │ - Queue next     │                   │
│  │             │     │   step emails    │                   │
│  └──────┬──────┘     └────────┬─────────┘                   │
│         │                     │                             │
│         ▼                     ▼                             │
│  ┌────────────────────────────────────────┐                 │
│  │            email_queue                 │                 │
│  │  (scheduled_for, step_id, etc.)        │                 │
│  └───────────────────┬────────────────────┘                 │
│                      │                                      │
│                      ▼                                      │
│  ┌────────────────────────────────────────┐                 │
│  │         campaign-runner (DUMB)         │                 │
│  │                                         │                 │
│  │  while True:                           │                 │
│  │    emails = get_due_emails()           │                 │
│  │    for email in emails:                │                 │
│  │      send(email)                       │                 │
│  │      mark_sent(email)                  │                 │
│  │    sleep(60)                           │                 │
│  └────────────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| ✅ Simple, single-purpose, easy to debug | ⚠️ Need separate scheduler service/cron |
| ✅ Campaign runner changes only for sending bugs | ⚠️ More moving parts |
| ✅ Can scale sending independently | |
| ✅ Scheduling logic is testable in API | |
| ✅ No risk of campaign-runner breaking sequences | |

#### Option B: "Smart" Campaign Runner

**Principle**: Campaign runner handles both sending AND scheduling next steps.

```python
# After sending
if email.campaign.is_sequence:
    schedule_next_step(email)  # Calculates and queues next email
```

| Pros | Cons |
|------|------|
| ✅ Fewer services to manage | ❌ Mixing concerns (sending + scheduling) |
| ✅ Atomic: send + schedule in one transaction | ❌ Harder to test scheduling logic |
| | ❌ Campaign runner becomes critical path for sequences |
| | ❌ More complex, more can go wrong |

#### Recommendation: **Option A (Dumb Campaign Runner)**

**Implementation**:
1. **campaign-runner** stays dumb - only sends
2. **sequence-scheduler** (new) - lightweight Python task that:
   - Runs every 60 seconds (registered in `main.py` startup)
   - Finds recipients where Step 1 is sent and Step 2 is due
   - Queues the next step email to `email_queue`
   - Updates `current_step_id` and calculates `next_email_at`

---

### Decision 3: Inbox Sync - How It Works

> **User Clarification**: "Partners always use Reply All, so communications@ is always CC'd"

#### Updated Reply Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│              SIMPLIFIED REPLY DETECTION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario A: Prospect replies                               │
│  ─────────────────────────────                              │
│  [Prospect] ──reply──> [communications@ozlistings.com]      │
│                               │                             │
│                               ▼                             │
│                    [inbox-sync service]                     │
│                    detects reply, marks enrollment          │
│                                                             │
│  Scenario B: Partner replies (with Reply All)               │
│  ────────────────────────────────────────────               │
│  [partner@gmail.com] ──reply all──> [prospect]              │
│                                  └─> [communications@] (CC) │
│                                             │               │
│                                             ▼               │
│                                  [inbox-sync service]       │
│                                  sees the CC, detects reply │
│                                                             │
│  ✅ BOTH scenarios are automatically detected!              │
│  ✅ No manual "Mark as Replied" button needed              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Decision 4: Graph-First Schema

**Pure graph approach** allows for both linear sequences and complex branching.

```sql
CREATE TABLE campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT,
  subject JSONB NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  -- Format: [
  --   { "target_step_id": "uuid", "delay_days": 3, "delay_hours": 0, "condition": null }
  -- ]
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ADD COLUMN entry_step_id UUID REFERENCES campaign_steps(id);
```

---

### Decision 5: Dynamic Scheduling vs Pre-Scheduling

#### Decision: Dynamic Scheduling (Queue One Step at a Time)

Emails for future steps are calculated only when the previous step is sent.

**Why?**
1. **Clean exit handling**: No need to "hunt and delete" future emails if a person replies.
2. **Flexible edits**: Changes to Step 2 apply automatically to everyone who hasn't reached it yet.
3. **Capacity prediction**: We can still forecast by looking at `campaign_recipients.next_email_at`.

---

### Database Changes Implemented

```sql
-- Campaigns Table
ALTER TABLE campaigns 
  ADD COLUMN entry_step_id UUID REFERENCES campaign_steps(id),
  ADD COLUMN exit_conditions JSONB DEFAULT '{"reply": true, "unsubscribe": true, "bounce": true, "spamComplaint": true}';

-- Campaign Steps Table
CREATE TABLE campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT,
  subject JSONB NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Recipients Table
ALTER TABLE campaign_recipients
  ADD COLUMN current_step_id UUID REFERENCES campaign_steps(id),
  ADD COLUMN next_step_id UUID REFERENCES campaign_steps(id),
  ADD COLUMN next_email_at TIMESTAMPTZ,
  ADD COLUMN exit_reason TEXT,
  ADD COLUMN last_reply_message_id TEXT;

-- Email Queue Table
ALTER TABLE email_queue
  ADD COLUMN step_id UUID REFERENCES campaign_steps(id),
  ADD COLUMN sparkpost_message_id TEXT;
```

---

### Service Responsibility Matrix

| Service | Responsibility |
|---------|----------------|
| **Next.js UI** | CRUD for steps, activation/pausing, 7-day schedule visualization |
| **Python API** | CRUD endpoints, AI subject generation, 7-day schedule logic |
| **generate.py** | Initial staging (Step 1) logic, metadata setup |
| **followup_scheduler.py** | Background task monitoring sent emails and queuing next steps |
| **campaign-runner** | Pure execution (sending queued emails) |
| **webhooks.py** | Capture `sparkpost_message_id` on delivery, handle bounces/unsubs |
| **inbox-sync (future)** | Poll Gmail for replies, match to threads, trigger exit conditions |

---

### Scheduling Algorithm Details

1. **Domain spacing**: Follow-ups respect the 3.5-minute domain gap.
2. **Jitter**: 0-60 second random offset for natural sending patterns.
3. **Working Hours**: Follow-ups are adjusted to fall within the user's configured working hours.
4. **Projected Forecast**: The 7-day schedule looks at `next_email_at` to forecast future sequence load.

---

### Phase History & Progress

#### Phase 1: Database & Core API ✅
- Schema extensions for sequences.
- Step CRUD operations in Python backend.
- Next.js API proxy routes.

#### Phase 2: Email Editor Integration ✅
- Step-aware editing in `EmailEditor.tsx`.
- Auto-save persistence per step.
- Drag-and-drop step reordering logic.
- Mobile step navigation tab.

#### Phase 3: Dashboard & Visualization ✅
- Sequence orientation badges in campaign list.
- Projected follow-up counts in 7-day schedule forecast.

#### Phase 4: Follow-up Engine ✅
- `generate.py` sequence-aware staging.
- `followup_scheduler.py` background service implementation.
- Working hour and domain-aware follow-up queuing.

#### Phase 5: Inbox Sync (Next Stage) 🏗️
- Gmail API integration for reply detection.
- Threading logic via `sparkpost_message_id`.
- Automatic exit on reply.
