
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
    
    // Obtenemos la URL actual para construir la redirección
    const appUrl = window.location.origin;
    
    // Configuramos la redirección después de verificar el correo
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        // Esto es importante: redirecciona al usuario a nuestra app después de verificar
        emailRedirectTo: `${appUrl}/auth?confirmSuccess=true`
      }
    });

    if (error) {
      console.error('Error en registro:', error);
      return { data: null, error: { message: error.message } };
    }

    if (data.user) {
      // Actualizamos el perfil del usuario con el nombre de usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error al actualizar perfil:', profileError);
        return { 
          data, 
          error: { message: `Cuenta creada pero hubo un error al guardar perfil: ${profileError.message}` } 
        };
      }
      
      // Llamamos a nuestra función edge para enviar el email personalizado
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edacjnnrjmnftlhdcjab.supabase.co';
        const functionUrl = `${supabaseUrl}/functions/v1/custom-confirm-email`;
        console.log('Enviando solicitud a:', functionUrl);
        
        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`,
          },
          body: JSON.stringify({
            email: email,
            user_id: data.user.id
          })
        });
        
        const result = await response.json();
        console.log("Resultado de envío de email personalizado:", result);
      } catch (emailError: any) {
        console.error("Error al enviar email personalizado:", emailError);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error de autenticación:", error);
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
