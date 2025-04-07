
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
    
    // Registrar usuario con cuenta auto-confirmada
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          email_confirmed: true, // Marcar email como confirmado
        },
        emailRedirectTo: undefined, // No redirigir a ninguna URL
      }
    });

    if (error) {
      console.error('Error en registro:', error);
      return { data: null, error: { message: error.message } };
    }

    if (data.user) {
      // Asegurarnos de que el email esté confirmado (esto es crítico)
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      );

      if (updateError) {
        console.error('Error al confirmar email automáticamente:', updateError);
      }

      // Marcar el email como verificado directamente
      const { error: confirmEmailError } = await supabase
        .rpc('confirm_user_email', { _user_id: data.user.id });

      if (confirmEmailError) {
        console.error('Error al confirmar email con RPC:', confirmEmailError);
      }

      // Actualizamos el perfil del usuario con el nombre de usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          email_confirmed: true
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
    console.log("Iniciando sesión para:", email);
    
    // Intentamos iniciar sesión normal
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error de autenticación:", error);
      
      // Si el error es de email no confirmado, intentamos confirmar manualmente
      if (error.message.includes("Email not confirmed") || error.message.includes("Email no confirmado")) {
        console.log("Intentando confirmar email automáticamente...");
        
        // Obtener el usuario por email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
          
        if (!userError && userData?.id) {
          // Confirmar email
          await supabase.auth.admin.updateUserById(
            userData.id,
            { email_confirm: true }
          );
          
          // Intentar iniciar sesión nuevamente
          const retrySignIn = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!retrySignIn.error) {
            console.log("Sesión iniciada después de confirmar email");
            return { data: retrySignIn.data, error: null };
          }
        }
      }
      
      return { data: null, error: { message: error.message } };
    }

    console.log("Inicio de sesión exitoso");
    return { data, error: null };
  } catch (error: any) {
    console.error("Error inesperado en inicio de sesión:", error);
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
