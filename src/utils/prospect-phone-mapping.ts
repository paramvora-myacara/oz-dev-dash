import { ProspectPhone, CallHistory } from '@/types/prospect';

export function mapProspectPhone(dbRow: any): ProspectPhone {
    if (!dbRow) return dbRow;

    let extrasObj = dbRow.extras;
    if (typeof extrasObj === 'string') {
        try { extrasObj = JSON.parse(extrasObj); } catch { extrasObj = {}; }
    }
    extrasObj = extrasObj || {};

    const result: ProspectPhone = {
        id: dbRow.id,
        prospectId: dbRow.prospect_id,
        phoneNumber: dbRow.phone_number,
        labels: Array.isArray(dbRow.labels) ? dbRow.labels : [],
        contactName: dbRow.contact_name || null,
        contactEmail: dbRow.contact_email || null,
        entityNames: dbRow.entity_names || null,
        entityAddresses: dbRow.entity_addresses || null,
        callStatus: dbRow.call_status,
        lockoutUntil: dbRow.lockout_until,
        followUpAt: dbRow.follow_up_at,
        lastCalledAt: dbRow.last_called_at,
        lastCalledBy: dbRow.last_called_by,
        callCount: dbRow.call_count ?? 0,
        viewing_by: dbRow.viewing_by,
        viewing_since: dbRow.viewing_since,
        extras: extrasObj,
        callHistory: (dbRow.prospect_calls || []).map((c: any) => ({
            id: c.id,
            callerName: c.caller_name,
            outcome: c.outcome,
            phoneUsed: c.phone_used,
            email: c.email_captured,
            calledAt: c.called_at,
            emailStatus: c.email_status,
            emailError: c.email_error
        } as CallHistory))
    };

    if (dbRow.prospects) {
        const p = dbRow.prospects;
        result.prospect = {
            id: p.id,
            propertyName: p.property_name,
            address: p.address,
            city: p.city,
            state: p.state,
            market: p.market,
            submarket: p.submarket,
            zip: p.zip,
            raw: {
                'Property Name': p.property_name,
                'Market': p.market,
                'Address': p.address,
                'City': p.city,
                'State': p.state,
                'Submarket': p.submarket,
                'ZIP': p.zip
            }
        };
    }

    return result;
}
