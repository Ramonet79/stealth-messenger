
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
}

// Interfaz básica para respuestas de autenticación
export interface AuthResponse {
  data?: any;
  error: AuthError | null;
}

// Interfaz específica para respuestas de recuperación de cuenta
// Esto evita la recursión infinita en tipos
export interface RecoveryResponse {
  error: AuthError | null;
  profile: any | null;
}
