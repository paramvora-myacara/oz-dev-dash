import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/status (global status)
 */
export async function GET(request: NextRequest) {
  return proxyToBackend('/api/v1/campaigns/status', {
    method: 'GET',
  })
}

