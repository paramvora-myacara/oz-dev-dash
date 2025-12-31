import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Proxy route for /api/v1/campaigns/{id}/steps
 * GET: List all steps for a campaign
 * POST: Create a new step
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    return proxyToBackend(`/api/v1/campaigns/${id}/steps`, {
        method: 'GET',
    })
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json().catch(() => null)
    return proxyToBackend(`/api/v1/campaigns/${id}/steps`, {
        method: 'POST',
        body,
    })
}
