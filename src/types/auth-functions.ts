
/**
 * Tipos para funciones de autenticación y comunicación con Edge Functions
 */

// Payload para la función auto-signup 
export interface AutoSignupPayload {
  email: string;
  user_id: string;
}

// Respuesta de la función auto-signup
export interface AutoSignupResponse {
  success: boolean;
  message: string;
}
