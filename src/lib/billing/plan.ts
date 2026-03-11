/**
 * Plan gating helper — single source of truth for feature access.
 *
 * All plan checks in route handlers should import from here so that
 * changing limits / tier logic only requires editing one file.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------
export const FREE_DOC_LIMIT = 3   // uploads per calendar month

export const PLAN_DOC_LIMITS: Record<string, number> = {
  free:         3,
  starter:      20,
  professional: 200,
  enterprise:   Infinity,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Plan = 'free' | 'starter' | 'professional' | 'enterprise'

const PAID_PLANS: Plan[] = ['starter', 'professional', 'enterprise']

interface PlanInfo {
  plan: Plan
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeSubscriptionStatus: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch the current plan for a user. Falls back to 'free' if profile missing. */
export async function getUserPlan(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
): Promise<PlanInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await supabase
    .from('profiles')
    .select('plan, stripe_customer_id, stripe_subscription_id, stripe_subscription_status')
    .eq('id', userId)
    .single() as { data: any }

  return {
    plan: (data?.plan ?? 'free') as Plan,
    stripeCustomerId: data?.stripe_customer_id ?? null,
    stripeSubscriptionId: data?.stripe_subscription_id ?? null,
    stripeSubscriptionStatus: data?.stripe_subscription_status ?? null,
  }
}

/** Returns true when the user is on any paid plan. */
export async function isPro(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
): Promise<boolean> {
  const { plan } = await getUserPlan(userId, supabase)
  return PAID_PLANS.includes(plan)
}

/**
 * Check whether a user has exceeded their monthly document limit.
 * Enterprise users are always allowed. All others are checked against their plan limit.
 */
export async function checkDocLimit(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const { plan } = await getUserPlan(userId, supabase)
  const limit = PLAN_DOC_LIMITS[plan] ?? FREE_DOC_LIMIT

  if (limit === Infinity) return { allowed: true, used: 0, limit: Infinity }

  // Count documents uploaded this calendar month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  const used = count ?? 0
  return {
    allowed: used < limit,
    used,
    limit,
  }
}
