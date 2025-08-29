import 'server-only'
import { cookies, headers } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

export interface AdminUser {
  id: string
  email: string
  role: string
}

export async function readBasicAuthCookie(): Promise<{ email: string; password: string } | null> {
  try {
    const jar: any = await cookies()
    const raw: string | undefined = jar?.get?.('oz_admin_basic')?.value
    if (!raw) return null
    const decoded = Buffer.from(raw, 'base64').toString('utf8')
    const [email, password] = decoded.split(':')
    if (!email || !password) return null
    return { email, password }
  } catch {
    const hdrs: any = await headers()
    const cookieHeader: string = hdrs?.get?.('cookie') || ''
    const match = cookieHeader
      .split(';')
      .map((s: string) => s.trim())
      .find((s: string) => s.startsWith('oz_admin_basic='))
    if (!match) return null
    const raw = decodeURIComponent(match.split('=')[1] || '')
    const decoded = Buffer.from(raw, 'base64').toString('utf8')
    const [email, password] = decoded.split(':')
    if (!email || !password) return null
    return { email, password }
  }
}

export async function verifyAdmin(): Promise<AdminUser | null> {
  const creds = await readBasicAuthCookie()
  if (!creds) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, password, role')
    .eq('email', creds.email)
    .single()
  if (error || !data) return null
  if (data.password !== creds.password) return null
  return { id: data.id, email: data.email, role: data.role }
}

export async function verifyAdminCanEditSlug(slug: string): Promise<AdminUser | null> {
  const user = await verifyAdmin()
  if (!user) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_user_listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_slug', slug)
    .maybeSingle()
  if (error) return null
  if (!data) return null
  return user
} 