import crypto from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'your-secret-key-change-in-production';

// Generate HMAC token for email
export function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(email.toLowerCase())
    .digest('hex')
    .substring(0, 16);
}

export function generateUnsubscribeUrl(email: string, campaignId?: string, baseUrl: string = ''): string {
  const token = generateUnsubscribeToken(email);
  const url = new URL('/api/unsubscribe', baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  url.searchParams.set('email', email);
  url.searchParams.set('token', token);
  if (campaignId) {
    url.searchParams.set('campaign_id', campaignId);
  }
  return url.toString();
}
