// Status label utilities for user-friendly display

import type { CampaignStatus } from '@/types/email-editor'

// User-facing labels (e.g., "staged" becomes "Awaiting Review")
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  staged: 'Awaiting Review',
  scheduled: 'Scheduled',
  sending: 'Sending',
  completed: 'Completed',
  paused: 'Paused',
  cancelled: 'Cancelled',
}

// Color classes for status badges
export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  staged: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  sending: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function getStatusLabel(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_LABELS[status] || status
}

export function getStatusColor(status: CampaignStatus): string {
  return CAMPAIGN_STATUS_COLORS[status] || CAMPAIGN_STATUS_COLORS.draft
}

// Extract template variables from text (e.g., {{Name}} -> ["Name"])
export function extractTemplateFields(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
}

// Validate that all template fields exist in CSV columns (case-insensitive)
export function validateTemplateFields(
  templateFields: string[],
  csvColumns: string[]
): { valid: boolean; missingFields: string[] } {
  const lowerCaseColumns = csvColumns.map(c => c.toLowerCase())
  const missingFields = templateFields.filter(
    field => !lowerCaseColumns.includes(field.toLowerCase())
  )
  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}
