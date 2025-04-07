
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
    
    // Registrar usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          email_confirmed: true, // Marcar email como confirmado (solo para metadata)
        }
      }
    });

    if (error) {
      console.error('Error en registro:', error);
      return { data: null, error: { message: error.message } };
    }

    if (data.user) {
      // Llamamos a nuestra función edge para confirmar el email automáticamente
      try {
        console.log("Llamando a función auto-signup para confirmar email automáticamente");
        await supabase.functions.invoke('auto-signup', {
          body: { email: data.user.email, user_id: data.user.id }
        });
      } catch (funcError) {
        console.error('Error al llamar función auto-signup:', funcError);
      }

      // Actualizamos el perfil del usuario con el nombre de usuario y email
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          email: email
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error al actualizar perfil:', profileError);
        return { 
          data, 
          error: { message: `Cuenta creada pero hubo un error al guardar perfil: ${profileError.message}` } 
        };
      }
      
      // Establecer la bandera para el primer inicio de sesión
      sessionStorage.setItem('firstLogin', 'true');
      console.log("Bandera de primer inicio de sesión establecida");
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
      
      // Si el error es de email no confirmado, intentamos confirmar vía edge function
      if (error.message.includes("Email not confirmed") || error.message.includes("Email no confirmado")) {
        console.log("Email no confirmado, invocando función auto-signup");
        
        try {
          // Obtener usuario actual para confirmar su email
          const { data: authData } = await supabase.auth.getUser();
          
          if (authData?.user) {
            // Llamar a función edge para confirmar email
            await supabase.functions.invoke('auto-signup', {
              body: { email, user_id: authData.user.id }
            });
            
            // Intentar iniciar sesión nuevamente
            console.log("Reintentando inicio de sesión después de confirmar email");
            const retrySignIn = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (!retrySignIn.error) {
              console.log("Sesión iniciada después de confirmar email");
              return { data: retrySignIn.data, error: null };
            }
          }
        } catch (funcError) {
          console.error("Error al confirmar email con función:", funcError);
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
