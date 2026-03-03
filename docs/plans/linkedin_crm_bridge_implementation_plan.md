# LinkedIn CRM Bridge — Implementation Plan

This plan connects the CRM `people` tables to the LinkedIn automation runner. It covers: a new queue table, DevDash API routes, a LinkedIn Outreach tab with message editing, a bulk action on PeopleTable, and rewiring the automation service in `ozl-backend` to read from the new queue instead of `prospect_calls`.

---

## Design Decisions (Locked In)

| Decision | Answer |
|---|---|
| Queue architecture | Fat queue row, dumb runner. The runner only reads/writes `linkedin_outreach_queue` + one status update on `linkedin_profiles`. |
| Message templates | Two: family office and developer. Selected by `people.tags` at insertion time. Stored in code. |
| Message editing | Users can edit the rendered message on queued items before the 6:30 PM run. |
| Sender accounts for auto-select | 20 per enabled account (Jeff, Todd). Configurable via env var. |
| Daily limit | Runner enforces — takes first 25 per sender at processing time. |
| Deduplication | Partial unique index on queue + query-time check at insertion. |
| Retry | Failed stays failed forever. Manual retry from UI only. Auto-select skips failed. |
| Dashboard | New "LinkedIn Outreach" tab in CRMDashboard. Sender sub-tabs (All / Jeff / Todd). Status-grouped sections. |
| API routes | Next.js API routes talking directly to Supabase (no Python backend). |
| Auto-select criteria | `people.tags` contains `family_office` or `developer`, `first_name IS NOT NULL`, `lead_status != 'do_not_contact'`, not already queued/sent. |
| Send timing | No "Send Now" — always waits for 6:30 PM cron. |
| Connection status sync | In TypeScript runner code, not a Postgres trigger. |

---

## Message Templates

**Family Office** (used when tags include `family_office`):
```
Hi {name} - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I'd love to hear your thoughts on OZ investing and share what I've learned as well.
```

**Developer** (used when tags include `developer`):
```
Hey {name}, I know that you have OZ projects in your pipeline and I wanted to reach out and share with you what we are doing to help other sponsors procure top investors, looking for OZ projects.
```

---

## Implementation Steps

### Step 1: Create `linkedin_outreach_queue` table (Supabase Migration)

**Repo:** `oz-dev-dash`
**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_linkedin_outreach_queue.sql` (use current timestamp)

```sql
-- LinkedIn Outreach Queue: bridge between CRM people and LinkedIn automation runner
CREATE TABLE IF NOT EXISTS linkedin_outreach_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who to reach out to
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    linkedin_profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

    -- Denormalized for the runner (runner only reads this table)
    linkedin_url TEXT NOT NULL,
    person_name TEXT,

    -- Pre-rendered message (editable before processing)
    message TEXT NOT NULL,

    -- Which LinkedIn account sends this
    sender_account TEXT NOT NULL,

    -- State machine: queued → processing → sent | failed
    status TEXT NOT NULL DEFAULT 'queued',
    error TEXT,

    -- Timestamps
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for the runner's primary query
CREATE INDEX idx_li_queue_status_sender
    ON linkedin_outreach_queue(status, sender_account);

-- Index for dedup checks and dashboard queries
CREATE INDEX idx_li_queue_person
    ON linkedin_outreach_queue(person_id);

-- Prevent double-queuing: only one active entry per person+profile
CREATE UNIQUE INDEX idx_li_queue_no_dupe_active
    ON linkedin_outreach_queue(person_id, linkedin_profile_id)
    WHERE status IN ('queued', 'processing');

-- Enable realtime for the dashboard
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'linkedin_outreach_queue'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE linkedin_outreach_queue;
    END IF;
END $$;
```

> **🧪 TEST CHECKPOINT:** Run `supabase db reset` or `supabase migration up` in your local Supabase project. Then open the Supabase dashboard (Table Editor) and confirm the `linkedin_outreach_queue` table exists with the correct columns. Try inserting a row manually and verify the partial unique index prevents a second `queued` row for the same person+profile pair.

---

### Step 2: Create the LinkedIn Queue API routes (DevDash)

**Repo:** `oz-dev-dash`

#### 2a. GET + POST route

**File:** `src/app/api/crm/linkedin-queue/route.ts`

```typescript
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const FAMILY_OFFICE_TEMPLATE = `Hi {name} - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I'd love to hear your thoughts on OZ investing and share what I've learned as well.`;

const DEVELOPER_TEMPLATE = `Hey {name}, I know that you have OZ projects in your pipeline and I wanted to reach out and share with you what we are doing to help other sponsors procure top investors, looking for OZ projects.`;

function renderMessage(template: string, firstName: string): string {
    return template.replace(/\{name\}/g, firstName || '');
}

function selectTemplate(tags: string[]): string {
    if (tags.includes('developer')) return DEVELOPER_TEMPLATE;
    return FAMILY_OFFICE_TEMPLATE;
}

// GET /api/crm/linkedin-queue?status=queued&sender=Jeff
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sender = searchParams.get('sender');

    let query = supabase
        .from('linkedin_outreach_queue')
        .select(`
            *,
            people:person_id (
                id, first_name, last_name, display_name, tags,
                person_organizations ( organizations ( name ) )
            ),
            linkedin_profiles:linkedin_profile_id ( url, connection_status )
        `)
        .order('queued_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }
    if (sender && sender !== 'all') {
        query = query.eq('sender_account', sender);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

// POST /api/crm/linkedin-queue
// Body: { person_ids: string[], sender_account: string }
export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { person_ids, sender_account } = await request.json();

        if (!person_ids?.length || !sender_account) {
            return NextResponse.json(
                { error: 'person_ids and sender_account are required' },
                { status: 400 }
            );
        }

        // Fetch people with their LinkedIn profiles and tags
        const { data: people, error: fetchError } = await supabase
            .from('people')
            .select(`
                id, first_name, last_name, display_name, tags,
                person_linkedin ( linkedin_profiles ( id, url ) )
            `)
            .in('id', person_ids);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const queueRows: any[] = [];
        const skipped: { id: string; reason: string }[] = [];

        for (const person of (people || [])) {
            const linkedinLink = person.person_linkedin?.[0];
            const profile = linkedinLink?.linkedin_profiles;

            if (!profile?.url) {
                skipped.push({ id: person.id, reason: 'No LinkedIn profile' });
                continue;
            }
            if (!person.first_name) {
                skipped.push({ id: person.id, reason: 'No first name' });
                continue;
            }

            const template = selectTemplate(person.tags || []);
            const message = renderMessage(template, person.first_name);

            queueRows.push({
                person_id: person.id,
                linkedin_profile_id: profile.id,
                linkedin_url: profile.url,
                person_name: person.display_name || person.first_name,
                message,
                sender_account,
                status: 'queued',
            });
        }

        if (queueRows.length === 0) {
            return NextResponse.json({ queued: 0, skipped }, { status: 200 });
        }

        // Insert — partial unique index will reject duplicates
        const { data: inserted, error: insertError } = await supabase
            .from('linkedin_outreach_queue')
            .insert(queueRows)
            .select();

        if (insertError) {
            // Handle unique constraint violations gracefully
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Some people are already queued', details: insertError.message },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            queued: inserted?.length || 0,
            skipped,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Invalid request' },
            { status: 400 }
        );
    }
}
```

#### 2b. PATCH route (edit message + retry)

**File:** `src/app/api/crm/linkedin-queue/[id]/route.ts`

```typescript
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/crm/linkedin-queue/[id]
// Body: { message?: string, status?: 'queued' } (status: 'queued' = retry)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const body = await request.json();
        const update: Record<string, any> = {};

        // Allow message editing only on queued items
        if (body.message !== undefined) {
            update.message = body.message;
        }

        // Retry: reset failed → queued
        if (body.status === 'queued') {
            update.status = 'queued';
            update.error = null;
            update.processed_at = null;
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('linkedin_outreach_queue')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Invalid request' },
            { status: 400 }
        );
    }
}

// DELETE /api/crm/linkedin-queue/[id] — remove from queue
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
        .from('linkedin_outreach_queue')
        .delete()
        .eq('id', id)
        .eq('status', 'queued'); // only allow deleting queued items

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
```

> **🧪 TEST CHECKPOINT:** Start the dev server (`npm run dev`). Use curl or Postman to test:
> 1. `POST /api/crm/linkedin-queue` with `{ "person_ids": ["<some-uuid>"], "sender_account": "Jeff" }` — verify it inserts a row and returns `{ queued: 1, skipped: [] }`. Check the Supabase table to confirm the rendered message contains the person's first name.
> 2. `GET /api/crm/linkedin-queue` — verify it returns the queued item with joined people/profile data.
> 3. `PATCH /api/crm/linkedin-queue/<id>` with `{ "message": "Edited message" }` — verify the message updates.
> 4. Post the same person again — verify it returns a 409 duplicate error.

---

### Step 3: Add "Queue for LinkedIn" bulk action to PeopleTable

**Repo:** `oz-dev-dash`
**File:** `src/app/admin/crm/components/PeopleTable.tsx`

Add the LinkedIn button next to the existing "New Campaign" button in the `bulkActions` block. This opens a confirmation dialog (not a full modal — the message is auto-generated, so no message editor needed at selection time).

**Changes to `PeopleTable.tsx`:**

Add import at top:
```typescript
import { Linkedin } from "lucide-react";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
```

Add state inside the component:
```typescript
const [showLinkedInConfirm, setShowLinkedInConfirm] = useState(false);
const [linkedInSender, setLinkedInSender] = useState(currentUser || 'Jeff');
const [linkedInLoading, setLinkedInLoading] = useState(false);
```

Add the queue handler:
```typescript
const handleQueueForLinkedIn = async () => {
    setLinkedInLoading(true);
    try {
        const res = await fetch('/api/crm/linkedin-queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                person_ids: selectedIds,
                sender_account: linkedInSender,
            }),
        });
        const result = await res.json();
        if (!res.ok) {
            alert(result.error || 'Failed to queue');
            return;
        }
        alert(`Queued ${result.queued} people for LinkedIn outreach.${result.skipped?.length ? ` Skipped ${result.skipped.length} (no LinkedIn profile or no first name).` : ''}`);
        tableState.setSelectedIds(new Set());
    } catch (err) {
        alert('Failed to queue for LinkedIn');
    } finally {
        setLinkedInLoading(false);
        setShowLinkedInConfirm(false);
    }
};
```

Replace the `bulkActions` definition to add the LinkedIn button:
```typescript
const bulkActions = (
    mode === 'campaign_selection' ? (
        <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white"
            onClick={() => onContinue?.(selectedIds)}>
            <Mail className="w-3 h-3 mr-1" /> Continue
        </Button>
    ) : (
        <>
            <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white"
                onClick={() => { setPendingContacts(selectedIds); router.push('/admin/campaigns/new'); }}>
                <Mail className="w-3 h-3 mr-1" /> New Campaign
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs ml-2 bg-white"
                onClick={() => setShowLinkedInConfirm(true)}>
                <Linkedin className="w-3 h-3 mr-1" /> Queue LinkedIn
            </Button>
        </>
    )
);
```

Add the confirmation dialog just before the closing `</CRMShell>`:
```tsx
<AlertDialog open={showLinkedInConfirm} onOpenChange={setShowLinkedInConfirm}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Queue {selectedIds.length} people for LinkedIn outreach?</AlertDialogTitle>
            <AlertDialogDescription>
                A connection request with a personalized message will be sent from the selected account during the next automation run (6:30 PM PT daily).
            </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-3">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Send from account</label>
            <Select value={linkedInSender} onValueChange={setLinkedInSender}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {['Jeff', 'Todd', 'Michael', 'Param', 'Aryan'].map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleQueueForLinkedIn} disabled={linkedInLoading}>
                {linkedInLoading ? 'Queuing...' : `Queue ${selectedIds.length} People`}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

> **🧪 TEST CHECKPOINT:** In the browser, go to the CRM People tab. Select a few people using checkboxes. Verify that a "Queue LinkedIn" button appears in the action bar next to "New Campaign". Click it, select a sender, confirm. Check the Supabase `linkedin_outreach_queue` table to see the rows. Verify the message is correctly rendered with the person's first name and the right template (family office vs developer based on tags).

---

### Step 4: Build the LinkedIn Outreach tab (DevDash)

**Repo:** `oz-dev-dash`
**File:** `src/app/admin/crm/components/LinkedInOutreachTab.tsx` (new file)

This is the main dashboard component. It uses shadcn Tabs for sender filtering and status-grouped sections.

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    RefreshCw, Check, AlertCircle, Clock, ExternalLink,
    Pencil, Trash2, RotateCcw, Linkedin
} from 'lucide-react';

interface QueueItem {
    id: string;
    person_id: string;
    linkedin_profile_id: string;
    linkedin_url: string;
    person_name: string;
    message: string;
    sender_account: string;
    status: string;
    error: string | null;
    queued_at: string;
    processed_at: string | null;
    people?: {
        display_name?: string;
        tags?: string[];
        person_organizations?: { organizations: { name: string } }[];
    };
}

interface LinkedInOutreachTabProps {
    currentUser: string | null;
}

export function LinkedInOutreachTab({ currentUser }: LinkedInOutreachTabProps) {
    const [items, setItems] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [senderFilter, setSenderFilter] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState('');

    const fetchQueue = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL('/api/crm/linkedin-queue', window.location.origin);
            if (senderFilter !== 'all') {
                url.searchParams.set('sender', senderFilter);
            }
            const res = await fetch(url.toString());
            if (res.ok) {
                const { data } = await res.json();
                setItems(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch LinkedIn queue:', err);
        } finally {
            setIsLoading(false);
        }
    }, [senderFilter]);

    useEffect(() => {
        fetchQueue();

        const supabase = createClient();
        const channel = supabase
            .channel('linkedin_queue_realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'linkedin_outreach_queue',
            }, () => fetchQueue())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchQueue]);

    const queued = items.filter(i => i.status === 'queued');
    const processing = items.filter(i => i.status === 'processing');
    const sent = items.filter(i => i.status === 'sent');
    const failed = items.filter(i => i.status === 'failed');

    const senderCounts = items.reduce((acc, item) => {
        acc[item.sender_account] = (acc[item.sender_account] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleSaveMessage = async (id: string) => {
        try {
            const res = await fetch(`/api/crm/linkedin-queue/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: editMessage }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchQueue();
            }
        } catch (err) {
            console.error('Failed to update message:', err);
        }
    };

    const handleRetry = async (id: string) => {
        try {
            await fetch(`/api/crm/linkedin-queue/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'queued' }),
            });
            fetchQueue();
        } catch (err) {
            console.error('Failed to retry:', err);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await fetch(`/api/crm/linkedin-queue/${id}`, { method: 'DELETE' });
            fetchQueue();
        } catch (err) {
            console.error('Failed to remove:', err);
        }
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    };

    const renderItem = (item: QueueItem) => {
        const orgName = item.people?.person_organizations?.[0]?.organizations?.name;
        const isEditing = editingId === item.id;

        return (
            <div key={item.id} className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{item.person_name}</h4>
                            {orgName && (
                                <span className="text-sm text-muted-foreground">{orgName}</span>
                            )}
                            <Badge variant="outline" className="text-[10px]">{item.sender_account}</Badge>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline truncate max-w-[250px]">
                                {item.linkedin_url.replace('https://www.linkedin.com/in/', '')}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                            <span>{formatTime(item.queued_at)}</span>
                        </div>

                        {/* Status line */}
                        <div className="mt-2 text-sm">
                            {item.status === 'queued' && (
                                <span className="text-amber-600 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Queued — sends at 6:30 PM PT
                                </span>
                            )}
                            {item.status === 'processing' && (
                                <span className="text-blue-600 font-medium flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                                </span>
                            )}
                            {item.status === 'sent' && (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Sent {item.processed_at ? formatTime(item.processed_at) : ''}
                                </span>
                            )}
                            {item.status === 'failed' && (
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Failed: {item.error || 'Unknown'}
                                </span>
                            )}
                        </div>

                        {/* Message (editable for queued items) */}
                        {isEditing ? (
                            <div className="mt-3">
                                <Textarea value={editMessage}
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    rows={4} className="text-sm" />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => handleSaveMessage(item.id)}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 italic">
                                &ldquo;{item.message}&rdquo;
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 ml-4">
                        {item.status === 'queued' && (
                            <>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                                    onClick={() => { setEditingId(item.id); setEditMessage(item.message); }}>
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => handleRemove(item.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </>
                        )}
                        {item.status === 'failed' && (
                            <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)}>
                                <RotateCcw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg">LinkedIn Outreach</h3>
                    <span className="text-xs text-muted-foreground ml-2">Runner: 6:30 PM PT daily</span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Sender filter tabs */}
            <Tabs value={senderFilter} onValueChange={setSenderFilter}>
                <TabsList>
                    <TabsTrigger value="all">All ({items.length})</TabsTrigger>
                    {Object.entries(senderCounts).map(([sender, count]) => (
                        <TabsTrigger key={sender} value={sender}>
                            {sender} ({count})
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 text-center">
                    <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Queued</div>
                    <div className="text-2xl font-black text-amber-700">{queued.length}</div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-center">
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Processing</div>
                    <div className="text-2xl font-black text-blue-700">{processing.length}</div>
                </div>
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 text-center">
                    <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Sent</div>
                    <div className="text-2xl font-black text-green-700">{sent.length}</div>
                </div>
                <div className={`rounded-xl p-4 border text-center ${failed.length > 0 ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${failed.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>Failed</div>
                    <div className={`text-2xl font-black ${failed.length > 0 ? 'text-red-700' : 'text-slate-400'}`}>{failed.length}</div>
                </div>
            </div>

            {/* Queued section */}
            <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Queued for Tonight
                    <Badge variant="secondary">{queued.length + processing.length}</Badge>
                </h3>
                {(queued.length + processing.length) === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                        No pending outreach. Select people from the People tab to queue them.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {processing.map(renderItem)}
                        {queued.map(renderItem)}
                    </div>
                )}
            </div>

            {/* Sent section */}
            {sent.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        Sent <Badge variant="secondary">{sent.length}</Badge>
                    </h3>
                    <div className="grid gap-2 opacity-80">
                        {sent.slice(0, 20).map(renderItem)}
                    </div>
                </div>
            )}

            {/* Failed section */}
            {failed.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                        Failed <Badge variant="destructive">{failed.length}</Badge>
                    </h3>
                    <div className="grid gap-3">
                        {failed.map(renderItem)}
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

### Step 5: Wire the LinkedIn Outreach tab into CRMDashboard

**Repo:** `oz-dev-dash`
**File:** `src/app/admin/crm/components/CRMDashboard.tsx`

Add import at top:
```typescript
import { LinkedInOutreachTab } from './LinkedInOutreachTab';
```

Add the tab trigger inside `<TabsList>` (after "Email Campaigns"):
```tsx
<TabsTrigger value="linkedin">LinkedIn Outreach</TabsTrigger>
```

Add the tab content (after the campaigns `TabsContent`):
```tsx
<TabsContent value="linkedin" className="w-full">
    <LinkedInOutreachTab currentUser={currentUser} />
</TabsContent>
```

> **🧪 TEST CHECKPOINT:** This is the big frontend integration test. In the browser:
> 1. Go to CRM → People tab. Filter by "has LinkedIn". Select 3-5 people.
> 2. Click "Queue LinkedIn" → pick a sender → confirm.
> 3. Switch to the "LinkedIn Outreach" tab. Verify the queued items appear with correct names, messages, and sender.
> 4. Click the edit (pencil) icon on a queued item. Change the message. Save. Verify it persists.
> 5. Click the trash icon to remove one. Verify it disappears.
> 6. Switch between sender tabs (All / Jeff / Todd). Verify filtering works.
> 7. Check that the realtime subscription works: open a second browser tab with Supabase dashboard, manually update a queue row's status → verify the DevDash updates without a manual refresh.

---

### Step 6: Rewire the LinkedIn automation runner (Backend)

**Repo:** `ozl-backend`

#### 6a. Add new types

**File:** `services/linkedin-automation/src/types/index.ts`

Add these types (keep the old ones for now — they won't be referenced):

```typescript
export interface LinkedInQueueItem {
    id: string;
    person_id: string;
    linkedin_profile_id: string;
    linkedin_url: string;
    person_name: string;
    message: string;
    sender_account: string;
    status: string;
    error: string | null;
    queued_at: string;
    processed_at: string | null;
}

export type QueueStatus = 'queued' | 'processing' | 'sent' | 'failed';
```

#### 6b. Add new database functions

**File:** `services/linkedin-automation/src/services/database.ts`

Add these functions (keep the old ones — they won't be called):

```typescript
import type { LinkedInQueueItem } from '../types';

/**
 * Get all queued LinkedIn outreach items, grouped by sender
 */
export async function getQueuedOutreach(): Promise<LinkedInQueueItem[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('linkedin_outreach_queue')
        .select('*')
        .eq('status', 'queued')
        .order('queued_at', { ascending: true });

    if (error) {
        console.error('[Supabase] Error fetching queued outreach:', error);
        throw error;
    }

    return (data as LinkedInQueueItem[]) || [];
}

/**
 * Update queue item status
 */
export async function updateQueueItemStatus(
    itemId: string,
    status: string,
    error?: string
): Promise<void> {
    const supabase = getSupabase();

    const updateData: Record<string, any> = { status };
    if (status === 'sent' || status === 'failed') {
        updateData.processed_at = new Date().toISOString();
    }
    if (error) {
        updateData.error = error;
    }

    const { error: updateError } = await supabase
        .from('linkedin_outreach_queue')
        .update(updateData)
        .eq('id', itemId);

    if (updateError) {
        console.error(`[Supabase] Error updating queue item ${itemId}:`, updateError);
        throw updateError;
    }
}

/**
 * Update linkedin_profiles.connection_status after successful send
 */
export async function updateConnectionStatus(
    profileId: string,
    status: string
): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('linkedin_profiles')
        .update({ connection_status: status })
        .eq('id', profileId);

    if (error) {
        console.error(`[Supabase] Error updating connection status for ${profileId}:`, error);
    }
}
```

#### 6c. Rewrite QueueService to use the new queue

**File:** `services/linkedin-automation/src/services/QueueService.ts`

Replace `runDailyConnectionBatch` with the new CRM-backed version:

```typescript
import { createBrowserSession, randomDelay } from '../config/browserbase';
import { sendConnectionRequest } from './LinkedInService';
import {
    getQueuedOutreach,
    updateQueueItemStatus,
    updateConnectionStatus,
} from './database';
import type { LinkedInQueueItem } from '../types';

const DAILY_LIMIT = 25;

function groupBySender(items: LinkedInQueueItem[]): Map<string, LinkedInQueueItem[]> {
    const grouped = new Map<string, LinkedInQueueItem[]>();
    for (const item of items) {
        const sender = item.sender_account;
        if (!grouped.has(sender)) {
            grouped.set(sender, []);
        }
        grouped.get(sender)!.push(item);
    }
    return grouped;
}

/**
 * Run daily connection batch — reads from linkedin_outreach_queue (CRM-backed)
 */
export async function runDailyConnectionBatch(): Promise<void> {
    console.log('[Connection Batch] Starting daily connection batch...');

    try {
        const queuedItems = await getQueuedOutreach();

        if (queuedItems.length === 0) {
            console.log('[Connection Batch] No queued outreach items found');
            return;
        }

        console.log(`[Connection Batch] Found ${queuedItems.length} total queued items`);

        const itemsBySender = groupBySender(queuedItems);

        console.log(`[Connection Batch] Spawning sessions for ${itemsBySender.size} senders`);

        await Promise.all(Array.from(itemsBySender.entries()).map(async ([sender, items]) => {
            const batch = items.slice(0, DAILY_LIMIT);
            console.log(`[Connection Batch] [${sender}] Processing ${batch.length} connections (limit: ${DAILY_LIMIT})`);

            if (batch.length === 0) return;

            let stagehand;
            try {
                stagehand = await createBrowserSession(sender);

                for (const item of batch) {
                    try {
                        await updateQueueItemStatus(item.id, 'processing');

                        console.log(`[Connection Batch] [${sender}] Sending to ${item.linkedin_url} (${item.person_name})`);
                        await sendConnectionRequest(stagehand, item.linkedin_url, item.message, false);

                        await updateQueueItemStatus(item.id, 'sent');
                        await updateConnectionStatus(item.linkedin_profile_id, 'pending');

                        console.log(`[Connection Batch] [${sender}] ✓ Sent for ${item.person_name}`);

                        await randomDelay(15000, 30000);

                    } catch (error) {
                        console.error(`[Connection Batch] [${sender}] ✗ Failed for ${item.person_name}:`, error);
                        await updateQueueItemStatus(
                            item.id,
                            'failed',
                            error instanceof Error ? error.message : 'Unknown error'
                        );
                    }
                }

            } catch (err) {
                console.error(`[Connection Batch] [${sender}] Session error:`, err);
            } finally {
                if (stagehand) {
                    await stagehand.close();
                    console.log(`[Connection Batch] [${sender}] Closed browser session`);
                }
            }
        }));

        console.log('[Connection Batch] Daily connection batch completed');

    } catch (error) {
        console.error('[Connection Batch] Batch failed:', error);
    }
}
```

> **🧪 TEST CHECKPOINT:** This can be tested without a real browser session by temporarily setting `dryRun = true` in the `sendConnectionRequest` call within QueueService (or by using `STAGEHAND_ENV=LOCAL` with a headed browser).
> 1. Insert a few test rows into `linkedin_outreach_queue` via the DevDash UI or Supabase dashboard (status: `queued`, sender_account: your test account).
> 2. Run the LinkedIn automation service manually: `cd services/linkedin-automation && npx tsx src/index.ts` (or trigger the cron).
> 3. Watch the logs — verify it picks up items from `linkedin_outreach_queue`, groups by sender, processes them.
> 4. Check Supabase: queue items should be updated to `sent` (or `failed` in dry run), `processed_at` should be set, and `linkedin_profiles.connection_status` should be updated to `pending`.

---

### Step 7: Add auto-select cron to the LinkedIn automation service

**Repo:** `ozl-backend`

#### 7a. Add config for auto-select

**File:** `services/linkedin-automation/src/config/index.ts`

Add to the `ConfigSchema`:
```typescript
// Auto-select
AUTO_SELECT_ENABLED_ACCOUNTS: z.string().default('Jeff,Todd'),
AUTO_SELECT_CRON_SCHEDULE: z.string().default('0 9 * * *'), // 9 AM daily
AUTO_SELECT_LIMIT: z.coerce.number().default(20),
```

#### 7b. Add auto-select function

**File:** `services/linkedin-automation/src/services/AutoSelectService.ts` (new file)

```typescript
import { getSupabase } from './database';
import { getConfig } from '../config';

const FAMILY_OFFICE_TEMPLATE = `Hi {name} - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I'd love to hear your thoughts on OZ investing and share what I've learned as well.`;

const DEVELOPER_TEMPLATE = `Hey {name}, I know that you have OZ projects in your pipeline and I wanted to reach out and share with you what we are doing to help other sponsors procure top investors, looking for OZ projects.`;

function selectTemplate(tags: string[]): string {
    if (tags.includes('developer')) return DEVELOPER_TEMPLATE;
    return FAMILY_OFFICE_TEMPLATE;
}

function renderMessage(template: string, firstName: string): string {
    return template.replace(/\{name\}/g, firstName || '');
}

export async function runAutoSelect(): Promise<void> {
    const config = getConfig();
    const accounts = config.AUTO_SELECT_ENABLED_ACCOUNTS.split(',').map(s => s.trim());
    const limit = config.AUTO_SELECT_LIMIT;
    const supabase = getSupabase();

    console.log(`[Auto-Select] Running for accounts: ${accounts.join(', ')} (limit: ${limit} each)`);

    for (const account of accounts) {
        try {
            // Find eligible people: have LinkedIn, have first_name, tagged family_office or developer,
            // not do_not_contact, not already queued/processing/sent
            const { data: candidates, error } = await supabase.rpc('select_linkedin_candidates', {
                p_limit: limit,
                p_exclude_statuses: ['queued', 'processing', 'sent'],
                p_required_tags: ['family_office', 'developer'],
            });

            // Fallback if RPC doesn't exist yet: use a manual query
            // (Replace with RPC call once migration is in place)
            let people = candidates;
            if (error || !people) {
                console.warn('[Auto-Select] RPC failed, using fallback query:', error?.message);

                const { data: fallback } = await supabase
                    .from('people')
                    .select(`
                        id, first_name, last_name, display_name, tags,
                        person_linkedin ( linkedin_profiles ( id, url ) )
                    `)
                    .not('first_name', 'is', null)
                    .neq('lead_status', 'do_not_contact')
                    .or('tags.cs.{family_office},tags.cs.{developer}')
                    .not('id', 'in', `(SELECT person_id FROM linkedin_outreach_queue WHERE status IN ('queued','processing','sent'))`)
                    .limit(limit);

                people = fallback;
            }

            if (!people || people.length === 0) {
                console.log(`[Auto-Select] [${account}] No eligible candidates found`);
                continue;
            }

            const rows = [];
            for (const person of people) {
                const linkedinLink = person.person_linkedin?.[0];
                const profile = linkedinLink?.linkedin_profiles;
                if (!profile?.url || !person.first_name) continue;

                const template = selectTemplate(person.tags || []);
                const message = renderMessage(template, person.first_name);

                rows.push({
                    person_id: person.id,
                    linkedin_profile_id: profile.id,
                    linkedin_url: profile.url,
                    person_name: person.display_name || person.first_name,
                    message,
                    sender_account: account,
                    status: 'queued',
                });
            }

            if (rows.length === 0) {
                console.log(`[Auto-Select] [${account}] No valid candidates after filtering`);
                continue;
            }

            const { data: inserted, error: insertError } = await supabase
                .from('linkedin_outreach_queue')
                .upsert(rows, { onConflict: 'person_id,linkedin_profile_id', ignoreDuplicates: true })
                .select();

            console.log(`[Auto-Select] [${account}] Queued ${inserted?.length || 0} people`);
            if (insertError) {
                console.error(`[Auto-Select] [${account}] Insert error:`, insertError.message);
            }

        } catch (err) {
            console.error(`[Auto-Select] [${account}] Error:`, err);
        }
    }

    console.log('[Auto-Select] Auto-selection complete');
}
```

#### 7c. Wire auto-select into the cron schedule

**File:** `services/linkedin-automation/src/index.ts`

Add import:
```typescript
import { runAutoSelect } from './services/AutoSelectService';
```

Add this cron schedule after the connection batch schedule:
```typescript
// Schedule auto-selection (morning)
console.log('📅 Scheduling Auto-Select for:', config.AUTO_SELECT_CRON_SCHEDULE);
cron.schedule(config.AUTO_SELECT_CRON_SCHEDULE, async () => {
    console.log('');
    console.log('🎯 [CRON] Auto-select triggered');
    try {
        await runAutoSelect();
    } catch (error) {
        console.error('[CRON] Auto-select error:', error);
    }
}, {
    timezone: config.TIMEZONE,
});
```

Update the startup log to show the auto-select schedule:
```typescript
console.log(`  📅 Auto-Select:       ${config.AUTO_SELECT_CRON_SCHEDULE}`);
```

> **🧪 TEST CHECKPOINT:** Test the auto-selection independently:
> 1. Make sure you have a few people in the CRM with `tags` containing `family_office` or `developer`, with LinkedIn profiles linked, and `first_name` set.
> 2. Temporarily change `AUTO_SELECT_CRON_SCHEDULE` to run in 1 minute, or call `runAutoSelect()` directly from a test script.
> 3. Run the service. Watch the logs for `[Auto-Select]` output.
> 4. Check `linkedin_outreach_queue` in Supabase — 20 rows per enabled account should appear with correctly rendered messages.
> 5. Verify that running auto-select again does NOT create duplicates (the partial unique index prevents it).

---

### Step 8: Final integration test

> **🧪 FULL END-TO-END TEST:**
>
> 1. **Manual flow:** Go to CRM → People → filter by LinkedIn + family_office tag → select 5 people → click "Queue LinkedIn" → pick sender "Jeff" → confirm. Switch to LinkedIn Outreach tab. Verify 5 queued items. Edit one message. Remove one. Verify 4 remain.
>
> 2. **Auto-select flow:** Trigger the auto-select (either via cron or manual invocation). Verify 20 new items appear per enabled account in the LinkedIn Outreach tab. Verify no duplicates with the manually queued items.
>
> 3. **Runner flow (dry run):** Set `dryRun = true` in QueueService or use local Stagehand. Trigger the connection batch. Verify items move from `queued` → `processing` → `sent`/`failed`. Verify `linkedin_profiles.connection_status` is updated to `pending` for sent items. Verify the DevDash tab updates in realtime.
>
> 4. **Runner flow (live):** With a valid LinkedIn cookie, queue 1-2 test profiles. Run the connection batch. Verify actual LinkedIn connection requests are sent. Check the LinkedIn account to confirm the invite appears with the correct message.
>
> 5. **Edge cases:**
>    - Queue a person without a LinkedIn profile → verify they're skipped with reason.
>    - Queue a person without a first_name → verify they're skipped.
>    - Queue the same person twice → verify 409 duplicate error.
>    - Retry a failed item from the UI → verify it moves back to `queued`.

---

## File Summary

### oz-dev-dash (DevDash)

| File | Action | Step |
|---|---|---|
| `supabase/migrations/YYYYMMDD_create_linkedin_outreach_queue.sql` | Create | 1 |
| `src/app/api/crm/linkedin-queue/route.ts` | Create | 2a |
| `src/app/api/crm/linkedin-queue/[id]/route.ts` | Create | 2b |
| `src/app/admin/crm/components/PeopleTable.tsx` | Modify | 3 |
| `src/app/admin/crm/components/LinkedInOutreachTab.tsx` | Create | 4 |
| `src/app/admin/crm/components/CRMDashboard.tsx` | Modify | 5 |

### ozl-backend (LinkedIn Automation)

| File | Action | Step |
|---|---|---|
| `services/linkedin-automation/src/types/index.ts` | Modify (add types) | 6a |
| `services/linkedin-automation/src/services/database.ts` | Modify (add functions) | 6b |
| `services/linkedin-automation/src/services/QueueService.ts` | Rewrite | 6c |
| `services/linkedin-automation/src/config/index.ts` | Modify (add config) | 7a |
| `services/linkedin-automation/src/services/AutoSelectService.ts` | Create | 7b |
| `services/linkedin-automation/src/index.ts` | Modify (add cron) | 7c |

### Files NOT changed

| File | Why |
|---|---|
| `services/linkedin-automation/src/services/LinkedInService.ts` | `sendConnectionRequest()` already has the right signature |
| `services/linkedin-automation/src/config/browserbase.ts` | `createBrowserSession()` already takes caller name |
| `services/campaign-runner/*` | Email campaign runner is independent |
