// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  // 1) Registro en Auth únicamente
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, recovery_email: recoveryEmail }
    }
  })

  if (signUpError) {
    return { data: null, error: { message: signUpError.message } }
  }

  // 2) Crea el patrón de desbloqueo (opcional)
  const userId = data.user!.id
  const { error: patternError } = await supabase
    .from('unlock_patterns')
    .insert({ user_id: userId, pattern: '[]' })

  // No interrumpimos el signup si falla esto
  if (patternError) {
    console.warn('No se pudo crear unlock_pattern:', patternError.message)
  }

  // 3) ¡Listo! El perfil ya lo creó el trigger en la base.
  return { data, error: null }
}
