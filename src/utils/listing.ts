/**
 * Utility functions for listing operations
 */

/**
 * Derives projectId from slug
 * The projectId is used for Supabase storage paths
 * Format: ${slug}-001
 */
export function getProjectIdFromSlug(slug: string): string {
  return `${slug}-001`;
}

/**
 * Extracts slug from projectId (reverse of getProjectIdFromSlug)
 * Only works for projectIds in the format: ${slug}-001
 */
export function getSlugFromProjectId(projectId: string): string | null {
  const match = projectId.match(/^(.+)-001$/);
  return match ? match[1] : null;
}

