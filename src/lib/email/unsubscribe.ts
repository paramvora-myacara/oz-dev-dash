export { generateUnsubscribeToken } from '@/app/api/unsubscribe/route';

export function generateUnsubscribeUrl(email: string, baseUrl: string = ''): string {
  // Dynamic import to avoid server/client boundary issues
  const { generateUnsubscribeToken } = require('@/app/api/unsubscribe/route');
  const token = generateUnsubscribeToken(email);
  const url = new URL('/api/unsubscribe', baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  url.searchParams.set('email', email);
  url.searchParams.set('token', token);
  return url.toString();
}
