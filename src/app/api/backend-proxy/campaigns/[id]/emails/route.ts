import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/emails
 * GET: List emails
 * POST: Add emails (if needed)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  const path = `/api/v1/campaigns/${id}/emails${queryString ? `?${queryString}` : ''}`
  
  return proxyToBackend(path, {
    method: 'GET',
  })
}

