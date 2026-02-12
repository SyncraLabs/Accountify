import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_PRICE_IDS } from '@/lib/subscription'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const { priceId, tier, billingPeriod } = body

        if (!priceId && !tier) {
            return NextResponse.json({ error: 'Missing priceId or tier' }, { status: 400 })
        }

        // Resolve price ID from tier + billing period if not directly provided
        let resolvedPriceId = priceId
        if (!resolvedPriceId && tier && billingPeriod) {
            const key = `${tier}_${billingPeriod}` as keyof typeof STRIPE_PRICE_IDS
            resolvedPriceId = STRIPE_PRICE_IDS[key]
        }

        if (!resolvedPriceId) {
            return NextResponse.json({ error: 'Invalid tier or billing period' }, { status: 400 })
        }

        // Get or create Stripe customer
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, full_name')
            .eq('id', user.id)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                metadata: {
                    supabase_user_id: user.id,
                },
            })
            customerId = customer.id

            // Save Stripe customer ID
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id)
        }

        // Create Stripe Checkout Session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: resolvedPriceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/dashboard?upgrade=success`,
            cancel_url: `${appUrl}/#pricing`,
            metadata: {
                supabase_user_id: user.id,
                tier: tier || 'pro',
            },
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                    tier: tier || 'pro',
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            locale: 'es',
        })

        return NextResponse.json({ url: session.url })
    } catch (error: unknown) {
        console.error('Stripe checkout error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
