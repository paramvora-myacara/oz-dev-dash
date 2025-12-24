import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}
 * GET: Get campaign
 * PUT: Update campaign
 * DELETE: Delete campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToBackend(`/api/v1/campaigns/${id}`, {
    method: 'GET',
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  return proxyToBackend(`/api/v1/campaigns/${id}`, {
    method: 'PUT',
    body,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyToBackend(`/api/v1/campaigns/${id}`, {
    method: 'DELETE',
  })
}

