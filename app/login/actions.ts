'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in a real app, use Zod to validate
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error)
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Get origin with fallback
    const originHeader = (await headers()).get('origin')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const origin = originHeader || siteUrl || 'https://accountify-azure.vercel.app' // Fallback to production URL if all else fails

    console.log('Signup attempt:', { email, origin, hasSiteUrl: !!siteUrl })

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Signup Error:', error);
        if (error.code === '429' || error.message.includes('rate_limit')) {
            return redirect('/login?message=Demasiados intentos. Por favor espera un momento.')
        }
        return redirect(`/login?message=Error: ${encodeURIComponent(error.message)}`)
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return redirect('/login?message=Este correo ya está registrado. Por favor inicia sesión.')
    }

    if (!data.session) {
        return redirect('/login?message=Por favor revisa tu email para confirmar tu cuenta. Si no lo ves, revisa Spam.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
