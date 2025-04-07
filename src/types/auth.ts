
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export interface AuthError {
  message: string;
}

// Interface for authentication responses
export interface AuthResponse {
  data?: any;
  error: AuthError | null;
}

// Profile data structure for recovery responses
export interface ProfileData {
  id?: string;
  username?: string;
  recovery_email?: string;
}

// Interface for account recovery responses
export interface RecoveryResponse {
  error: AuthError | null;
  profile: ProfileData | null;
}
