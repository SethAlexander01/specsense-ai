# SpecSense AI — Stripe Billing Setup

## Pricing tiers

| Plan | Price | Limits |
|------|-------|--------|
| Free | $0 / month | 3 uploads per calendar month, spec extraction only (no chat, no PDF export) |
| Pro  | $249 / month | Unlimited uploads, AI chat, PDF export, priority processing |

---

## 1. Create a Stripe account

Go to [stripe.com](https://stripe.com) and create an account (or use test mode).

## 2. Create a Product and Price

1. In Stripe Dashboard → Products → **Add product**
2. Name: `SpecSense AI Pro`
3. Pricing: **$249/month**, recurring
4. Save and copy the **Price ID** (starts with `price_`)

## 3. Get API keys

From Stripe Dashboard → Developers → API Keys:

```bash
STRIPE_SECRET_KEY=sk_test_...                    # Secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Publishable key
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...        # From step 2
NEXT_PUBLIC_APP_URL=http://localhost:3000         # Your app URL
```

## 4. Run the Supabase migration

Open the **Supabase SQL Editor** and run:

```sql
-- Subscriptions table (mirrors Stripe subscription state)
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id     text not null,
  stripe_subscription_id text not null unique,
  status                 text not null,   -- active | trialing | past_due | canceled | unpaid
  price_id               text not null,
  current_period_end     timestamptz not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- RLS: users can only read their own subscription row
alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- profiles additions (run only if columns don't exist yet)
alter table public.profiles
  add column if not exists stripe_customer_id         text,
  add column if not exists stripe_subscription_id     text,
  add column if not exists stripe_subscription_status text,
  add column if not exists plan                       text not null default 'free';
```

## 5. Set up Webhooks (local development)

Install the Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (scoop)
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Login and listen:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the **webhook signing secret** (starts with `whsec_`) into:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 6. Set up Webhooks (production)

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** into your production env vars.

## 7. Configure Customer Portal

1. Stripe Dashboard → Settings → **Customer portal**
2. Enable it and configure what customers can manage (cancel, update payment).
3. Activate the portal.

## 8. Test the full flow

```bash
# Start dev server
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Use Stripe test card: 4242 4242 4242 4242
# Any future expiry, any CVC
```

After subscribing, your `profiles.plan` should update to `'pro'`.

## Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0025 0000 3155 | 3D Secure required |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/stripe/checkout` | Create a Stripe Checkout session |
| POST | `/api/stripe/portal` | Open the Stripe Customer Portal |
| POST | `/api/stripe/webhook` | Receive Stripe webhook events |

The `/api/billing/checkout` and `/api/billing/portal` paths are aliases.

## Subscription lifecycle

- **Webhook** `customer.subscription.created/updated` → sets `profiles.plan = 'pro'`
- **Webhook** `customer.subscription.deleted` → sets `profiles.plan = 'free'`
- **Webhook** `invoice.payment_failed` → syncs subscription status

The `supabase_user_id` is stored in the Stripe subscription metadata to link accounts.

## Plan gating

All feature gates live in `src/lib/billing/plan.ts`:

- `isPro(userId, supabase)` — returns `true` for Pro users
- `checkDocLimit(userId, supabase)` — returns `{ allowed, used, limit }` for upload limits

| Feature | Free | Pro |
|---------|------|-----|
| Upload documents | 3/month | Unlimited |
| Spec extraction | Yes | Yes |
| AI chat | No | Yes |
| PDF export | No | Yes |
