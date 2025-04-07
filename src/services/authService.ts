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

export const recoverAccountWithEmail = async (email: string): Promise<RecoveryResponse> => {
  try {
    const checkResult = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (checkResult.error && checkResult.error.message.includes('recovery_email')) {
      console.error('Error de esquema:', checkResult.error.message);
      return { 
        error: { message: "Error con la tabla de perfiles. La columna de correo de recuperación podría no existir." },
        profile: null
      };
    }
    
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('recovery_email', email)
      .then(result => ({
        data: result.data ? result.data[0] : null,
        error: result.error
      }));
    
    if (profileError) {
      console.error('Error al buscar perfil:', profileError);
      return { 
        error: { message: `Error al buscar perfil: ${profileError.message}` },
        profile: null
      };
    }
    
    if (!data) {
      return { 
        error: { message: "No se encontró ninguna cuenta asociada a este correo de recuperación" },
        profile: null
      };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { error: { message: error.message }, profile: null };
    }
    
    return { 
      error: null, 
      profile: {
        id: data.id,
        username: data.username,
        recovery_email: email
      }
    };
  } catch (error: any) {
    console.error('Error en recuperación de cuenta:', error);
    return { error: { message: error.message || 'Error desconocido' }, profile: null };
  }
};
