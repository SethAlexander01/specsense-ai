import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use service role to bypass RLS for webhook updates
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) return

  const isActive = ['active', 'trialing'].includes(subscription.status)

  await supabase.from('profiles').update({
    plan: isActive ? 'pro' : 'free',
    stripe_subscription_id: subscription.id,
    stripe_subscription_status: subscription.status,
    updated_at: new Date().toISOString(),
  }).eq('id', userId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await updateSubscription(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const supabase = getAdminClient()
        const userId = sub.metadata?.supabase_user_id
        if (userId) {
          await supabase.from('profiles').update({
            plan: 'free',
            stripe_subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription ?? invoice.parent?.subscription_details?.subscription
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId as string)
          await updateSubscription(sub)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
