// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  const userData = {
    username,
    recovery_email: recoveryEmail || '',
    full_name: username,
    name: username
  };

  console.log("Registrando usuario con metadata:", userData);

  // REGISTRO en Supabase Auth (sin emailRedirectTo)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (signUpError) {
    console.error("Error en signUpUser:", signUpError);
    return { data: null, error: { message: signUpError.message } }
  }

  const userId = data.user!.id;
  console.log("Usuario registrado con ID:", userId);

  // Crear perfil en base de datos
  try {
    const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
      user_id: userId,
      user_email: email,
      user_name: username
    });

    if (rpcError) {
      console.error("Error al crear perfil con RPC:", rpcError);

      // Fallback directo si falla RPC
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          email: email,
          username: username 
        });

      if (insertError) {
        console.error("También falló la inserción directa del perfil:", insertError);
      } else {
        console.log("Perfil creado mediante inserción directa");
      }
    } else {
      console.log("Perfil creado correctamente con RPC");
    }
  } catch (err) {
    console.error("Error inesperado al crear perfil:", err);
  }

  return { data, error: null }
}
