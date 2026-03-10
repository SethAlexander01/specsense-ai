# SpecSense AI

Engineering spec & drawing analyzer powered by Claude AI.

Upload engineering PDFs → extract structured specifications → chat with your docs → export professional reports.

## Stack

- **Next.js 16** App Router · TypeScript · Tailwind CSS · ESLint
- **Supabase** — Postgres + Auth + Storage
- **Anthropic Claude** (`claude-sonnet-4-6`) — spec extraction + RAG chat
- **Stripe** — subscriptions (Free / Pro)
- **pdf-lib** — server-side PDF report generation
- **pdf-parse** — server-side text extraction

## Setup

### 1. Install

```bash
# npm
npm install

# pnpm
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see docs/SUPABASE.md and docs/STRIPE.md
```

### 3. Supabase

Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL editor.
Full setup: [docs/SUPABASE.md](docs/SUPABASE.md)

### 4. Stripe

Full setup: [docs/STRIPE.md](docs/STRIPE.md)

```bash
# Forward webhooks locally (separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Run

```bash
npm run dev
# or
pnpm dev
```

Open **http://localhost:3000**

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/login` | Sign in |
| `/auth/signup` | Create account |
| `/dashboard` | Document list (protected, sidebar layout) |
| `/dashboard/upload` | Upload a PDF/image |
| `/dashboard/docs/[id]` | Document view — specs panel + chat |
| `/billing` | Subscription management |

## Demo flow

1. Sign up → `/auth/signup`
2. Upload a PDF → `/dashboard/upload`
3. View extracted specs → `/dashboard/docs/[id]`
4. Chat with document (Pro only)
5. Export PDF report (Pro only)
6. Manage plan → `/billing`

## File tree

```
specsense-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing
│   │   ├── login/page.tsx                # /login
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Sidebar layout (server, auth-gated)
│   │   │   ├── page.tsx                  # /dashboard — document list
│   │   │   ├── upload/page.tsx           # /dashboard/upload
│   │   │   └── docs/[id]/page.tsx        # /dashboard/docs/[id]
│   │   ├── billing/page.tsx
│   │   └── api/
│   │       ├── extract/route.ts          # POST — PDF parse + Claude extraction
│   │       ├── chat/route.ts             # POST — RAG chat (Pro)
│   │       ├── export/route.ts           # POST — PDF report (Pro)
│   │       ├── billing/checkout/route.ts # POST — Stripe checkout
│   │       ├── billing/portal/route.ts   # POST — Stripe portal
│   │       └── webhooks/stripe/route.ts  # POST — Stripe webhooks
│   ├── components/
│   │   ├── sidebar.tsx                   # Dashboard sidebar
│   │   ├── navbar.tsx                    # Top navbar (landing/auth)
│   │   ├── document-view.tsx             # Specs + chat tabs
│   │   └── ui/                           # Button, Badge, Card, Toast
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── supabase/middleware.ts
│   │   ├── stripe.ts
│   │   ├── pdf-extract.ts
│   │   ├── spec-schema.ts                # Zod schemas
│   │   ├── report-generator.ts           # pdf-lib builder
│   │   └── utils.ts
│   ├── types/database.ts
│   └── proxy.ts                          # Auth middleware (Next.js 16)
├── supabase/schema.sql
├── docs/
│   ├── SUPABASE.md
│   └── STRIPE.md
└── .env.example
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Stripe Pro price ID |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `http://localhost:3000`) |
