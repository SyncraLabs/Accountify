import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    const response = intlMiddleware(request)
    return await updateSession(request, response)
}

export const config = {
    matcher: [
        '/',
        '/(es|en)/:path*',
        '/((?!_next/static|_next/image|favicon.ico|api/stripe|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ],
}
