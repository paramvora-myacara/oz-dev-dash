import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, password')
    .eq('email', email)
    .single()
  if (error || !data || data.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const basic = Buffer.from(`${email}:${password}`).toString('base64')
  const cookieStore = await cookies()
  
  // Check if we're in production (HTTPS) or development (HTTP)
  const isSecure = process.env.NODE_ENV === 'production'
  
  // Set httpOnly cookie for server-side auth
  cookieStore.set('oz_admin_basic', basic, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
  })
  
  // Set client-readable cookie for UI state
  cookieStore.set('oz_admin_ui', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
  })

  return NextResponse.json({ userId: data.id, email: data.email })
} 