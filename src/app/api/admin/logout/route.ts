import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const jar = await cookies()
  
  // Check if we're in production (HTTPS) or development (HTTP)
  const isSecure = process.env.NODE_ENV === 'production'
  
  // Clear httpOnly cookie
  jar.set('oz_admin_basic', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 0,
  })
  
  return NextResponse.json({ ok: true })
} 