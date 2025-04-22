
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { AutoSignupPayload } from '@/types/auth-functions';

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
            const payload: AutoSignupPayload = {
              email, 
              user_id: authData.user.id
            };
            
            // Asegurar tipos correctos para la invocación de la función
            const { data: functionResponse } = await supabase.functions.invoke('auto-signup', {
              body: payload
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
