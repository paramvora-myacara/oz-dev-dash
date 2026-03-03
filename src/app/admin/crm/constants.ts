export const CATEGORY_OPTIONS: { label: string; value: string }[] = [
    { label: "Developers", value: "developer" },
    { label: "Investors", value: "investor" },
    { label: "Family Offices", value: "family_office" },
    { label: "Funds", value: "fund" },
];

export const CATEGORY_VALUES: string[] = CATEGORY_OPTIONS.map((o) => o.value);
