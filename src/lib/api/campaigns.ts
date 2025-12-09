import type { Campaign, QueuedEmail, GenerateResponse, LaunchResponse, GenerateSamplesResponse, EmailFormat } from '@/types/email-editor';

const API_BASE = '/api/campaigns';

// Campaign CRUD
export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

// Email Generation & Staging
export async function generateSamples(
  campaignId: string, 
  csvFile: File, 
  emailFormat: EmailFormat,
  count: number = 5
): Promise<GenerateSamplesResponse & { totalRecipients: number }> {
  const formData = new FormData();
  formData.append('file', csvFile);
  formData.append('emailFormat', emailFormat);
  formData.append('count', count.toString());
  
  const res = await fetch(`${API_BASE}/${campaignId}/generate-samples`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateEmails(campaignId: string, csvFile: File): Promise<GenerateResponse> {
  const formData = new FormData();
  formData.append('file', csvFile);
  
  const res = await fetch(`${API_BASE}/${campaignId}/generate`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getStagedEmails(
  campaignId: string, 
  options?: { status?: string; limit?: number; offset?: number }
): Promise<{ emails: QueuedEmail[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  
  const res = await fetch(`${API_BASE}/${campaignId}/emails?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateStagedEmail(
  campaignId: string, 
  emailId: string, 
  data: { subject?: string; body?: string }
): Promise<QueuedEmail> {
  const res = await fetch(`${API_BASE}/${campaignId}/emails/${emailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Launch
export async function launchCampaign(
  campaignId: string, 
  options?: { emailIds?: string[]; all?: boolean }
): Promise<LaunchResponse> {
  const res = await fetch(`${API_BASE}/${campaignId}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || { all: true }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Test Send
export async function sendTestEmail(campaignId: string, testEmail: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/${campaignId}/test-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testEmail }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
