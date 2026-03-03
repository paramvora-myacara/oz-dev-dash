-- Migration: Implement stable sorting across CRM tables
-- Why: PostgreSQL doesn't guarantee data order on identical timestamps (e.g., bulk imports)
-- Fix: Add p.id as a tie-breaker to all created_at DESC sorts

CREATE OR REPLACE FUNCTION get_filtered_people_paginated(
  p_search_query text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_lead_statuses text[] DEFAULT NULL,
  p_verification_statuses text[] DEFAULT NULL,
  p_deliverability_statuses text[] DEFAULT NULL,
  p_has_email boolean DEFAULT NULL,
  p_has_linkedin boolean DEFAULT NULL,
  p_has_phone boolean DEFAULT NULL,
  p_campaign_history_param text DEFAULT NULL,
  p_campaign_history_ids uuid[] DEFAULT NULL,
  p_campaign_response_statuses text[] DEFAULT NULL,
  p_exclude_campaign_ids uuid[] DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_query text;
  where_clauses text[] := '{}';
  join_clauses text[] := '{}';
  v_total_count bigint;
  v_ids uuid[];
  v_result jsonb;
BEGIN
  -- We start with basic people selection
  base_query := 'FROM people p';

  -- Full Text Search
  IF p_search_query IS NOT NULL AND p_search_query != '' THEN
    where_clauses := array_append(where_clauses, format('p.search_vector @@ websearch_to_tsquery(%L)', p_search_query));
  END IF;

  -- Tags
  IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
    where_clauses := array_append(where_clauses, format('p.tags && %L::text[]', p_tags));
  END IF;

  -- Location
  IF p_location IS NOT NULL AND p_location != '' THEN
    where_clauses := array_append(where_clauses, format('p.details->>''location'' ILIKE %L', '%' || p_location || '%'));
  END IF;

  -- Source 
  IF p_source IS NOT NULL AND p_source != '' THEN
    where_clauses := array_append(where_clauses, format('p.details->>''import_source'' ILIKE %L', '%' || p_source || '%'));
  END IF;

  -- Lead Status
  IF p_lead_statuses IS NOT NULL AND array_length(p_lead_statuses, 1) > 0 THEN
    where_clauses := array_append(where_clauses, format('p.lead_status = ANY(%L::text[])', p_lead_statuses));
  END IF;

  -- Exclude Campaigns
  IF p_exclude_campaign_ids IS NOT NULL AND array_length(p_exclude_campaign_ids, 1) > 0 THEN
    where_clauses := array_append(where_clauses, format('p.id NOT IN (SELECT recipient_person_id FROM campaign_recipients WHERE campaign_id = ANY(%L::uuid[]))', p_exclude_campaign_ids));
  END IF;

  -- Campaign History Presence
  IF p_campaign_history_param = 'any' THEN
    where_clauses := array_append(where_clauses, 'EXISTS (SELECT 1 FROM campaign_recipients cr WHERE cr.recipient_person_id = p.id)');
  ELSIF p_campaign_history_param = 'none' THEN
    where_clauses := array_append(where_clauses, 'NOT EXISTS (SELECT 1 FROM campaign_recipients cr WHERE cr.recipient_person_id = p.id)');
  ELSIF p_campaign_history_ids IS NOT NULL AND array_length(p_campaign_history_ids, 1) > 0 THEN
    where_clauses := array_append(where_clauses, format('EXISTS (SELECT 1 FROM campaign_recipients cr WHERE cr.recipient_person_id = p.id AND cr.campaign_id = ANY(%L::uuid[]))', p_campaign_history_ids));
  END IF;

  -- Campaign Responses
  IF p_campaign_response_statuses IS NOT NULL AND array_length(p_campaign_response_statuses, 1) > 0 THEN
    DECLARE
      resp_clauses text[] := '{}';
    BEGIN
      IF 'replied' = ANY(p_campaign_response_statuses) THEN
        resp_clauses := array_append(resp_clauses, 'cr.replied_at IS NOT NULL');
      END IF;
      IF 'bounced' = ANY(p_campaign_response_statuses) THEN
        resp_clauses := array_append(resp_clauses, 'cr.status = ''bounced''');
      END IF;
      IF 'no_reply' = ANY(p_campaign_response_statuses) THEN
        resp_clauses := array_append(resp_clauses, 'cr.replied_at IS NULL');
      END IF;

      IF array_length(resp_clauses, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('EXISTS (SELECT 1 FROM campaign_recipients cr WHERE cr.recipient_person_id = p.id AND (%s))', array_to_string(resp_clauses, ' OR ')));
      END IF;
    END;
  END IF;

  -- Contact Methods
  IF p_has_email = true THEN
    where_clauses := array_append(where_clauses, 'EXISTS (SELECT 1 FROM person_emails pe WHERE pe.person_id = p.id)');
  ELSIF p_has_email = false THEN
    where_clauses := array_append(where_clauses, 'NOT EXISTS (SELECT 1 FROM person_emails pe WHERE pe.person_id = p.id)');
  END IF;

  IF p_has_linkedin = true THEN
    where_clauses := array_append(where_clauses, 'EXISTS (SELECT 1 FROM person_linkedin pl WHERE pl.person_id = p.id)');
  ELSIF p_has_linkedin = false THEN
    where_clauses := array_append(where_clauses, 'NOT EXISTS (SELECT 1 FROM person_linkedin pl WHERE pl.person_id = p.id)');
  END IF;

  IF p_has_phone = true THEN
    where_clauses := array_append(where_clauses, 'EXISTS (SELECT 1 FROM person_phones ph WHERE ph.person_id = p.id)');
  ELSIF p_has_phone = false THEN
    where_clauses := array_append(where_clauses, 'NOT EXISTS (SELECT 1 FROM person_phones ph WHERE ph.person_id = p.id)');
  END IF;

  -- Role Filtering
  IF p_role IS NOT NULL AND p_role != '' THEN
    join_clauses := array_append(join_clauses, 'LEFT JOIN person_organizations po ON p.id = po.person_id');
    where_clauses := array_append(where_clauses, format('po.title ILIKE %L', '%' || p_role || '%'));
  END IF;

  -- Email Verification
  IF (p_verification_statuses IS NOT NULL AND array_length(p_verification_statuses, 1) > 0) OR 
     (p_deliverability_statuses IS NOT NULL AND array_length(p_deliverability_statuses, 1) > 0) THEN
    join_clauses := array_append(join_clauses, 'LEFT JOIN person_emails pe2 ON p.id = pe2.person_id');
    join_clauses := array_append(join_clauses, 'LEFT JOIN emails e ON pe2.email_id = e.id');
    
    IF p_verification_statuses IS NOT NULL AND array_length(p_verification_statuses, 1) > 0 THEN
       where_clauses := array_append(where_clauses, format('(e.metadata->>''verification_status'') = ANY(%L::text[])', p_verification_statuses));
    END IF;
    
    IF p_deliverability_statuses IS NOT NULL AND array_length(p_deliverability_statuses, 1) > 0 THEN
       where_clauses := array_append(where_clauses, format('e.status = ANY(%L::text[])', p_deliverability_statuses));
    END IF;
  END IF;

  -- Build final query string
  base_query := base_query || ' ' || array_to_string(join_clauses, ' ');
  IF array_length(where_clauses, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_clauses, ' AND ');
  END IF;

  -- Get total count
  EXECUTE 'SELECT count(DISTINCT p.id) ' || base_query INTO v_total_count;

  -- Get page of IDs with stable sort (p.created_at DESC, p.id ASC)
  EXECUTE 'SELECT array_agg(id) FROM (SELECT p.id ' || base_query || ' GROUP BY p.id, p.created_at ORDER BY p.created_at DESC, p.id ASC LIMIT ' || p_limit || ' OFFSET ' || p_offset || ') sub' INTO v_ids;

  RETURN jsonb_build_object(
    'ids', COALESCE(v_ids, '{}'::uuid[]),
    'total_count', COALESCE(v_total_count, 0)
  );
END;
$$;
