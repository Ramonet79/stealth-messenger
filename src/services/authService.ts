
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

    // Si el registro fue exitoso y tenemos un usuario
    if (data.user) {
      // Actualizar el perfil del usuario con el nombre de usuario y el correo de recuperación
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          recovery_email: recoveryEmail 
        })
        .eq('id', data.user.id);

      if (profileError) {
        // Aunque haya error en el perfil, el usuario ya está creado
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

export const recoverAccountWithEmail = async (email: string): Promise<RecoveryResponse> => {
  try {
    // Verificar si existe un perfil con este correo de recuperación
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('recovery_email', email)
      .maybeSingle();
    
    // Manejar el caso de error de consulta
    if (profileError) {
      return { 
        error: { message: profileError.message },
        profile: null
      };
    }
    
    // Manejar el caso de que no se encuentre el perfil
    if (!data) {
      return { 
        error: { message: "No se encontró ninguna cuenta asociada a este correo de recuperación" },
        profile: null
      };
    }
    
    // Si encontramos el perfil, recuperamos la cuenta del usuario asociado
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { error: { message: error.message }, profile: null };
    }
    
    return { error: null, profile: data };
  } catch (error: any) {
    return { error: { message: error.message }, profile: null };
  }
};
