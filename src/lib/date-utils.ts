export function formatToPT(date: string | Date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    // Check for invalid date
    if (isNaN(d.getTime())) return '';

    return d.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }) + ' PT';
}

export function formatDateToPT(date: string | Date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}
