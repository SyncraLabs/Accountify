import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
    // If next-intl already returned a redirect (3xx), we should probably respect it
    // But we still need to manage cookies if it's not a redirect, or even if it is?
    // Usually on redirect we might just let it go, but let's be careful.

    const supabaseResponse = response;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )

                    // We need to clone the response to set cookies if it's not mutable?
                    // createMiddleware returns a NextResponse, so we can likely set cookies on it.
                    // However, avoiding "response is read-only" errors.
                    // Ideally we copy cookies to the existing response.

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run Supabase code during static generation
    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/' &&
        !request.nextUrl.pathname.includes('/login') && // Handle /en/login etc
        !request.nextUrl.pathname.includes('/auth')     // Handle /en/auth etc
    ) {
        // Check if we are on a public route or root
        // We need to be careful with i18n paths (e.g. /en, /es)
        // next-intl middleware handles strict routing, so request.nextUrl.pathname might be /en/...

        const isPublic =
            request.nextUrl.pathname === '/' ||
            request.nextUrl.pathname === '/en' ||
            request.nextUrl.pathname === '/es';

        if (!isPublic) {
            // no user, potentially respond by redirecting the user to the login page
            const url = request.nextUrl.clone()
            // We should respect the locale?
            // If the user is on /en/dashboard, redirect to /en/login
            // But doing this manually is hard.
            // Using intl redirect or just hard redirecting to /login (which will be handled by middleware again?)
            // If we redirect to /login, intl middleware will kick in next request and make it /en/login or /es/login
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
