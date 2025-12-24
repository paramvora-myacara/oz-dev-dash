import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns
 * GET: List campaigns
 * POST: Create campaign
 */
export async function GET(request: NextRequest) {
  return proxyToBackend('/api/v1/campaigns', {
    method: 'GET',
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  return proxyToBackend('/api/v1/campaigns', {
    method: 'POST',
    body,
  })
}

