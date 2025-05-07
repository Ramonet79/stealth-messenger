
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
  console.log("Registrando usuario:", email, username);
  console.log("Plataforma:", Capacitor.getPlatform(), "Es nativo:", Capacitor.isNativePlatform());
  
  // Aseguramos que el username esté presente en TODOS los campos de metadatos
  const userData = {
    username: username,
    name: username,
    full_name: username,
    display_name: username,
    recovery_email: recoveryEmail || ''
  };
  
  // Registramos al usuario con los metadatos completos
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      ...(Capacitor.isNativePlatform() ? {} : { emailRedirectTo: window.location.origin })
    }
  });

  if (signUpError) {
    console.error("Error en registro:", signUpError);
    return { data: null, error: { message: signUpError.message } };
  }

  if (!data.user) {
    console.error("Error: Usuario no creado");
    return { data: null, error: { message: "Error: No se pudo crear el usuario" } };
  }

  const userId = data.user.id;
  console.log("Usuario creado con ID:", userId);
  console.log("Metadatos guardados:", data.user.user_metadata);

  // Crear perfil en base de datos - usamos múltiples estrategias para mayor seguridad
  try {
    // Esperar un momento para asegurarnos que el usuario esté completamente creado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 1. Insertamos directamente el perfil
    console.log("Intentando inserción directa del perfil");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: userId,
        email: email,
        username: username 
      });

    if (insertError) {
      console.error("Error en inserción directa:", insertError);
      
      // 2. Intentamos con RPC si la inserción falló
      console.log("Intentando con función RPC");
      const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
        user_id: userId,
        user_email: email,
        user_name: username
      });

      if (rpcError) {
        console.error("Error con RPC:", rpcError);
      } else {
        console.log("Perfil creado con RPC");
      }
    } else {
      console.log("Perfil creado mediante inserción directa");
    }
    
    // 3. Llamada a auto-signup como última opción
    console.log("Llamando a función auto-signup como respaldo");
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          user: {
            id: userId,
            email: email,
            user_metadata: userData
          }
        })
      });
      
      const responseData = await response.text();
      console.log("Respuesta de auto-signup:", response.status, responseData);
      
    } catch (err) {
      console.error("Error al llamar a auto-signup:", err);
    }
  } catch (err) {
    console.error("Error inesperado al crear perfil:", err);
  }

  return { data, error: null };
};
