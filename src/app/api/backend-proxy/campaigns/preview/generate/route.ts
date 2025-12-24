import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/preview/generate
 * POST: Generate preview content for email sections
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  return proxyToBackend('/api/v1/campaigns/preview/generate', {
    method: 'POST',
    body,
  })
}

