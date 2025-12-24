import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/domains
 */
export async function GET(request: NextRequest) {
  return proxyToBackend('/api/v1/campaigns/domains', {
    method: 'GET',
  })
}

