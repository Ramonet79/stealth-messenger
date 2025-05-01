// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'  // ajusta la ruta a tus tipos generados

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // Mantener la sesión tras recarga
      persistSession: true,
      // Refrescar token automáticamente
      autoRefreshToken: true,
      // Detectar tokens en la URL (útil al confirmar email, etc.)
      detectSessionInUrl: true,
    },
    // Opcional: timeout, no retry, etc.
    // global: { fetch: customFetch },
  }
)
