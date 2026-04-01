import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return proxyToBackend(`/api/v1/crm/people/${id}/linkedin/request-sent`, {
    method: 'POST',
    body,
  });
}

