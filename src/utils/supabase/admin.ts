import 'server-only'
import { createServerClient } from '@supabase/ssr'

// Admin client using anon key for admin table operations (no RLS on admin tables)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // We do not attach cookie management for admin client; no auth cookies needed for anon key
  return createServerClient(url, anonKey, {
    cookies: {
      get() {
        return undefined
      },
      set() {},
      remove() {},
    },
  })
} 