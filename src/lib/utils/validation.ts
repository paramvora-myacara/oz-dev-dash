/**
 * Validates an email address using a strict regex pattern.
 * This regex requires:
 * - Standard characters before @
 * - An @ symbol
 * - Standard characters after @
 * - A dot
 * - At least 2 characters for the TLD
 * 
 * Examples:
 * - valid: "user@example.com", "user.name@sub.domain.co.uk"
 * - invalid: "user@", "@domain.com", "user@domain", "pending", "N/A"
 */
export function isValidEmail(email: string | null | undefined): boolean {
    if (!email) return false;

    // Trim whitespace
    const trimmed = email.trim();

    if (!trimmed) return false;

    // Standard email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(trimmed);
}

/**
 * Normalizes an email for storage/comparison
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
