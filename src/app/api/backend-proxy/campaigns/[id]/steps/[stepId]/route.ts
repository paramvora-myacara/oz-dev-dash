import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/steps/{stepId}
 * GET: Get a single step
 * PATCH: Update a step
 * DELETE: Delete a step
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stepId: string }> }
) {
    const { id, stepId } = await params
    return proxyToBackend(`/api/v1/campaigns/${id}/steps/${stepId}`, {
        method: 'GET',
    })
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stepId: string }> }
) {
    const { id, stepId } = await params
    const body = await request.json().catch(() => null)
    return proxyToBackend(`/api/v1/campaigns/${id}/steps/${stepId}`, {
        method: 'PATCH',
        body,
    })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stepId: string }> }
) {
    const { id, stepId } = await params
    return proxyToBackend(`/api/v1/campaigns/${id}/steps/${stepId}`, {
        method: 'DELETE',
    })
}
