import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { AutoSignupPayload } from '@/types/auth-functions';

export const signUpUser = async (
  email: string, 
  password: string, 
  username: string, 
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    console.log("INICIO DEL PROCESO DE REGISTRO");
    console.log("Datos recibidos:", { email, username });
    
    // 1. Verificación estricta de username duplicado (case insensitive)
    console.log("Verificando duplicados de username...");
    const { data: existingUsernames, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', username)
      .limit(1);
    
    if (usernameCheckError) {
      console.error('Error al verificar nombre de usuario:', usernameCheckError);
      return { 
        data: null, 
        error: { message: 'Error al verificar la disponibilidad del nombre de usuario.' } 
      };
    }
    
    if (existingUsernames && existingUsernames.length > 0) {
      console.log('Nombre de usuario duplicado encontrado:', existingUsernames);
      return { 
        data: null, 
        error: { message: 'Este nombre de usuario ya está en uso. Por favor, elige otro.' } 
      };
    }
    
    // 2. Verificación estricta de email duplicado
    console.log("Verificando duplicados de email...");
    const { data: existingEmails, error: emailCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .limit(1);
      
    if (emailCheckError) {
      console.error('Error al verificar email:', emailCheckError);
      return { 
        data: null, 
        error: { message: 'Error al verificar la disponibilidad del correo electrónico.' } 
      };
    }
    
    if (existingEmails && existingEmails.length > 0) {
      console.log('Email duplicado encontrado:', existingEmails);
      return { 
        data: null, 
        error: { message: 'Este correo electrónico ya está registrado. Por favor, utiliza otro.' } 
      };
    }
    
    // 3. Registrar usuario con metadatos completos
    console.log("Creando usuario en auth.users...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          email_confirmed: true,
        }
      }
    });

    if (error) {
      console.error('Error en registro auth:', error);
      return { data: null, error: { message: error.message } };
    }

    if (!data.user) {
      console.error('No se creó usuario correctamente');
      return { data: null, error: { message: 'Error al crear el usuario' } };
    }

    console.log("Usuario creado en auth:", data.user.id);

    // 4. Confirmar email automáticamente con función edge
    try {
      console.log("Llamando a función auto-signup para confirmar email");
      
      const autoSignupPayload: AutoSignupPayload = {
        email: data.user.email ?? '', 
        user_id: data.user.id
      };
      
      const { data: functionResponse } = await supabase.functions.invoke('auto-signup', {
        body: autoSignupPayload
      });
      
      console.log("Respuesta de auto-signup:", functionResponse);
      console.log("Email confirmado automáticamente");
    } catch (funcError) {
      console.error('Error al llamar función auto-signup:', funcError);
    }

    // 5. CREAR PERFIL DE USUARIO EXPLÍCITAMENTE - CRÍTICO
    await createUserProfile(data.user.id, username, email);
    
    // Establecer la bandera para el primer inicio de sesión
    sessionStorage.setItem('firstLogin', 'true');
    console.log("Bandera de primer inicio de sesión establecida");

    return { data, error: null };
  } catch (error: any) {
    console.error('Error general en el registro de usuario:', error);
    return { data: null, error: { message: error.message } };
  }
};

const createUserProfile = async (userId: string, username: string, email: string) => {
  console.log("Creando perfil en tabla profiles...");
  
  // Intentar 3 veces en caso de fallos
  for (let i = 0; i < 3; i++) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          username: username,
          email: email
        });

      if (!profileError) {
        console.log("✅ Perfil creado exitosamente");
        return;
      }

      console.error(`Error en intento ${i+1} al crear perfil:`, profileError);
      
      // Si falló, esperar un momento y verificar si ya existe
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (checkProfile) {
        console.log("✅ Perfil ya existía o se creó por otro proceso");
        return;
      }
      
      // Si no existe, intentar actualizar en lugar de insertar
      if (i === 1) {
        console.log("Intentando actualizar perfil en lugar de insertar...");
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            username: username,
            email: email
          })
          .eq('id', userId);
          
        if (!updateError) {
          console.log("✅ Perfil actualizado exitosamente");
          return;
        }
        
        console.error("Error también al actualizar perfil:", updateError);
      }
    } catch (e) {
      console.error(`Error general en intento ${i+1}:`, e);
    }
  }
  
  // Verificación final del perfil
  const { data: finalCheck, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (checkError || !finalCheck) {
    console.error("⚠️ ALERTA: Perfil posiblemente no creado:", checkError);
    // Último intento desesperado con RPC (si hay)
    try {
      await supabase.rpc('ensure_user_profile', { 
        user_id: userId,
        user_email: email,
        user_name: username 
      });
      console.log("Intento con RPC para crear perfil");
    } catch (rpcError) {
      console.error("Error en RPC:", rpcError);
    }
  } else {
    console.log("✅ Verificación final: Perfil confirmado", finalCheck);
  }
};
