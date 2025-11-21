export const toCamelCase = (slug: string): string => {
    const parts = slug.split('-');
    return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

/**
 * Prefixes listing paths with /listings/ when accessed via oz-homepage rewrite
 * This ensures links work correctly when oz-dev-dash is accessed through ozlistings.com
 * Note: Edit routes are excluded as they should not be accessible via ozlistings.com
 * @param path - The listing path (e.g., "/my-slug/details/financial-returns")
 * @returns The path with /listings/ prefix if on ozlistings.com, otherwise unchanged
 */
export const getListingPath = (path: string): string => {
    // Don't prefix edit routes - they should only be accessible directly on oz-dev-dash
    if (path.includes('/edit')) {
        return path;
    }

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.toLowerCase();
        const pathname = window.location.pathname;

        // Check if we are on ozlistings.com OR if the current path starts with /listings (local dev proxy)
        const isOzListings =
            hostname === 'ozlistings.com' ||
            hostname === 'www.ozlistings.com' ||
            pathname.startsWith('/listings');

        if (isOzListings) {
            // Ensure path starts with / and doesn't already have /listings/
            if (path.startsWith('/') && !path.startsWith('/listings/')) {
                return `/listings${path}`;
            }
        }
    }
    return path;
} 