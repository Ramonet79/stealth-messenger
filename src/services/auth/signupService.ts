
// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string = ''
): Promise<AuthResponse> => {
  // Ensure username is properly set in ALL metadata fields
  const userData = {
    username,
    name: username,          // Explicitly set the name field
    full_name: username,     // Explicitly set full_name
    display_name: username,  // Add display_name to ensure it's captured
    recovery_email: recoveryEmail || ''
  };

  console.log("Registrando usuario con metadata completo:", userData);

  // REGISTRO en Supabase Auth (sin emailRedirectTo)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: window.location.origin // Add redirect URL for email confirmation
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
    // First try with RPC
    const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
      user_id: userId,
      user_email: email,
      user_name: username
    });

    if (rpcError) {
      console.error("Error al crear perfil con RPC:", rpcError);

      // Try direct insertion as fallback
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
    
    // Additional call to auto-signup function to ensure profile creation
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          user: {
            id: userId,
            email: email,
            user_metadata: userData
          }
        })
      });
      
      if (response.ok) {
        console.log("Auto-signup confirmó el perfil correctamente");
      } else {
        console.error("Error en auto-signup:", await response.text());
      }
    } catch (err) {
      console.error("Error al llamar a auto-signup:", err);
    }
  } catch (err) {
    console.error("Error inesperado al crear perfil:", err);
  }

  return { data, error: null }
}
