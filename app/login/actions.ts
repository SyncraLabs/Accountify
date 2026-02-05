'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error)
        // Translate common Supabase errors
        let message = error.message
        if (error.message === 'Invalid login credentials') {
            message = 'Credenciales inválidas. Verifica tu email y contraseña.'
        } else if (error.message.includes('Email not confirmed')) {
            message = 'Email no confirmado. Por favor verifica tu correo.'
        }

        return redirect(`/login?message=Error: ${encodeURIComponent(message)}`)
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
    const origin = originHeader || siteUrl || 'https://accountify-azure.vercel.app'

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
            return redirect('/login?message=Error: Demasiados intentos. Por favor espera un momento.')
        }
        if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
            return redirect('/login?message=Error: Este correo ya está registrado.')
        }
        return redirect(`/login?message=Error: ${encodeURIComponent(error.message)}`)
    }

    // Check if user already exists but obfuscated (Supabase security setting)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return redirect('/login?message=Error: Este correo ya está registrado. Por favor inicia sesión.')
    }

    if (!data.session) {
        return redirect('/login?message=Registro exitoso. Revisa tu email para confirmar tu cuenta.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
