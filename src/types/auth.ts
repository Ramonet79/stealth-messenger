
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  data?: any;
  error: AuthError | null;
  profile?: any;
}
