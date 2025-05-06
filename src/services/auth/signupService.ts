
import { supabase } from "../../integrations/supabase/client";

/**
 * Parámetros necesarios para registrar un usuario.
 */
export interface SignUpParams {
  email: string;
  password: string;
  username: string;
}

/**
 * Resultado de la operación de registro.
 */
export interface SignUpResponse {
  user: any | null;
  error: any | null;
}

/**
 * Registra un nuevo usuario en Supabase.
 * Envía únicamente el metadata necesario y deja que el trigger en base de datos
 * cree automáticamente la fila en la tabla `profiles`.
 */
export async function signUpUser({
  email,
  password,
  username,
}: SignUpParams): Promise<SignUpResponse> {
  // Construimos el metadata con el username
  const userData = { 
    username, 
    name: username // Añadimos name explícitamente para display_name
  };
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
    return { user: null, error };
  }

  console.log("✅ Registro exitoso:", data.user);
  return { user: data.user, error: null };
}
