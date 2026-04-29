// ─── SALE CONFIGURATION ──────────────────────────────────────────────────────
//  To START a sale: set SALE_ENABLED to true, adjust salePrice values below.
//  To END a sale:   set SALE_ENABLED back to false.
// ─────────────────────────────────────────────────────────────────────────────

export const SALE_ENABLED = false

export const SALE_BADGE = '20% OFF'   // text shown on each plan card
export const SALE_ENDS  = 'May 31'   // urgency line shown under the section header (set to '' to hide)

export const PLANS = {
  starter: {
    name:         'Starter',
    regularPrice: 79,
    salePrice:    63,
    period:       '/mo',
    limit:        '20 drawings per month',
  },
  professional: {
    name:         'Professional',
    regularPrice: 249,
    salePrice:    199,
    period:       '/mo',
    limit:        '200 drawings per month',
  },
  enterprise: {
    name:         'Enterprise',
    regularPrice: 499,
    salePrice:    399,
    period:       '/mo',
    limit:        'Unlimited drawings',
  },
} as const

export type PlanKey = keyof typeof PLANS

export function activePrice(plan: PlanKey): number {
  return SALE_ENABLED ? PLANS[plan].salePrice : PLANS[plan].regularPrice
}
