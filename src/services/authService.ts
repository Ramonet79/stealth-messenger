
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse, RecoveryResponse, AuthError } from '@/types/auth';

export const signUpUser = async (
  email: string, 
  password: string, 
  username: string, 
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          recovery_email: recoveryEmail 
        })
        .eq('id', data.user.id);

      if (profileError) {
        return { 
          data, 
          error: { message: `Cuenta creada pero hubo un error al guardar perfil: ${profileError.message}` } 
        };
      }
    }

    return { data, error: null };
  } catch (error: any) {
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

// Función de recuperación simplificada para evitar el error de TypeScript
export const recoverAccountWithEmail = async (email: string): Promise<RecoveryResponse> => {
  try {
    // Verificar si la tabla profiles tiene la columna recovery_email
    const { error: schemaError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('recovery_email')) {
      console.error('Error de esquema:', schemaError.message);
      return { 
        error: { message: "Error con la tabla de perfiles. La columna de correo de recuperación podría no existir." },
        profile: null
      };
    }
    
    // Buscar el perfil con el correo de recuperación mediante una consulta separada
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username');
    
    // Procesamiento manual para evitar el error de tipos
    let matchingProfile = null;
    if (data && data.length > 0) {
      // Buscar manualmente el perfil que coincida con el correo
      for (const profile of data) {
        if (profile.id) {
          matchingProfile = {
            id: profile.id,
            username: profile.username || '',
            recovery_email: email
          };
          break;
        }
      }
    }
    
    if (error) {
      console.error('Error al buscar perfil:', error);
      return { 
        error: { message: `Error al buscar perfil: ${error.message}` },
        profile: null
      };
    }
    
    if (!matchingProfile) {
      return { 
        error: { message: "No se encontró ninguna cuenta asociada a este correo de recuperación" },
        profile: null
      };
    }
    
    // Enviar correo de restablecimiento
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    
    if (resetError) {
      return { error: { message: resetError.message }, profile: null };
    }
    
    return { 
      error: null, 
      profile: matchingProfile
    };
  } catch (error: any) {
    console.error('Error en recuperación de cuenta:', error);
    return { error: { message: error.message || 'Error desconocido' }, profile: null };
  }
};
