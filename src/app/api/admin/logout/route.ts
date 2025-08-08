import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const jar: any = cookies()
  jar.set('oz_admin_basic', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
} 