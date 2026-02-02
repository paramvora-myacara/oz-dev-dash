import { Prospect, PhoneNumber } from '@/types/prospect';

export function mapProspect(dbRow: any): Prospect {
    if (!dbRow) return dbRow;

    // Handle potential string-ified JSON from DB (sometimes happens with JSONB depending on driver/insert method)
    let phoneNumbersArr = dbRow.phone_numbers;
    if (typeof phoneNumbersArr === 'string') {
        try { phoneNumbersArr = JSON.parse(phoneNumbersArr); } catch (e) { phoneNumbersArr = []; }
    }
    phoneNumbersArr = phoneNumbersArr || [];

    let extrasObj = dbRow.extras;
    if (typeof extrasObj === 'string') {
        try { extrasObj = JSON.parse(extrasObj); } catch (e) { extrasObj = {}; }
    }
    extrasObj = extrasObj || {};

    // Extract owner info from phone entries if root columns are empty
    const ownerEntry = (phoneNumbersArr as any[]).find(p => p.label === 'Owner');
    const derivedOwnerName = ownerEntry?.contactName || '';
    const derivedOwnerEmail = ownerEntry?.contactEmail || '';

    const result: Prospect = {
        id: dbRow.id,
        propertyName: dbRow.property_name,
        market: dbRow.market,
        submarket: dbRow.submarket,
        address: dbRow.address,
        city: dbRow.city,
        state: dbRow.state,
        zip: dbRow.zip,
        ownerName: dbRow.owner_name || derivedOwnerName,
        ownerEmail: dbRow.owner_email || derivedOwnerEmail,
        phoneNumbers: phoneNumbersArr as PhoneNumber[],
        callStatus: dbRow.call_status,
        lockoutUntil: dbRow.lockout_until,
        followUpAt: dbRow.follow_up_at,
        lastCalledAt: dbRow.last_called_at,
        lastCalledBy: dbRow.last_called_by,
        viewing_by: dbRow.viewing_by,
        viewing_since: dbRow.viewing_since,
        extras: extrasObj,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        raw: {
            'Property Name': dbRow.property_name,
            'Market': dbRow.market,
            'Address': dbRow.address,
            'City': dbRow.city,
            'State': dbRow.state,
            'Submarket': dbRow.submarket,
            'ZIP': dbRow.zip
        }
    };

    if (dbRow.prospect_calls) {
        result.callHistory = dbRow.prospect_calls.map((c: any) => ({
            id: c.id,
            callerName: c.caller_name,
            outcome: c.outcome,
            phoneUsed: c.phone_used,
            email: c.email_captured,
            calledAt: c.called_at,
            emailStatus: c.email_status,
            emailError: c.email_error
        }));
    }

    return result;
}
