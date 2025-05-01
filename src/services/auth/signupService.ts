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

  // 2) Insertar perfil en tu tabla 'profiles'
  const { error: insertProfileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      email,
      created_at: new Date().toISOString()
      // las otras columnas (avatar_url, phone…) son opcionales
    });

  if (insertProfileError) {
    // Esto fallará si las policies están mal; ahora lo verás en consola
    console.error('Error insertando profile:', insertProfileError);
    return { data: null, error: { message: insertProfileError.message } };
  }

  // 3) (Opcional) Crear patrón vacío
  const { error: insertPatternError } = await supabase
    .from('unlock_patterns')
    .insert({ user_id: userId, pattern: '[]' });
  if (insertPatternError) {
    console.error('Error insertando unlock_pattern:', insertPatternError);
    // no interrumpimos, pues es secundario
  }

  return { data, error: null };
};
