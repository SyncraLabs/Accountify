import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe features will not work.')
}

// Use a dummy key for build time if not provided - Stripe operations will fail at runtime
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-01-28.clover',
    typescript: true,
})
