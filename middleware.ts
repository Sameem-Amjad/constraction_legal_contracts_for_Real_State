import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { locales, defaultLocale } from './i18n'
import { SUPABASE_SCHEMA } from './lib/supabase/schema'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const protectedPaths = ['/dashboard', '/profile', '/contracts', '/checkout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, and admin (admin auth is handled in layout)
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = intlMiddleware(request)

  const pathnameLocale = locales.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  )
  const pathWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length) || '/'
    : pathname

  const isProtected = protectedPaths.some(
    (p) =>
      pathWithoutLocale === p ||
      pathWithoutLocale.startsWith(`${p}/`)
  )

  if (!isProtected) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: SUPABASE_SCHEMA },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (
          cookiesToSet: Array<{
            name: string
            value: string
            options: CookieOptions
          }>
        ) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = pathnameLocale ?? defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
