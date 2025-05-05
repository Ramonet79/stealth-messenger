
// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  // Aseguramos que el username siempre se pase en el user_metadata y raw_user_meta_data
  const userData = {
    username,
    recovery_email: recoveryEmail || '',
    full_name: username, // También guardamos en full_name para redundancia
    name: username // Añadimos el campo name para el display_name
  };
  
  console.log("Registrando usuario con metadata:", userData);
  
  // 1) Registramos en Auth con los metadatos enriquecidos
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: window.location.origin + '/auth' // Asegura que la redirección funcione en todas las plataformas
    }
  });

  if (signUpError) {
    console.error("Error en signUpUser:", signUpError);
    return { data: null, error: { message: signUpError.message } }
  }

  const userId = data.user!.id;
  console.log("Usuario registrado con ID:", userId);
  
  // 2) Aseguramos que se cree el perfil llamando a nuestra función RPC
  try {
    const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
      user_id: userId,
      user_email: email,
      user_name: username
    });
    
    if (rpcError) {
      console.error("Error al crear perfil con RPC:", rpcError);
      
      // 3) Si falla la RPC, intentamos insertar directamente el perfil
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

  // Devolvemos los datos del registro
  return { data, error: null }
}
