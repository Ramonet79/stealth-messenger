
import { supabase } from "../../integrations/supabase/client";

/**
 * Parámetros necesarios para registrar un usuario.
 */
export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  recoveryEmail?: string;
}

/**
 * Resultado de la operación de registro.
 */
export interface SignUpResponse {
  user: any | null;
  error: any | null;
  data?: {
    user: any | null;
  };
}

/**
 * Registra un nuevo usuario en Supabase.
 * Envía únicamente el metadata necesario y deja que el trigger en base de datos
 * cree automáticamente la fila en la tabla `profiles`.
 */
export async function signUpUser(
  email: string,
  password: string,
  username: string,
  recoveryEmail?: string
): Promise<SignUpResponse> {
  // Construimos el metadata con el username y name explícitamente
  const userData = { 
    username, 
    name: username, // IMPORTANTE: añadimos name explícitamente para display_name
    full_name: username // Añadimos también full_name como respaldo
  };
  
  // Si hay email de recuperación, lo añadimos al metadata
  if (recoveryEmail) {
    userData['recovery_email'] = recoveryEmail;
  }
  
  console.log("📥 Enviando a signUp options.data =", userData);

  // 1) Llamada a Supabase Auth para crear el usuario
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (error) {
    console.error("❌ Error en registro:", error);
    return { 
      user: null, 
      error,
      data: null
    };
  }

  console.log("✅ Registro exitoso:", data.user);
  
  // 2) Llamando a función auto-signup para confirmar email automáticamente
  try {
    console.log("Llamando a función auto-signup para confirmar email automáticamente");
    await supabase.functions.invoke('auto-signup', {
      body: { user: data.user }
    });
  } catch (fnError) {
    console.error("Error al invocar auto-signup:", fnError);
    // No bloqueamos el registro si falla la función
  }
  
  return { 
    user: data.user, 
    error: null,
    data: {
      user: data.user
    }
  };
}
