-- Create RPC function to get unique prospect phones with aggregation and filtering
-- Drop checks to allow easy updates during dev
DROP FUNCTION IF EXISTS get_unique_prospect_phones;

CREATE OR REPLACE FUNCTION get_unique_prospect_phones(
    p_page int DEFAULT 1,
    p_limit int DEFAULT 50,
    p_search text DEFAULT NULL,
    p_state_filter text DEFAULT NULL,
    p_status_filters text[] DEFAULT NULL,
    p_role_filters text[] DEFAULT NULL,
    p_min_properties int DEFAULT 1,
    p_max_properties int DEFAULT NULL,
    p_sort_by text DEFAULT 'property_count',
    p_sort_dir text DEFAULT 'DESC'
)
RETURNS TABLE (
    id uuid,
    phone_number text,
    property_count bigint,
    call_status text,
    lockout_until timestamptz,
    created_at timestamptz,
    follow_up_at timestamptz,
    entity_names text,
    full_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset int;
BEGIN
    v_offset := (p_page - 1) * p_limit;

    -- Return Query
    RETURN QUERY
    WITH PhoneStats AS (
        SELECT
            pp.phone_number,
            bool_or(
                p_search IS NULL OR p_search = '' OR
                pp.phone_number ILIKE '%' || p_search || '%' OR
                pp.contact_name ILIKE '%' || p_search || '%' OR
                pp.entity_names ILIKE '%' || p_search || '%' OR
                p.property_name ILIKE '%' || p_search || '%' OR
                p.address ILIKE '%' || p_search || '%'
            ) as search_match,
            bool_or(p_state_filter IS NULL OR p_state_filter = 'ALL' OR p.state = p_state_filter) as state_match,
            bool_or(p_role_filters IS NULL OR Cardinality(p_role_filters) = 0 OR pp.labels && p_role_filters) as role_match,
            COUNT(*) as total_p_count,
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
    Grouped AS (
        SELECT
            ps.best_id,
            ps.phone_number,
            ps.total_p_count as p_count
        FROM PhoneStats ps
        WHERE 
            ps.search_match 
            AND ps.state_match 
            AND ps.role_match
            AND ps.total_p_count >= p_min_properties
            AND (p_max_properties IS NULL OR ps.total_p_count <= p_max_properties)
    ),
    Filtered AS (
        SELECT
             g.best_id,
             g.phone_number,
             g.p_count,
             pp.call_status,
             pp.lockout_until,
             pp.created_at,
             pp.follow_up_at,
             pp.entity_names
        FROM Grouped g
        JOIN prospect_phones pp ON g.best_id = pp.id
        WHERE
            (p_status_filters IS NULL OR Cardinality(p_status_filters) = 0 OR
             EXISTS (
                SELECT 1
                WHERE
                    ( 'LOCKED' = ANY(p_status_filters) AND pp.lockout_until > NOW() )
                    OR
                    ( 'NEVER_CONTACTED' = ANY(p_status_filters) AND pp.call_status = 'new' )
                    OR
                    ( 'PENDING_SIGNUP' = ANY(p_status_filters) AND pp.call_status = 'pending_signup' )
                    OR
                    ( 'FOLLOW_UP' = ANY(p_status_filters) AND pp.call_status = 'follow_up' )
                    OR
                    ( 'NO_ANSWER' = ANY(p_status_filters) AND pp.call_status = 'no_answer' )
                    OR
                    ( 'INVALID_NUMBER' = ANY(p_status_filters) AND pp.call_status = 'invalid_number' )
             )
            )
    )
    SELECT
        f.best_id as id,
        f.phone_number,
        f.p_count as property_count,
        f.call_status::text,
        f.lockout_until,
        f.created_at,
        f.follow_up_at,
        f.entity_names,
        COUNT(*) OVER() as full_count
    FROM Filtered f
    ORDER BY
        -- Priority 1: Active Follow-ups
        (f.call_status = 'follow_up' AND f.follow_up_at <= NOW()) DESC,
        f.follow_up_at ASC NULLS LAST,
        
        -- Priority 2: Dynamic Sort
        CASE WHEN p_sort_by = 'property_count' AND p_sort_dir = 'DESC' THEN f.p_count END DESC,
        CASE WHEN p_sort_by = 'property_count' AND p_sort_dir = 'ASC' THEN f.p_count END ASC,
        
        CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'DESC' THEN f.created_at END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'ASC' THEN f.created_at END ASC,

        CASE WHEN (p_sort_by = 'entity' OR p_sort_by = 'entity_names') AND p_sort_dir = 'DESC' THEN f.entity_names END DESC,
        CASE WHEN (p_sort_by = 'entity' OR p_sort_by = 'entity_names') AND p_sort_dir = 'ASC' THEN f.entity_names END ASC,
        
        -- Priority 3: Tie-breaker - Group by Entity Name
        COALESCE(f.entity_names, '') ASC,
        
        -- Priority 4: Final tie-breaker
        f.created_at DESC,
        f.phone_number ASC
    LIMIT p_limit OFFSET v_offset;
END;
$$;
