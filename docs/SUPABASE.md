# Supabase Setup Guide

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon key** from Settings → API.
3. Note your **service_role key** from Settings → API (keep this secret).

## 2. Run the schema

1. Open the **SQL Editor** in your Supabase dashboard.
2. Paste and run the contents of `/supabase/schema.sql`.
3. This creates:
   - `profiles` table (auto-populated via trigger on signup)
   - `documents` table — stores file metadata + `extracted_specs jsonb` directly
   - `doc_chunks` table (RAG text chunks, no `user_id` — access gated via parent document)
   - `chat_messages` table (chat history)
   - Storage bucket `documents` with RLS policies

   > **Note:** There is no separate `specs` table. All extracted spec data lives in `documents.extracted_specs` as JSONB.

## 3. Configure Auth

1. Go to Authentication → Settings.
2. Set **Site URL** to `http://localhost:3000` (development).
3. Add `http://localhost:3000/auth/callback` to **Redirect URLs**.
4. Enable **Email** provider (enabled by default).
5. For production, set your actual domain.

## 4. Storage

The schema SQL creates the `documents` storage bucket automatically.
Verify it exists in Storage → Buckets.

Files are uploaded to path: `{userId}/{documentId}/original.{ext}`

The upload flow creates the document DB row first (to obtain the UUID), then uploads to storage, then patches `storage_path` on the row.

## 5. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 6. Verify setup

```bash
pnpm dev
# Open http://localhost:3000
# Sign up → you should see a profile row created automatically
```

## RLS Policies

All tables use Row Level Security. Users can only access their own data.
The `profiles` table is populated by a database trigger on `auth.users` insert.

## Production checklist

- [ ] Update Site URL in Auth settings
- [ ] Add production domain to Redirect URLs
- [ ] Enable email confirmations if desired
- [ ] Consider enabling 2FA
- [ ] Set up backups
