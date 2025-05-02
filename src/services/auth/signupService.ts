
// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  // 1) Registrar en Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, recovery_email: recoveryEmail, email_confirmed: true }
    }
  });
  if (signUpError) {
    // si el email ya existe o hay otro error, nótalo aquí
    return { data: null, error: { message: signUpError.message } };
  }
  if (!data.user) {
    return { data: null, error: { message: 'No se creó el usuario.' } };
  }

  const userId = data.user.id;

  try {
    // 2) Insertar perfil en tu tabla 'profiles'
    const { error: insertProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertProfileError) {
      console.error('Error insertando profile:', insertProfileError);
      
      // Si el perfil falla por RLS, intentamos usar la función SQL segura
      const { error: functionError } = await supabase.rpc('ensure_user_profile', {
        user_id: userId,
        user_email: email,
        user_name: username
      });
      
      if (functionError) {
        console.error('Error usando ensure_user_profile:', functionError);
        return { data: null, error: { message: 'Error al crear el perfil: ' + functionError.message } };
      }
    }

    // 3) Crear patrón vacío
    const { error: insertPatternError } = await supabase
      .from('unlock_patterns')
      .insert({ user_id: userId, pattern: '[]' });
    if (insertPatternError) {
      console.error('Error insertando unlock_pattern:', insertPatternError);
      // no interrumpimos, pues es secundario
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Error general en signUpUser:', err);
    return { data: null, error: { message: err.message || 'Error desconocido al registrar usuario' } };
  }
};
