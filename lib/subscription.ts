// ============================================
// SUBSCRIPTION TIER DEFINITIONS & HELPERS
// ============================================

export type SubscriptionTier = 'free' | 'pro' | 'leader'

export interface TierLimits {
    maxHabits: number
    maxGroups: number
    maxSquadSize: number
    aiCoachUsesPerMonth: number
    streakFreezesPerMonth: number
    advancedAnalytics: boolean
    betaAccess: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        maxHabits: 10,
        maxGroups: 1,
        maxSquadSize: 5,
        aiCoachUsesPerMonth: 3,
        streakFreezesPerMonth: 0,
        advancedAnalytics: false,
        betaAccess: false,
    },
    pro: {
        maxHabits: Infinity,
        maxGroups: Infinity,
        maxSquadSize: 25,
        aiCoachUsesPerMonth: 10,
        streakFreezesPerMonth: 2,
        advancedAnalytics: true,
        betaAccess: true,
    },
    leader: {
        maxHabits: Infinity,
        maxGroups: Infinity,
        maxSquadSize: Infinity,
        aiCoachUsesPerMonth: Infinity,
        streakFreezesPerMonth: Infinity,
        advancedAnalytics: true,
        betaAccess: true,
    },
}

export interface TierPricing {
    monthly: number // in EUR
    annual: number  // in EUR (total per year)
    annualMonthly: number // effective monthly price with annual
}

export const TIER_PRICING: Record<Exclude<SubscriptionTier, 'free'>, TierPricing> = {
    pro: {
        monthly: 4.99,
        annual: 39.99,
        annualMonthly: 3.33,
    },
    leader: {
        monthly: 9.99,
        annual: 79.99,
        annualMonthly: 6.67,
    },
}

// Stripe Price IDs (set in environment)
export const STRIPE_PRICE_IDS = {
    pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
    leader_monthly: process.env.STRIPE_LEADER_MONTHLY_PRICE_ID || '',
    leader_annual: process.env.STRIPE_LEADER_ANNUAL_PRICE_ID || '',
}

// ============================================
// LIMIT CHECKING HELPERS
// ============================================

export function canCreateHabit(tier: SubscriptionTier, currentCount: number): boolean {
    return currentCount < TIER_LIMITS[tier].maxHabits
}

export function canJoinGroup(tier: SubscriptionTier, currentGroupCount: number): boolean {
    return currentGroupCount < TIER_LIMITS[tier].maxGroups
}

export function canUseAICoach(tier: SubscriptionTier, usesThisMonth: number): boolean {
    return usesThisMonth < TIER_LIMITS[tier].aiCoachUsesPerMonth
}

export function getRemainingAICoachUses(tier: SubscriptionTier, usesThisMonth: number): number {
    const max = TIER_LIMITS[tier].aiCoachUsesPerMonth
    if (max === Infinity) return Infinity
    return Math.max(0, max - usesThisMonth)
}

export function getTierDisplayName(tier: SubscriptionTier): string {
    switch (tier) {
        case 'free': return 'Gratis'
        case 'pro': return 'Pro'
        case 'leader': return 'Squad Leader'
    }
}

export function getTierBadgeColor(tier: SubscriptionTier): string {
    switch (tier) {
        case 'free': return 'text-zinc-400 bg-zinc-800'
        case 'pro': return 'text-primary bg-primary/20'
        case 'leader': return 'text-yellow-400 bg-yellow-500/20'
    }
}
