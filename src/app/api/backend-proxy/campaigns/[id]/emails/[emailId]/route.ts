import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/emails/{email_id}
 * GET: Get email
 * PUT: Update email
 * DELETE: Delete email
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  const { id, emailId } = await params
  return proxyToBackend(`/api/v1/campaigns/${id}/emails/${emailId}`, {
    method: 'GET',
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  const { id, emailId } = await params
  const body = await request.json().catch(() => null)
  return proxyToBackend(`/api/v1/campaigns/${id}/emails/${emailId}`, {
    method: 'PUT',
    body,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; emailId: string }> }
) {
  const { id, emailId } = await params
  return proxyToBackend(`/api/v1/campaigns/${id}/emails/${emailId}`, {
    method: 'DELETE',
  })
}

