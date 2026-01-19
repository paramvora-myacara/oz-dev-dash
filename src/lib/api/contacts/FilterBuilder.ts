import { getExpandedSearchTerms } from './utils';

export interface FilterCondition {
    type: 'text_search' | 'location' | 'contact_type' | 'lead_status' |
    'tags' | 'email_status' | 'campaign_history' | 'website_event' |
    'campaign_response';
    operator: 'equals' | 'contains' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'ilike' | 'eq' | 'is' | 'fts';
    value: any;
}

export class ContactFilterBuilder {
    private query: any;
    private conditions: FilterCondition[] = [];

    constructor(baseQuery: any) {
        this.query = baseQuery;
    }

    /**
     * Applies a hybrid search (FTS + ILIKE) across name, email, company, and expanded location.
     */
    withTextSearch(search?: string): this {
        if (!search) return this;

        const searchTerms = getExpandedSearchTerms(search);
        const conditions: string[] = [];

        // FTS
        conditions.push(`search_vector.fts.${search}`);
        // Substring matches
        conditions.push(`name.ilike.%${search}%`);
        conditions.push(`company.ilike.%${search}%`);
        conditions.push(`email.ilike.%${search}%`);

        // Expanded Location Matching
        searchTerms.forEach(term => {
            conditions.push(`location.ilike.%${term}%`);
        });

        this.query = this.query.or(conditions.join(','));
        this.conditions.push({ type: 'text_search', operator: 'fts', value: search });
        return this;
    }

    /**
     * Applies location filtering with state expansion.
     */
    withLocation(location?: string): this {
        if (!location) return this;

        const locTerms = getExpandedSearchTerms(location);
        const locConditions = locTerms.map(t => `location.ilike.%${t}%`);
        this.query = this.query.or(locConditions.join(','));
        this.conditions.push({ type: 'location', operator: 'ilike', value: location });
        return this;
    }

    /**
     * Applies role filtering (exact or partial).
     */
    withRole(role?: string): this {
        if (!role) return this;
        this.query = this.query.ilike('role', `%${role}%`);
        this.conditions.push({ type: 'text_search', operator: 'ilike', value: role });
        return this;
    }

    /**
     * Applies source filtering.
     */
    withSource(source?: string): this {
        if (!source) return this;
        this.query = this.query.eq('source', source);
        this.conditions.push({ type: 'text_search', operator: 'eq', value: source });
        return this;
    }

    /**
     * Applies contact type filtering using the new array column and overlap operator.
     * This allows matching contacts that have ANY of the requested types.
     */
    withContactType(contactType?: string | string[]): this {
        if (!contactType) return this;

        const types = Array.isArray(contactType)
            ? contactType
            : contactType.split(',').map(t => t.trim()).filter(Boolean);

        if (types.length > 0) {
            // Use the 'overlaps' operator (&& in SQL) for the text array column
            this.query = this.query.overlaps('contact_types', types);
        }

        this.conditions.push({ type: 'contact_type', operator: 'contains', value: types });
        return this;
    }

    /**
     * Applies lead status filtering (warm/cold).
     */
    withLeadStatus(leadStatus?: 'warm' | 'cold' | 'all'): this {
        if (!leadStatus || leadStatus === 'all') return this;

        if (leadStatus === 'warm') {
            this.query = this.query.eq('details->>lead_status', 'warm');
        } else if (leadStatus === 'cold') {
            this.query = this.query.or('details->>lead_status.eq.cold,details->>lead_status.is.null');
        }
        this.conditions.push({ type: 'lead_status', operator: 'eq', value: leadStatus });
        return this;
    }

    /**
     * Applies email status filtering.
     */
    withEmailStatus(emailStatus?: string | string[]): this {
        if (!emailStatus) return this;

        if (Array.isArray(emailStatus)) {
            this.query = this.query.in('details->>email_status', emailStatus);
        } else {
            this.query = this.query.eq('details->>email_status', emailStatus);
        }
        this.conditions.push({ type: 'email_status', operator: 'in', value: emailStatus });
        return this;
    }

    /**
     * Applies tags filtering from Details JSONB column.
     */
    withTags(tags?: string | string[]): this {
        if (!tags) return this;

        if (Array.isArray(tags)) {
            const tagConditions = tags.map(tag => `details->>Tags.eq.${tag}`);
            this.query = this.query.or(tagConditions.join(','));
        } else {
            this.query = this.query.eq('details->>Tags', tags);
        }
        this.conditions.push({ type: 'tags', operator: 'in', value: tags });
        return this;
    }

    /**
     * Excludes globally suppressed contacts.
     */
    excludeSuppressed(): this {
        this.query = this.query
            .eq('globally_unsubscribed', false)
            .eq('globally_bounced', false);
        return this;
    }

    /**
     * Applies website event filtering if the contact is linked to a user.
     */
    withWebsiteEvent(eventTypes?: string[], options?: { operator?: 'any' | 'all', since?: Date }): this {
        if (!eventTypes || eventTypes.length === 0) return this;

        const operator = options?.operator || 'any';

        // Construct the subquery string for PostgREST
        const typesStr = eventTypes.map(t => `'${t}'`).join(',');
        let filterStr = `event_type.in.(${typesStr})`;

        if (options?.since) {
            filterStr += `,created_at.gte.${options.since.toISOString()}`;
        }

        // Use the filter method with a subquery string
        // Note: PostgREST allows in.(select ...) but it's often easier to use rpc or joined filters.
        // For now, we'll use a specific PostgREST multi-select pattern if possible, 
        // but the most reliable way in JS client for complex subqueries is often rpc or two steps.
        // However, we can use the 'in' filter with a parenthesized select string.
        const subselect = `user_id.in.(select user_id from user_events where ${filterStr.replace(/,/g, ' AND ')})`;

        // Actually, PostgREST doesn't support AND inside the subselect like that easily via 'in'.
        // Better: use the .or() or a simpler approach.
        this.query = this.query.not('user_id', 'is', null).filter('user_id', 'in', `(select user_id from user_events where event_type = any(array[${typesStr}]))`);

        this.conditions.push({
            type: 'website_event',
            operator: operator === 'any' ? 'exists' : 'contains',
            value: { eventTypes, since: options?.since }
        });
        return this;
    }

    /**
     * Applies campaign response filtering (e.g., "in campaign X and Replied").
     */
    withCampaignResponse(campaignId: string, response: 'replied' | 'no_reply' | 'bounced' | 'completed_sequence'): this {
        if (!campaignId || !response) return this;

        let condition = `campaign_id.eq.${campaignId}`;

        if (response === 'replied') {
            condition += ',replied_at.not.is.null';
        } else if (response === 'no_reply') {
            condition += ',replied_at.is.null';
        } else if (response === 'bounced') {
            condition += ',bounced_at.not.is.null';
        } else if (response === 'completed_sequence') {
            condition += ',status.eq.completed';
        }

        this.query = this.query.filter('id', 'in', `(select contact_id from campaign_recipients where ${condition})`);
        this.conditions.push({ type: 'campaign_response', operator: 'eq', value: { campaignId, response } });
        return this;
    }

    /**
     * Returns the final query and tracked conditions.
     */
    build(): { query: any; conditions: FilterCondition[] } {
        return { query: this.query, conditions: this.conditions };
    }
}
