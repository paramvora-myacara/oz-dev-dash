export type CallStatus = 'new' | 'called' | 'answered' | 'voicemail' | 'follow_up' | 'closed' | 'no_answer' | 'rejected' | 'do_not_call' | 'locked';

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
    callerId: string;
    callerName: string;
    outcome: CallStatus;
    phoneUsed: string;
    notes: string;
    calledAt: string;
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

    // App-Specific Fields (Mocked for now)
    callStatus: CallStatus;
    lockoutUntil?: string | null;
    assignedTo?: string; // User ID
    lastCalledAt?: string;
    lastCalledBy?: string;
    callNotes?: string;
    followUpDate?: string;
    extras?: ProspectExtras;

    // Original CSV Row Data (for reference)
    raw?: Record<string, string>;
}
