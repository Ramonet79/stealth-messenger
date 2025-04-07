
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

// Función de recuperación deshabilitada (solo devuelve un error amigable)
export const recoverAccountWithEmail = async (email: string): Promise<RecoveryResponse> => {
  // Esta funcionalidad ha sido deshabilitada temporalmente
  console.log("Funcionalidad de recuperación por correo deshabilitada");
  
  return { 
    error: { message: "La recuperación de cuenta mediante correo de recuperación está temporalmente deshabilitada." }, 
    profile: null 
  };
};
