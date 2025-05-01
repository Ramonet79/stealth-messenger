
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { Database } from '@/integrations/supabase/types';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    console.log("SignupService: iniciando registro para", username);
    
    // Validar que el username no esté en uso (tabla 'profiles')
    const { data: usernameData, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) {
      console.error('Error consultando username:', usernameError);
      return { data: null, error: { message: 'Error verificando nombre de usuario.' } };
    }

    if (usernameData) {
      return { data: null, error: { message: 'Este nombre de usuario ya está en uso.' } };
    }

    // Intentar registrar el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          recovery_email: recoveryEmail,
          email_confirmed: true,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.status === 400) {
        return { data: null, error: { message: 'Este correo electrónico ya está en uso.' } };
      }
      return { data: null, error: { message: error.message || 'Error registrando usuario.' } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Usuario no creado.' } };
    }

    console.log("Usuario creado con ID:", data.user.id);
    
    // Intentar crear el perfil manualmente - esto es importante por si la función auto-signup falla
    try {
      const profileData = {
        id: data.user.id,
        username: username,
        email: email,
        recovery_email: recoveryEmail || null,
        updated_at: new Date().toISOString()
      };
      
      console.log("Creando perfil con datos:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);
        
      if (profileError) {
        console.error("Error al insertar perfil manualmente:", profileError);
      } else {
        console.log("Perfil insertado manualmente con éxito");
      }
      
      // También intentamos crear un patrón de desbloqueo vacío para el usuario
      // (se llenará después cuando el usuario cree su patrón)
      const { error: patternError } = await supabase
        .from('unlock_patterns')
        .insert({
          user_id: data.user.id,
          pattern: '[]', // Patrón vacío inicial
        });
        
      if (patternError) {
        console.error("Error al crear patrón inicial:", patternError);
      } else {
        console.log("Patrón inicial creado con éxito");
      }
      
    } catch (profileError) {
      console.error("Error al insertar perfil:", profileError);
    }

    // Establecer bandera de primer inicio de sesión para mostrar creación de patrón
    sessionStorage.setItem('firstLogin', 'true');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error general en signUpUser:', error);
    return { data: null, error: { message: error.message || 'Error inesperado durante el registro.' } };
  }
};
