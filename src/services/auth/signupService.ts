// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  // 1) Solo registramos en Auth
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

  // 2) Creamos el patrón de desbloqueo (opcional)
  const userId = data.user!.id
  const { error: patternError } = await supabase
    .from('unlock_patterns')
    .insert({ user_id: userId, pattern: '[]' })

  if (patternError) {
    console.warn('unlock_pattern no creado:', patternError.message)
  }

  // 3) ¡Listo! El trigger en la base se encargará de poblar `profiles`.
  return { data, error: null }
}
