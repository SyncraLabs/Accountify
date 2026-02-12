import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SubscriptionTier } from '@/lib/subscription'

// Use service role key for webhook (no user auth context)
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createAdminClient(url, serviceKey)
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Webhook signature verification failed:', message)
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.supabase_user_id
                const tier = (session.metadata?.tier || 'pro') as SubscriptionTier
                const customerId = session.customer as string

                if (userId) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_tier: tier,
                            stripe_customer_id: customerId,
                        })
                        .eq('id', userId)

                    console.log(`✅ User ${userId} upgraded to ${tier}`)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object
                const customerId = subscription.customer as string
                const tier = subscription.metadata?.tier as SubscriptionTier

                if (tier) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('stripe_customer_id', customerId)
                        .single()

                    if (profile) {
                        // Check if subscription is still active
                        const isActive = ['active', 'trialing'].includes(subscription.status)

                        await supabase
                            .from('profiles')
                            .update({
                                subscription_tier: isActive ? tier : 'free',
                            })
                            .eq('id', profile.id)

                        console.log(`✅ User ${profile.id} subscription updated: ${isActive ? tier : 'free'}`)
                    }
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const customerId = subscription.customer as string

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                        })
                        .eq('id', profile.id)

                    console.log(`✅ User ${profile.id} subscription cancelled — reverted to free`)
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object
                const customerId = invoice.customer as string

                console.warn(`⚠️ Payment failed for customer ${customerId}`)
                // Optionally: send notification, downgrade after grace period, etc.
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }
    } catch (error: unknown) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
