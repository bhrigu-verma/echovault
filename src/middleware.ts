import { createServerClient, isBrowser } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Demo mode check
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function middleware(request: NextRequest) {
  // In demo mode, skip auth checks
  if (isDemoMode) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isDashboard = request.nextUrl.pathname.startsWith('/vault') ||
                      request.nextUrl.pathname.startsWith('/inbox') ||
                      request.nextUrl.pathname.startsWith('/insights') ||
                      request.nextUrl.pathname.startsWith('/graph') ||
                      request.nextUrl.pathname.startsWith('/settings')

  // Protected routes
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged in users away from login
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/vault', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
