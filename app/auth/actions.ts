'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { headers } from 'next/headers'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Get origin
    const originHeader = (await headers()).get('origin')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const origin = originHeader || siteUrl || 'https://accountify-azure.vercel.app'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/update-password`,
    })

    if (error) {
        console.error('Reset Password Error:', error)
        return redirect(`/login/forgot-password?message=Error: ${encodeURIComponent(error.message)}`)
    }

    return redirect('/login/forgot-password?message=Revisa tu email para restablecer tu contraseña.')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return redirect('/auth/update-password?message=Error: Las contraseñas no coinciden')
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return redirect(`/auth/update-password?message=Error: ${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
