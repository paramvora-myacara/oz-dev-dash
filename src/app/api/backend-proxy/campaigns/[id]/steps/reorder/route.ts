import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/steps/reorder
 * POST: Reorder steps in a campaign
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json().catch(() => null)
    return proxyToBackend(`/api/v1/campaigns/${id}/steps/reorder`, {
        method: 'POST',
        body,
    })
}
