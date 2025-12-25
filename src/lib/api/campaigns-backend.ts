/** Backend API client for campaign management.
 * 
 * This client connects to the FastAPI backend via Next.js proxy routes.
 * Authentication is handled server-side by the proxy, keeping credentials secure.
 */

import type { Campaign, QueuedEmail, LaunchResponse } from '@/types/email-editor';

// Use Next.js proxy routes instead of direct backend calls
// The proxy handles authentication server-side using httpOnly cookies
const PROXY_BASE = '/api/backend-proxy/campaigns';

// Campaign CRUD
export async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch(PROXY_BASE);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch campaigns');
  }
  return res.json();
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`${PROXY_BASE}/${id}`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch campaign');
  }
  return res.json();
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(PROXY_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to create campaign');
  }
  return res.json();
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${PROXY_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to update campaign');
  }
  return res.json();
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${PROXY_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to delete campaign');
  }
}

// Email generation
export interface GenerateResponse {
  success: boolean;
  staged?: number;
  errors?: string[];
}

export async function generateEmails(
  campaignId: string,
  csvFile: File | null,
  onProgress?: (progress: any) => void,
  options?: { useDatabaseRecipients?: boolean }
): Promise<GenerateResponse> {
  // Backend only supports database recipients now
  const res = await fetch(`${PROXY_BASE}/${campaignId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ use_database_recipients: true }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to start generation');
  }
  
  const result = await res.json();
  
  // For background jobs, we return immediately
  // Frontend should poll status endpoint
  return {
    success: true,
    staged: 0, // Will be updated via status polling
  };
}

// Campaign launch
export async function launchCampaign(
  campaignId: string,
  options?: { all?: boolean; emailIds?: string[] }
): Promise<LaunchResponse> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || { all: true }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to start launch');
  }
  
  const result = await res.json();
  
  // For background jobs, return simplified response
  return {
    success: true,
    queued: 0, // Will be updated via status polling
    scheduling: {
      timezone: 'America/Los_Angeles',
      intervalMinutes: 3.5,
      startTimeUTC: new Date().toISOString(),
      estimatedEndTimeUTC: new Date().toISOString(),
      emailsByDay: {},
      totalDays: 0,
    },
  };
}

// Campaign status
export interface CampaignStatus {
  campaign_status: string;
  staged_count: number;
  queued_count: number;
  total_recipients: number;
  is_ready: boolean;
  is_launched: boolean;
}

export async function getCampaignStatus(campaignId: string): Promise<CampaignStatus> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/status`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch status');
  }
  return res.json();
}

// Campaign summary
export interface CampaignSummary {
  success: boolean;
  counts: {
    sent: number;
    failed: number;
    queued: number;
    processing: number;
    staged: number;
    total: number;
  };
  lastSentAt: string | null;
  nextScheduledFor: string | null;
  sparkpostMetrics: {
    deliveryRate: number | null;
    bounceRate: number | null;
    countDelivered: number | null;
    countBounced: number | null;
    unsubscribeRate: number | null;
    countUnsubscribed: number | null;
  };
}

export async function getCampaignSummary(campaignId: string): Promise<CampaignSummary> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/summary`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch summary');
  }
  return res.json();
}

// Global status
export async function getGlobalStatus(): Promise<any> {
  const res = await fetch(`${PROXY_BASE}/status`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch global status');
  }
  return res.json();
}

// Test send
export async function testSend(
  campaignId: string,
  testEmail: string,
  recipientEmailId?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/test-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testEmail, recipientEmailId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to send test email');
  }
  return res.json();
}

// Generate subject
export async function generateSubject(
  campaignId: string,
  instructions: string
): Promise<{ subject: string }> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/generate-subject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instructions }),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to generate subject');
  }
  return res.json();
}

// Retry failed
export async function retryFailed(campaignId: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/retry-failed`, {
    method: 'POST',
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to retry failed emails');
  }
  return res.json();
}

// Get emails
export async function getEmails(
  campaignId: string,
  status?: string,
  limit: number = 100,
  offset: number = 0
): Promise<QueuedEmail[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  const res = await fetch(`${PROXY_BASE}/${campaignId}/emails?${params}`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch emails');
  }
  return res.json();
}

// Get recipients
export async function getRecipients(campaignId: string): Promise<any[]> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/recipients`);
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to fetch recipients');
  }
  return res.json();
}

// Add recipients
export async function addRecipients(
  campaignId: string,
  contactIds: string[],
  selectedEmails?: Record<string, string>
): Promise<{ success: boolean; count: number }> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/recipients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contact_ids: contactIds,
      selected_emails: selectedEmails,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to add recipients');
  }
  return res.json();
}

// Get staged emails (alias for getEmails with status filter)
export async function getStagedEmails(
  campaignId: string,
  options?: { status?: string; limit?: number; offset?: number }
): Promise<{ emails: QueuedEmail[]; total: number }> {
  const emails = await getEmails(campaignId, options?.status || 'staged', options?.limit || 100, options?.offset || 0);
  // Backend doesn't return total separately, so we return the count of emails in this page
  // The caller should accumulate totals across pages by counting all fetched emails
  return { emails, total: emails.length };
}

// Update staged email
export async function updateStagedEmail(
  campaignId: string,
  emailId: string,
  data: { subject?: string; body?: string }
): Promise<QueuedEmail> {
  const res = await fetch(`${PROXY_BASE}/${campaignId}/emails/${emailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(async () => ({ detail: await res.text() }));
    throw new Error(error.detail || 'Failed to update email');
  }
  return res.json();
}

// Send test email (alias for testSend)
export async function sendTestEmail(
  campaignId: string,
  testEmail: string,
  recipientEmailId?: string
): Promise<{ success: boolean }> {
  const result = await testSend(campaignId, testEmail, recipientEmailId);
  return { success: result.success };
}

// Regenerate single email AI content
// Note: This endpoint may need to be implemented in the backend
export async function regenerateEmail(
  campaignId: string,
  emailId: string
): Promise<{ success: boolean; email: QueuedEmail }> {
  // For now, we'll need to implement this endpoint in the backend
  // This is a placeholder that will need backend support
  throw new Error('Regenerate email endpoint not yet implemented in backend');
}

// Get sample recipients for campaign preview
export async function getCampaignSampleRecipients(id: string, limit = 5): Promise<{ rows: any[]; columns: string[] }> {
  const recipients = await getRecipients(id);
  
  if (!recipients || recipients.length === 0) {
    return { rows: [], columns: [] };
  }
  
  // Transform recipients into flat row objects
  const rows = recipients.slice(0, limit).map((r: any) => {
    const contact = r.contacts || (Array.isArray(r.contacts) ? r.contacts[0] : {});
    
    // Flatten contact details if present
    const details = (contact.details as Record<string, string>) || {};
    
    const row: Record<string, any> = {
      ...details,
      Name: contact.name || '',
      Email: r.selected_email || contact.email || '',
      Company: contact.company || '',
      Role: contact.role || '',
      Location: contact.location || '',
      Phone: contact.phone_number || '',
    };
    
    // Remove duplicates (lowercase versions)
    delete row['name'];
    delete row['email'];
    delete row['company'];
    delete row['role'];
    delete row['location'];
    delete row['phone'];
    
    return row;
  });
  
  // Derive columns from all keys across rows
  const allKeys = new Set<string>(['Name', 'Email', 'Company', 'Role', 'Location']);
  rows.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
  const columns = Array.from(allKeys);
  
  return { rows, columns };
}

