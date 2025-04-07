
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
    // Check if migration for recovery_email has been applied
    // First try to check if the column exists by querying profiles
    const { error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // If there's an error mentioning recovery_email, the column likely doesn't exist
    if (checkError && checkError.message.includes('recovery_email')) {
      console.error('Error de esquema:', checkError.message);
      return { 
        error: { message: "Error con la tabla de perfiles. La columna de correo de recuperación podría no existir." },
        profile: null
      };
    }
    
    // Now try to find a profile using the recovery_email
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('recovery_email', email)
      .maybeSingle();
    
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
    
    // If we found the profile, send a reset password email
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return { error: { message: error.message }, profile: null };
    }
    
    // Return the profile data safely
    return { 
      error: null, 
      profile: {
        id: data.id,
        username: data.username,
        recovery_email: email // Use the email that was passed in
      }
    };
  } catch (error: any) {
    console.error('Error en recuperación de cuenta:', error);
    return { error: { message: error.message || 'Error desconocido' }, profile: null };
  }
};
