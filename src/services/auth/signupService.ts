// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  console.log('Iniciando registro de usuario:', { email, username })

  // 1) Registrar en Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        recovery_email: recoveryEmail,
        email_confirmed: true,
      },
    },
  })

  if (signUpError) {
    console.error('Error en auth.signUp:', signUpError)
    return { data: null, error: { message: signUpError.message } }
  }
  if (!data.user) {
    console.error('auth.signUp devolvió sin usuario')
    return { data: null, error: { message: 'No se creó el usuario.' } }
  }

  const userId = data.user.id
  console.log('Usuario creado con ID:', userId)

  // 2) Crear perfil mediante RPC (bypass RLS)
  console.log('Llamando a ensure_user_profile RPC')
  const { error: profileError } = await supabase.rpc('ensure_user_profile', {
    _user_id: userId,
    _username: username,
    _email: email,
  })

  if (profileError) {
    console.error('Error en ensure_user_profile:', profileError)
    return {
      data,
      error: { message: `Error al crear perfil: ${profileError.message}` },
    }
  }

  // 3) Crear patrón de desbloqueo (no crítico)
  console.log('Insertando patrón de desbloqueo inicial')
  const { error: patternError } = await supabase
    .from('unlock_patterns')
    .insert({ user_id: userId, pattern: '[]' })
  if (patternError) {
    console.warn('No se pudo crear unlock_pattern:', patternError.message)
    // No interrumpimos el flujo; es un extra
  }

  console.log('Registro completado con éxito')
  return { data, error: null }
}
