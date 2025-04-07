
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
        console.log("Auth event:", event);
        
        // Si el evento es SIGNED_OUT, asegurarse de limpiar estado
        if (event === 'SIGNED_OUT') {
          console.log("Usuario ha cerrado sesión");
          setAuthState({
            session: null,
            user: null,
            loading: false,
          });
        // Si el evento es SIGNED_IN después de confirmar email, redirigir a la creación de patrón
        } else if (event === 'SIGNED_IN' && window.location.href.includes('confirmSuccess=true')) {
          console.log("Usuario confirmado y autenticado correctamente");
          setAuthState({
            session,
            user: session?.user ?? null,
            loading: false,
          });
          
          // Marcar como primera sesión después de confirmación para mostrar la creación del patrón
          sessionStorage.setItem('firstLoginAfterConfirmation', 'true');
          
          // Redirigir a la página principal para la creación del patrón
          window.location.href = '/';
        } else {
          setAuthState({
            session,
            user: session?.user ?? null,
            loading: false,
          });
        }
      }
    );

    // Auto-completar email del form de login si viene de confirmación
    const autoFillEmail = sessionStorage.getItem('autoFillEmail');
    if (autoFillEmail) {
      // El componente LoginForm debería leer esto
      console.log("Email para auto-completar disponible:", autoFillEmail);
      // No eliminar aquí para permitir que el componente lo use
    }

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, recoveryEmail: string): Promise<AuthResponse> => {
    console.log("Iniciando registro:", { email, username, recoveryEmail: recoveryEmail ? "Provided" : "Not provided" });
    const response = await signUpUser(email, password, username, recoveryEmail);
    
    if (response.error) {
      console.error("Error de registro:", response.error);
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: response.error.message,
      });
    } else {
      console.log("Registro iniciado:", response.data?.user?.id);
      toast({
        title: "Registro iniciado",
        description: "Revisa tu correo para verificar tu cuenta",
      });
    }
    
    return response;
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await signInUser(email, password);
    
    if (response.error) {
      console.error("Error de inicio de sesión:", response.error);
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
      console.error("Error al cerrar sesión:", response.error);
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
      console.error("Error al enviar correo de restablecimiento de contraseña:", response.error);
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error.message,
      });
    } else {
      console.log("Correo de restablecimiento de contraseña enviado");
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
    }
    
    return response;
  };

  const recoverAccount = async (email: string): Promise<RecoveryResponse> => {
    console.log("Iniciando recuperación de cuenta para:", email);
    const response = await recoverAccountWithEmail(email);
    
    if (response.error) {
      console.error("Error de recuperación:", response.error);
      toast({
        variant: "destructive",
        title: "Error de recuperación",
        description: response.error.message,
      });
    } else {
      console.log("Recuperación iniciada para perfil:", response.profile?.id);
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
