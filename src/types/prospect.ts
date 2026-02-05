export type CallStatus = 'new' | 'called' | 'answered' | 'invalid_number' | 'follow_up' | 'closed' | 'no_answer' | 'rejected' | 'do_not_call' | 'locked' | 'pending_signup';

export interface PhoneNumber {
    label: string;
    number: string;
    lastCalledAt?: string;
    callCount?: number;
    contactName?: string;
    contactEmail?: string;
    details?: Record<string, string>;
}

export interface ProspectExtras {
    webinar?: boolean;
    consultation?: boolean;
    other?: boolean;
}

export interface CallHistory {
    id: string;
    callerId?: string;
    callerName: string;
    outcome: CallStatus;
    phoneUsed: string;
    email?: string;
    calledAt: string;
    emailStatus?: 'sent' | 'failed' | 'pending';
    emailError?: string;
}

export interface Prospect {
    id: string; // Generated ID

    // Fields from CSV
    market: string;
    submarket: string;
    propertyName: string;
    address: string;
    city: string;
    state: string;
    zip: string;

    // Contact Info
    ownerName: string; // Combined First + Last
    ownerEmail: string;

    // Aggregated Phone Numbers
    phoneNumbers: PhoneNumber[];

    // App-Specific Fields
    callStatus: CallStatus;
    lockoutUntil?: string | null;
    assignedTo?: string; // User ID
    lastCalledAt?: string;
    lastCalledBy?: string;
    callNotes?: string;
    followUpAt?: string;
    extras?: ProspectExtras;
    callHistory?: CallHistory[];

    // Optimistic locking
    viewing_by?: string | null;
    viewing_since?: string | null;

    created_at?: string;
    updated_at?: string;

    // Original CSV Row Data (optional for raw view)
    raw?: Record<string, string>;
}

/** Phone-first model: one row per (property, phone) with status on the phone */
export interface ProspectPhone {
    id: string;
    prospectId: string;
    phoneNumber: string;
    labels: string[];
    contactName?: string | null;
    contactEmail?: string | null;
    entityNames?: string | null;
    entityAddresses?: string | null;
    callStatus: CallStatus;
    lockoutUntil?: string | null;
    followUpAt?: string | null;
    lastCalledAt?: string | null;
    lastCalledBy?: string | null;
    callCount: number;
    viewing_by?: string | null;
    viewing_since?: string | null;
    extras?: ProspectExtras;
    callHistory?: CallHistory[];
    /** Nested prospect (property) */
    prospect?: {
        id: string;
        propertyName: string;
        address?: string;
        city?: string;
        state?: string;
        market?: string;
        submarket?: string;
        zip?: string;
        raw?: Record<string, string>;
    };
}

export interface AggregatedProspectPhone extends Omit<ProspectPhone, 'prospect'> {
    propertyCount: number;
    allContactNames: string[];
    allContactEmails: string[];
    allEntityNames: string[];
    properties: Array<{
        id: string; // prospect_phone_id (the specific record for this property)
        prospectId: string;
        propertyName: string;
        address?: string;
        city?: string;
        state?: string;
        market?: string;
        submarket?: string;
        zip?: string;
        callStatus: CallStatus;
        labels: string[];
        entityNames: string | null;
        contactName: string | null;
        contactEmail: string | null;
    }>;
}

