-- Function to get pending signups counts per caller
-- Uses the same aggregation logic as get_unique_prospect_phones to ensure consistency

CREATE OR REPLACE FUNCTION get_pending_signups_by_caller(
    p_last_days int DEFAULT 30
)
RETURNS TABLE (
    caller_name text,
    pending_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH PhoneStats AS (
        -- 1. First, get all phones and their aggregated stats
        SELECT
            pp.phone_number,
            -- Pick the representative 'best_id' using priority logic (SAME AS get_unique_prospect_phones)
            (ARRAY_AGG(pp.id ORDER BY
                CASE
                    WHEN pp.call_status IN ('do_not_call', 'rejected') THEN 100
                    WHEN pp.lockout_until > NOW() THEN 90
                    WHEN pp.call_status = 'pending_signup' THEN 80
                    WHEN pp.call_status = 'follow_up' THEN 70
                    WHEN pp.call_status = 'answered' THEN 60
                    WHEN pp.call_status = 'no_answer' THEN 50
                    WHEN pp.call_status = 'new' THEN 40
                    WHEN pp.call_status = 'closed' THEN 30
                    WHEN pp.call_status = 'invalid_number' THEN 10
                    ELSE 0
                END DESC,
                pp.follow_up_at ASC NULLS LAST,
                pp.last_called_at DESC NULLS LAST,
                pp.created_at DESC
            ))[1] as best_id
        FROM prospect_phones pp
        JOIN prospects p ON pp.prospect_id = p.id
        GROUP BY pp.phone_number
    ),
    UniquePhones AS (
        -- 2. Get the actual row for the best_id
        SELECT
             pp.id,
             pp.phone_number,
             pp.call_status,
             pp.last_called_by,
             pp.last_called_at
        FROM PhoneStats ps
        JOIN prospect_phones pp ON ps.best_id = pp.id
    )
    -- 3. Filter for pending_signup and group by caller
    SELECT
        up.last_called_by as caller_name,
        COUNT(*) as pending_count
    FROM UniquePhones up
    WHERE 
        up.call_status = 'pending_signup'
        AND up.last_called_by IS NOT NULL
        -- Optional: Filter by recent activity if needed, but for 'Current Status' usually we want all current pending.
        -- If we strictly want "Pending Signups generated in the last 30 days", we'd check last_called_at.
        -- But "Pending Signup" is a state, not an event. It usually means "Currently Pending".
        -- However, to match the leaderboard's "30 day performance" context, we might want to respect the time window.
        -- Let's filter by last_called_at to be consistent with "Activity in last 30 days".
        AND (p_last_days IS NULL OR up.last_called_at >= (NOW() - (p_last_days || ' days')::interval))
    GROUP BY up.last_called_by;
END;
$$;
