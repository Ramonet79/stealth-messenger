// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'  // ajusta si tu alias es distinto

// Las variables deben estar en tu .env.local con prefijo VITE_
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_ANON_KEY=...
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('🚨 Necesitas definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env')
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
