
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
  console.log("[signUpUser] Iniciando registro - Email:", email, "Username:", username);
  console.log("[signUpUser] Plataforma:", Capacitor.getPlatform(), "Es nativo:", Capacitor.isNativePlatform());
  
  try {
    // FASE 1: Crear usuario con metadatos completos
    // Aseguramos que el username esté presente en TODOS los campos de metadatos
    const userData = {
      username: username,
      name: username,
      full_name: username,
      display_name: username,
      recovery_email: recoveryEmail || ''
    };
    
    console.log("[signUpUser] Llamando a supabase.auth.signUp con metadata:", userData);
    
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
      console.error("[signUpUser] Error en registro:", signUpError);
      return { data: null, error: { message: signUpError.message } };
    }

    if (!data.user) {
      console.error("[signUpUser] Error: Usuario no creado");
      return { data: null, error: { message: "Error: No se pudo crear el usuario" } };
    }

    const userId = data.user.id;
    console.log("[signUpUser] Usuario creado con ID:", userId);
    console.log("[signUpUser] Metadatos guardados:", data.user.user_metadata);

    // FASE 2: Intentar asegurar que el perfil se crea correctamente (estrategia múltiple)
    try {
      // Esperar momento para asegurarnos que el usuario esté creado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // A. Verificar si el perfil ya existe
      console.log("[signUpUser] Verificando si el perfil ya existe...");
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();
        
      if (existingProfile) {
        console.log("[signUpUser] Perfil ya existe:", existingProfile);
        
        // Si existe pero no tiene username, actualizarlo
        if (!existingProfile.username) {
          console.log("[signUpUser] Perfil existe pero sin username, actualizando...");
          await supabase
            .from('profiles')
            .update({ username, updated_at: new Date().toISOString() })
            .eq('id', userId);
          
          console.log("[signUpUser] Username actualizado en perfil existente");
        }
        
        // Ya existe perfil, no necesitamos crearlo
        console.log("[signUpUser] Usando perfil existente, registro completo");
        return { data, error: null };
      }
      
      // B. Intentamos crear el perfil directamente
      console.log("[signUpUser] Perfil no existe, intentando inserción directa");
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          email: email,
          username: username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("[signUpUser] Error en inserción directa:", insertError);
        
        // C. Si falla la inserción directa, intentamos con RPC
        console.log("[signUpUser] Intentando con función RPC ensure_user_profile");
        const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
          user_id: userId,
          user_email: email,
          user_name: username
        });

        if (rpcError) {
          console.error("[signUpUser] Error con RPC:", rpcError);
        } else {
          console.log("[signUpUser] Perfil creado con éxito mediante RPC");
        }
      } else {
        console.log("[signUpUser] Perfil creado con éxito mediante inserción directa");
      }
      
      // D. Llamada a auto-signup como respaldo adicional
      console.log("[signUpUser] Llamando a función auto-signup como respaldo final");
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
        
        if (response.ok) {
          const responseData = await response.text();
          console.log("[signUpUser] Respuesta exitosa de auto-signup:", response.status, responseData);
        } else {
          const errorText = await response.text();
          console.error("[signUpUser] Error de auto-signup:", response.status, errorText);
        }
      } catch (err) {
        console.error("[signUpUser] Error al llamar a auto-signup:", err);
      }
      
      // Verificación final
      console.log("[signUpUser] Verificando creación final del perfil");
      const { data: finalProfile, error: finalCheckError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle();
        
      if (finalProfile) {
        console.log("[signUpUser] Confirmación final: Perfil creado correctamente con username:", finalProfile.username);
      } else {
        console.warn("[signUpUser] No se pudo confirmar la creación del perfil. Error:", finalCheckError);
      }
      
      // E. Como último recurso, iniciar sesión para confirmar los datos
      console.log("[signUpUser] Iniciando sesión para confirmar datos de usuario");
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error("[signUpUser] Error al confirmar sesión:", signInError);
      } else {
        console.log("[signUpUser] Sesión confirmada, usuario logueado:", sessionData.user?.id);
        console.log("[signUpUser] Metadatos de usuario confirmados:", sessionData.user?.user_metadata);
      }
      
    } catch (profileErr) {
      console.error("[signUpUser] Error inesperado al gestionar el perfil:", profileErr);
    }

    return { data, error: null };
  } catch (unexpectedErr) {
    console.error("[signUpUser] Error global inesperado:", unexpectedErr);
    return { 
      data: null, 
      error: { message: unexpectedErr instanceof Error ? unexpectedErr.message : "Error desconocido en el registro" }
    };
  }
};
