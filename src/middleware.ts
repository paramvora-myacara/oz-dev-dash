import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The middleware function, as required by Next.js
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forwardedHost = request.headers.get('x-forwarded-host');

  // Removed ozlistings-only asset rewrite; asset proxying is handled in oz-homepage

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  // Host-based routing for whitelabeled domains (restored)
  {
    const { pathname: currentPathname } = request.nextUrl
    const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
    const hostname = rawHost.split(':')[0]?.toLowerCase() || ''

    const isInternal =
      currentPathname.startsWith('/_next') ||
      currentPathname.startsWith('/api') ||
      currentPathname === '/favicon.ico'

    if (hostname && !isInternal) {
      const { data: domain } = await supabase
        .from('domains')
        .select('listing_slug')
        .eq('hostname', hostname)
        .maybeSingle()

      if (domain?.listing_slug) {
        const slug = domain.listing_slug
        const isEditPath = currentPathname.includes('/edit')
        const isAdminPath = currentPathname.startsWith('/admin')
        const alreadySlugged = currentPathname === `/${slug}` || currentPathname.startsWith(`/${slug}/`)

        // Block admin and edit routes on whitelabeled domains
        if (isAdminPath || isEditPath) {
          return NextResponse.redirect(new URL('/', request.url))
        }

        // For non-edit paths, rewrite to slugged version
        if (!alreadySlugged) {
          const url = request.nextUrl.clone()
          url.pathname = currentPathname === '/' ? `/${slug}` : `/${slug}${currentPathname}`
          return NextResponse.rewrite(url)
        }
      }
    }
  }

  // Admin protection for /admin and /{slug}/edit routes
  const { pathname: pathnameForAdmin } = request.nextUrl

  // Check if this is an admin route that needs protection
  const isAdminRoute = pathnameForAdmin.startsWith('/admin')
  const isEditRoute = pathnameForAdmin.includes('/edit')

  if (isAdminRoute || isEditRoute) {
    // Skip protection for login page to avoid redirect loops
    if (pathnameForAdmin === '/admin/login') {
      return response
    }

    // Check for admin cookie
    const adminCookie = request.cookies.get('oz_admin_basic')
    if (!adminCookie?.value) {
      // Redirect to login with return URL
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('returnUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // For edit routes, we'll do additional authorization in the page component
    // since we need the slug to check permissions
  }

  return response
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 