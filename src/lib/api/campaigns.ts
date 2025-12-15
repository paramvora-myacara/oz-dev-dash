import type { Campaign, QueuedEmail, GenerateResponse, LaunchResponse, EmailFormat, SampleData } from '@/types/email-editor';

const API_BASE = '/api/campaigns';

// CSV Validation types
export interface CsvValidationResult {
  csvRowCount: number;
  fields: string[];
  emails: {
    total: number;
    valid: number;
    duplicates: number;
    invalid: number;
    missing: number;
  };
  errors: string[];
}

// Validate CSV without generating emails (dry run)
export async function validateCsv(campaignId: string, csvFile: File): Promise<CsvValidationResult> {
  const formData = new FormData();
  formData.append('file', csvFile);

  const res = await fetch(`${API_BASE}/${campaignId}/validate-csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

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

export interface GenerateProgress {
  type: 'start' | 'phase' | 'ai_progress' | 'insert_progress' | 'done' | 'error';
  total?: number;
  completed?: number;
  percentage?: number;
  phase?: string;
  staged?: number;
  errors?: string[];
  error?: string;
  success?: boolean;
}

export async function generateEmails(
  campaignId: string,
  csvFile: File | null,
  onProgress?: (progress: GenerateProgress) => void,
  options?: { useDatabaseRecipients?: boolean }
): Promise<GenerateResponse> {
  const formData = new FormData();
  if (csvFile) {
    formData.append('file', csvFile);
  }
  if (options?.useDatabaseRecipients) {
    formData.append('useDatabaseRecipients', 'true');
  }

  const res = await fetch(`${API_BASE}/${campaignId}/generate`, {
    method: 'POST',
    body: formData,
  });

  // Check if it's an SSE stream
  const contentType = res.headers.get('Content-Type') || '';

  if (contentType.includes('text/event-stream')) {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to read stream');
    }

    let finalResult: GenerateResponse | null = null;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6)) as GenerateProgress;
            onProgress?.(data);

            if (data.type === 'done') {
              finalResult = {
                success: true,
                staged: data.staged || 0,
                errors: data.errors,
              };
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Unknown error during generation');
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              console.warn('Failed to parse SSE data:', line);
            } else {
              throw e;
            }
          }
        }
      }
    }

    if (!finalResult) {
      throw new Error('Stream ended without completion');
    }

    return finalResult;
  } else {
    // Fallback for non-streaming response
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
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
export async function sendTestEmail(campaignId: string, testEmail: string, recipientEmailId?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/${campaignId}/test-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testEmail, recipientEmailId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Regenerate single email AI content
export async function regenerateEmail(
  campaignId: string,
  emailId: string
): Promise<{ success: boolean; email: QueuedEmail }> {
  const res = await fetch(`${API_BASE}/${campaignId}/emails/${emailId}/regenerate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Fetch sample recipients for campaign (for preview)
export async function getCampaignSampleRecipients(id: string, limit = 5): Promise<SampleData> {
  const res = await fetch(`${API_BASE}/${id}/recipients?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch sample recipients')
  const json = await res.json()
  return json.sampleData
}
