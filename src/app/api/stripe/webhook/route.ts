/**
 * POST /api/stripe/webhook
 * Receives Stripe webhook events and updates subscription state.
 * Alias of /api/webhooks/stripe — kept for canonical REST path.
 *
 * Register THIS URL in the Stripe Dashboard if you prefer /api/stripe/webhook,
 * or use /api/webhooks/stripe — both are equivalent.
 */
export { POST } from '@/app/api/webhooks/stripe/route'
