-- SpecSense AI — Supabase Schema
-- Run this in your Supabase SQL Editor (Settings → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING

-- ============================================================
-- PROFILES (extends auth.users for plan/billing data)
-- ============================================================
create table if not exists public.profiles (
  id                         uuid references auth.users(id) on delete cascade primary key,
  email                      text not null,
  full_name                  text,
  plan                       text not null default 'free',  -- 'free' | 'pro'
  stripe_customer_id         text unique,
  stripe_subscription_id     text unique,
  stripe_subscription_status text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: users read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: users update own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  filename        text not null,
  storage_path    text not null,
  status          text not null default 'uploaded'
                  check (status in ('uploaded', 'processing', 'ready', 'error')),
  extracted_text  text,
  extracted_specs jsonb,
  -- additional metadata (helpful for UI, not required by base spec)
  file_size       bigint,
  mime_type       text,
  page_count      int,
  created_at      timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents: users read own"
  on public.documents for select  using (auth.uid() = user_id);
create policy "documents: users insert own"
  on public.documents for insert  with check (auth.uid() = user_id);
create policy "documents: users update own"
  on public.documents for update  using (auth.uid() = user_id);
create policy "documents: users delete own"
  on public.documents for delete  using (auth.uid() = user_id);

-- ============================================================
-- DOC_CHUNKS (text chunks for RAG retrieval)
-- ============================================================
create table if not exists public.doc_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references public.documents(id) on delete cascade not null,
  chunk_index  int not null,
  content      text not null,
  created_at   timestamptz not null default now()
);

alter table public.doc_chunks enable row level security;

-- Chunks inherit access from their parent document
create policy "doc_chunks: users read own"
  on public.doc_chunks for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id and d.user_id = auth.uid()
  ));

create policy "doc_chunks: users insert own"
  on public.doc_chunks for insert
  with check (exists (
    select 1 from public.documents d
    where d.id = document_id and d.user_id = auth.uid()
  ));

create policy "doc_chunks: users delete own"
  on public.doc_chunks for delete
  using (exists (
    select 1 from public.documents d
    where d.id = document_id and d.user_id = auth.uid()
  ));

-- ============================================================
-- CHAT_MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references public.documents(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  created_at   timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: users read own"
  on public.chat_messages for select using (auth.uid() = user_id);
create policy "chat_messages: users insert own"
  on public.chat_messages for insert with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_documents_user_id      on public.documents(user_id);
create index if not exists idx_documents_created_at   on public.documents(created_at desc);
create index if not exists idx_doc_chunks_document_id on public.doc_chunks(document_id);
create index if not exists idx_doc_chunks_index       on public.doc_chunks(document_id, chunk_index);
create index if not exists idx_chat_messages_doc_id   on public.chat_messages(document_id);
create index if not exists idx_chat_messages_created  on public.chat_messages(created_at);

-- ============================================================
-- STORAGE — bucket: "documents"
-- Upload path: {user_id}/{document_id}/original.{ext}
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,  -- 50 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Drop old policies so re-runs don't fail
drop policy if exists "Users can upload own documents" on storage.objects;
drop policy if exists "Users can view own documents"   on storage.objects;
drop policy if exists "Users can delete own documents" on storage.objects;
drop policy if exists "storage: users upload own"      on storage.objects;
drop policy if exists "storage: users read own"        on storage.objects;
drop policy if exists "storage: users delete own"      on storage.objects;

create policy "storage: users upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: users read own"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: users delete own"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
