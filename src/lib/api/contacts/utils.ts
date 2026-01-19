// State Mapping for Smart Search and UI
export const STATE_MAPPING: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
};

export const STATE_NAME_TO_CODE: Record<string, string> = Object.entries(STATE_MAPPING).reduce((acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
}, {} as Record<string, string>);

export const CODE_TO_STATE_NAME = Object.entries(STATE_MAPPING).reduce((acc, [code, name]) => {
    acc[code] = name;
    return acc;
}, {} as Record<string, string>);

/**
 * Expands a search term to include state codes if full names are provided, and vice versa.
 */
export const getExpandedSearchTerms = (input: string): string[] => {
    const terms = [input];
    const lower = input.toLowerCase().trim();

    // If input is full state name, add code
    if (STATE_NAME_TO_CODE[lower]) {
        terms.push(STATE_NAME_TO_CODE[lower]);
    }

    // If input is code, add full state name
    if (CODE_TO_STATE_NAME[input.toUpperCase()]) {
        terms.push(CODE_TO_STATE_NAME[input.toUpperCase()]);
    }

    return terms;
};

/**
 * Splits a comma-separated email string into an array of trimmed email addresses.
 */
export const getEmails = (emailStr: string): string[] => {
    if (!emailStr) return [];
    return emailStr.split(',').map(e => e.trim()).filter(Boolean);
};

/**
 * Checks if an email string represents multiple email addresses.
 */
export const isMultipleEmails = (emailStr: string): boolean => {
    return getEmails(emailStr).length > 1;
};
