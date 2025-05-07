
// src/services/auth/signupService.ts
import { supabase } from '@/integrations/supabase/client'
import { AuthResponse } from '@/types/auth'
import { Capacitor } from '@capacitor/core';

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
  console.log("Plataforma:", Capacitor.getPlatform(), "Es nativo:", Capacitor.isNativePlatform());

  // REGISTRO en Supabase Auth (sin emailRedirectTo)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      // No incluir emailRedirectTo en plataformas nativas
      ...(Capacitor.isNativePlatform() ? {} : { emailRedirectTo: window.location.origin })
    }
  });

  if (signUpError) {
    console.error("Error en signUpUser:", signUpError);
    return { data: null, error: { message: signUpError.message } }
  }

  const userId = data.user!.id;
  console.log("Usuario registrado con ID:", userId);
  console.log("Metadata guardado:", data.user?.user_metadata);

  // Crear perfil en base de datos usando múltiples intentos
  try {
    // Esperar un momento para asegurarnos que el usuario esté completamente creado
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Primero intento directo de inserción (prioridad en móvil)
    console.log("Intentando inserción directa del perfil");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        username: username 
      });

    if (insertError) {
      console.error("Error en inserción directa del perfil:", insertError);
      
      // Segundo intento con RPC
      console.log("Intentando con función RPC");
      const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
        user_id: userId,
        user_email: email,
        user_name: username
      });

      if (rpcError) {
        console.error("Error al crear perfil con RPC:", rpcError);
      } else {
        console.log("Perfil creado correctamente con RPC");
      }
    } else {
      console.log("Perfil creado mediante inserción directa");
    }
    
    // Llamada adicional a auto-signup como último recurso
    if (Capacitor.isNativePlatform()) {
      console.log("Dispositivo nativo detectado, usando llamada directa a auto-signup");
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'x-client-info': 'capacitor-app'
          },
          body: JSON.stringify({ 
            user: {
              id: userId,
              email: email,
              user_metadata: userData
            }
          })
        });
        
        const responseText = await response.text();
        console.log("Respuesta de auto-signup:", response.status, responseText);
        
      } catch (err) {
        console.error("Error al llamar a auto-signup:", err);
      }
    }
  } catch (err) {
    console.error("Error inesperado al crear perfil:", err);
  }

  return { data, error: null }
}
