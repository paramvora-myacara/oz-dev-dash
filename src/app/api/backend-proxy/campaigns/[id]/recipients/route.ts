import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/recipients
 * GET: List recipients
 * POST: Add recipients
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToBackend(`/api/v1/campaigns/${id}/recipients`, {
    method: 'GET',
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  return proxyToBackend(`/api/v1/campaigns/${id}/recipients`, {
    method: 'POST',
    body,
  })
}

