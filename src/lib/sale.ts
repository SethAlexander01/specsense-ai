// ─── SALE CONFIGURATION ──────────────────────────────────────────────────────
//  To START a sale: set SALE_ENABLED to true, adjust salePrice values below.
//  To END a sale:   set SALE_ENABLED back to false.
// ─────────────────────────────────────────────────────────────────────────────

export const SALE_ENABLED = true

export const SALE_BADGE = '50% OFF'   // text shown on each plan card
export const SALE_ENDS  = 'May 28'   // urgency line shown under the section header (set to '' to hide)

export const PLANS = {
  starter: {
    name:         'Starter',
    regularPrice: 79,
    salePrice:    39.5,
    period:       '/mo',
    limit:        '20 drawings per month',
  },
  professional: {
    name:         'Professional',
    regularPrice: 249,
    salePrice:    124.5,
    period:       '/mo',
    limit:        '200 drawings per month',
  },
  enterprise: {
    name:         'Enterprise',
    regularPrice: 499,
    salePrice:    249.5,
    period:       '/mo',
    limit:        'Unlimited drawings',
  },
} as const

export type PlanKey = keyof typeof PLANS

export function activePrice(plan: PlanKey): number {
  return SALE_ENABLED ? PLANS[plan].salePrice : PLANS[plan].regularPrice
}
