export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ----------------------------------------------------------------
// Row types — mirror supabase/schema.sql exactly
// ----------------------------------------------------------------

export interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: string                           // 'free' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  filename: string
  storage_path: string
  status: 'uploaded' | 'processing' | 'ready' | 'error'
  extracted_text: string | null
  extracted_specs: Json | null
  // optional metadata columns (useful for UI, stored alongside core spec)
  file_size: number | null
  mime_type: string | null
  page_count: number | null
  created_at: string
}

export interface DocChunk {
  id: string
  document_id: string
  chunk_index: number
  content: string
  created_at: string
}

export interface ChatMessage {
  id: string
  document_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: string                         // active | trialing | past_due | canceled | unpaid
  price_id: string
  current_period_end: string             // ISO timestamp
  created_at: string
  updated_at: string
}
