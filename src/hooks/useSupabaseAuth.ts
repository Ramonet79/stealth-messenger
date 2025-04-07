import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AuthState, 
  AuthError, 
  AuthResponse,
  RecoveryResponse
} from '@/types/auth';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  sendPasswordReset, 
  recoverAccountWithEmail 
} from '@/services/authService';

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, recoveryEmail: string): Promise<AuthResponse> => {
    const response = await signUpUser(email, password, username, recoveryEmail);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: response.error.message,
      });
    }
    
    return response;
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await signInUser(email, password);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: response.error.message,
      });
    }
    
    return response;
  };

  const signOut = async (): Promise<AuthResponse> => {
    const response = await signOutUser();
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: response.error.message,
      });
    }
    
    return response;
  };

  const sendPasswordResetEmail = async (email: string): Promise<AuthResponse> => {
    const response = await sendPasswordReset(email);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error.message,
      });
    } else {
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
    }
    
    return response;
  };

  const recoverAccount = async (email: string): Promise<RecoveryResponse> => {
    const response = await recoverAccountWithEmail(email);
    
    if (response.error) {
      toast({
        variant: "destructive",
        title: "Error de recuperación",
        description: response.error.message,
      });
    } else {
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu acceso",
      });
    }
    
    return response;
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    recoverAccount,
  };
};
