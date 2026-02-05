import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type') as EmailOtpType | null
    const next = requestUrl.searchParams.get('next') || '/'
    const origin = requestUrl.origin

    const supabase = await createClient()

    // Handle PKCE flow (email confirmation, password reset)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (error) {
            console.error('OTP Verification Error:', error)
            return NextResponse.redirect(`${origin}/login?message=Error: ${encodeURIComponent(error.message)}`)
        }

        // For password recovery, redirect to update-password page
        if (type === 'recovery') {
            return NextResponse.redirect(`${origin}/auth/update-password`)
        }

        // For email confirmation, redirect to the next page or dashboard
        return NextResponse.redirect(`${origin}${next === '/' ? '/dashboard' : next}`)
    }

    // Handle OAuth flow (code exchange)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Code Exchange Error:', error)
            return NextResponse.redirect(`${origin}/login?message=Error: ${encodeURIComponent(error.message)}`)
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}${next === '/' ? '/dashboard' : next}`)
}

