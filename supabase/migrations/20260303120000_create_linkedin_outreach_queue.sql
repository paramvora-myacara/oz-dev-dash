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
