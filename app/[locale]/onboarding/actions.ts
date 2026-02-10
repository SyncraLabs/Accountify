'use server'

import { createClient } from '@/lib/supabase/server'

export async function hasCompletedAppOnboarding(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return true // Don't show onboarding if not logged in

    const { data, error } = await supabase
        .from('user_onboarding_flags')
        .select('app_intro_completed')
        .eq('user_id', user.id)
        .single()

    if (error || !data) return false
    return data.app_intro_completed || false
}

export async function completeAppOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('user_onboarding_flags')
        .upsert({
            user_id: user.id,
            app_intro_completed: true,
            app_intro_completed_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error completing app onboarding:', error)
        return { error: error.message }
    }

    return { success: true }
}
