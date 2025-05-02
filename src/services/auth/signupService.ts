
// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  console.log("SignUpUser iniciado con:", email, username);
  
  // 1) Registrar en Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, recovery_email: recoveryEmail, email_confirmed: true }
    }
  });

  if (signUpError) {
    console.error("Error en auth.signUp:", signUpError);
    return { data: null, error: { message: signUpError.message } };
  }
  
  if (!data.user) {
    console.error("No se creó el usuario correctamente");
    return { data: null, error: { message: 'No se creó el usuario.' } };
  }

  const userId = data.user.id;
  console.log("Usuario creado correctamente con ID:", userId);

  try {
    // 2) Insertar perfil usando directamente la función SQL segura
    // Esto evita problemas de RLS al crear el perfil
    console.log("Intentando crear perfil con RPC directamente");
    const { error: functionError } = await supabase.rpc('ensure_user_profile', {
      user_id: userId,
      user_email: email,
      user_name: username
    });
    
    if (functionError) {
      console.error('Error usando ensure_user_profile:', functionError);
      
      // Intentamos el método alternativo sólo si falla la RPC
      console.log("Intentando método alternativo para crear perfil");
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
        return { data, error: { message: 'Error al crear el perfil: ' + insertProfileError.message } };
      }
    }

    // 3) Crear patrón vacío
    console.log("Creando patrón de desbloqueo");
    const { error: insertPatternError } = await supabase
      .from('unlock_patterns')
      .insert({ user_id: userId, pattern: '[]' });
      
    if (insertPatternError) {
      console.error('Error insertando unlock_pattern:', insertPatternError);
      // no interrumpimos, pues es secundario
    }

    console.log("Registro completo con éxito");
    return { data, error: null };
  } catch (err: any) {
    console.error('Error general en signUpUser:', err);
    return { data: null, error: { message: err.message || 'Error desconocido al registrar usuario' } };
  }
};
