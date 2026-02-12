'use server'

import { createClient } from '@/lib/supabase/server'
import { SubscriptionTier, TIER_LIMITS } from './subscription'

// ============================================
// SERVER-SIDE SUBSCRIPTION HELPERS
// ============================================

export interface UserSubscriptionInfo {
    tier: SubscriptionTier
    stripeCustomerId: string | null
    aiCoachUsesThisMonth: number
    aiCoachResetDate: string | null
}

/**
 * Get the current user's subscription info from the database
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscriptionInfo> {
    const supabase = await createClient()

    let uid = userId
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        uid = user.id
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id, ai_coach_uses_this_month, ai_coach_reset_date')
        .eq('id', uid)
        .single()

    return {
        tier: (profile?.subscription_tier as SubscriptionTier) || 'free',
        stripeCustomerId: profile?.stripe_customer_id || null,
        aiCoachUsesThisMonth: profile?.ai_coach_uses_this_month || 0,
        aiCoachResetDate: profile?.ai_coach_reset_date || null,
    }
}

/**
 * Get computed limits for a user based on their tier
 */
export async function getUserLimits(userId?: string) {
    const sub = await getUserSubscription(userId)
    const limits = TIER_LIMITS[sub.tier]
    return {
        ...limits,
        tier: sub.tier,
        aiCoachUsesRemaining: limits.aiCoachUsesPerMonth === Infinity
            ? Infinity
            : Math.max(0, limits.aiCoachUsesPerMonth - sub.aiCoachUsesThisMonth),
    }
}

/**
 * Increment AI Coach usage for the current user.
 * Resets counter if we're in a new month.
 */
export async function incrementAICoachUsage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const supabase = await createClient()
    const sub = await getUserSubscription(userId)
    const limits = TIER_LIMITS[sub.tier]

    // Check if we need to reset (new month)
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    let currentUses = sub.aiCoachUsesThisMonth

    if (!sub.aiCoachResetDate || sub.aiCoachResetDate < currentMonth) {
        // Reset for new month
        currentUses = 0
        await supabase
            .from('profiles')
            .update({
                ai_coach_uses_this_month: 0,
                ai_coach_reset_date: currentMonth,
            })
            .eq('id', userId)
    }

    // Check limit
    if (limits.aiCoachUsesPerMonth !== Infinity && currentUses >= limits.aiCoachUsesPerMonth) {
        return {
            allowed: false,
            remaining: 0,
        }
    }

    // Increment
    const newUses = currentUses + 1
    await supabase
        .from('profiles')
        .update({
            ai_coach_uses_this_month: newUses,
            ai_coach_reset_date: currentMonth,
        })
        .eq('id', userId)

    const remaining = limits.aiCoachUsesPerMonth === Infinity
        ? Infinity
        : limits.aiCoachUsesPerMonth - newUses

    return { allowed: true, remaining }
}

/**
 * Update a user's subscription tier (called from Stripe webhook)
 */
export async function updateSubscriptionTier(
    userId: string,
    tier: SubscriptionTier,
    stripeCustomerId?: string
): Promise<void> {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
        subscription_tier: tier,
    }

    if (stripeCustomerId) {
        updateData.stripe_customer_id = stripeCustomerId
    }

    await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
}

/**
 * Get count of user's habits
 */
export async function getUserHabitCount(userId: string): Promise<number> {
    const supabase = await createClient()
    const { count } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    return count || 0
}

/**
 * Get count of user's groups
 */
export async function getUserGroupCount(userId: string): Promise<number> {
    const supabase = await createClient()
    const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    return count || 0
}
