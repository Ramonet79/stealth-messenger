
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'  // Ajusta la ruta si tu alias difiere

// Debug logs para verificar que las variables están disponibles
console.log('URL env:', import.meta.env.VITE_SUPABASE_URL)
console.log('KEY env:', import.meta.env.VITE_SUPABASE_ANON_KEY)

// Estas variables deben existir en tu .env(.local):
// VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
// VITE_SUPABASE_ANON_KEY=pk_XXXXXXXXXXXXXXXXXXXXXX
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si alguna no está definida, lanzamos un error inmediatamente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '🚨 Necesitas definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env'
  )
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // Mantiene la sesión tras recarga
      persistSession: true,
      // Renueva el token automáticamente
      autoRefreshToken: true,
      // Detecta tokens en la URL (confirmación por email, magic link, etc.)
      detectSessionInUrl: true,
    },
  }
)
