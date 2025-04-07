
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse, RecoveryResponse, AuthError } from '@/types/auth';

export const signUpUser = async (
  email: string, 
  password: string, 
  username: string, 
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    // Primero verificamos si el username ya existe
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (usernameCheckError) {
      console.error('Error al verificar nombre de usuario:', usernameCheckError);
    }
    
    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'Este nombre de usuario ya está en uso. Por favor, elige otro.' } 
      };
    }
    
    // Procedemos con el registro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          recovery_email: recoveryEmail
        }
      }
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (data.user) {
      // Actualizamos el perfil del usuario con el nombre de usuario y correo de recuperación
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          recovery_email: recoveryEmail 
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error al actualizar perfil:', profileError);
        return { 
          data, 
          error: { message: `Cuenta creada pero hubo un error al guardar perfil: ${profileError.message}` } 
        };
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error en el registro de usuario:', error);
    return { data: null, error: { message: error.message } };
  }
};

export const signInUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const signOutUser = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

export const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
};

// Función de recuperación simplificada para evitar errores de TypeScript
export const recoverAccountWithEmail = async (email: string): Promise<RecoveryResponse> => {
  try {
    console.log("Buscando usuario con correo de recuperación:", email);
    
    // Buscar el perfil con el correo de recuperación
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, recovery_email')
      .eq('recovery_email', email)
      .limit(1);
    
    if (error) {
      console.error('Error al buscar perfil:', error);
      return { 
        error: { message: `Error al buscar perfil: ${error.message}` },
        profile: null
      };
    }
    
    if (!data || data.length === 0) {
      return { 
        error: { message: "No se encontró ninguna cuenta asociada a este correo de recuperación" },
        profile: null
      };
    }
    
    // Usar el primer perfil encontrado
    const matchingProfile = data[0];
    
    // Enviar correo de restablecimiento para este usuario
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    
    if (resetError) {
      return { 
        error: { message: resetError.message }, 
        profile: null 
      };
    }
    
    return { 
      error: null, 
      profile: {
        id: matchingProfile.id,
        username: matchingProfile.username,
        recovery_email: matchingProfile.recovery_email
      }
    };
  } catch (error: any) {
    console.error('Error en recuperación de cuenta:', error);
    return { 
      error: { message: error.message || 'Error desconocido' }, 
      profile: null 
    };
  }
};
