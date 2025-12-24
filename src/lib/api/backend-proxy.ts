import 'server-only'
import { readBasicAuthCookie } from '@/lib/admin/auth'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

/**
 * Helper function to get Basic auth header from httpOnly cookie
 * This is used by Next.js API proxy routes to forward requests to FastAPI backend
 */
export async function getBackendAuthHeader(): Promise<string | null> {
  const creds = await readBasicAuthCookie()
  if (!creds) return null
  
  const basic = Buffer.from(`${creds.email}:${creds.password}`).toString('base64')
  return `Basic ${basic}`
}

/**
 * Proxy a request to the FastAPI backend
 */
export async function proxyToBackend(
  path: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<Response> {
  const authHeader = await getBackendAuthHeader()
  if (!authHeader) {
    return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = `${BACKEND_API_URL}${path}`
  const headers: Record<string, string> = {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, fetchOptions)
    return response
  } catch (error) {
    console.error('Backend proxy error:', error)
    return new Response(
      JSON.stringify({ detail: 'Failed to connect to backend' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

