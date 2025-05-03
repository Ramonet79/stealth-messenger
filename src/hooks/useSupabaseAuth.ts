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
} from '@/services/auth';
import { patternService } from '@/services/patternService';

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log("Inicializando estado de autenticación...");
    
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
        // IMPORTANTE: Verificar si es primera vez después de verificación de email
        } else if (event === 'SIGNED_IN') {
          console.log("Usuario ha iniciado sesión");
          
          // Verificar si es un nuevo usuario mediante consulta a patrones
          const checkIfNewUser = async (userId: string) => {
            try {
              const { data, error } = await patternService.getPattern(userId);
              if (error || !data || data.length === 0) {
                console.log("Usuario nuevo detectado o sin patrón - activando modo de creación de patrón");
                // Marcar como primera sesión para que se muestre el patrón
                sessionStorage.setItem('firstLogin', 'true');
              }
            } catch (err) {
              console.error("Error al verificar si es usuario nuevo:", err);
              // Por seguridad, si hay error asumimos que es nuevo usuario
              sessionStorage.setItem('firstLogin', 'true');
            }
          };
          
          if (session?.user) {
            // Verificar si el usuario tiene patrón configurado
            checkIfNewUser(session.user.id);
          }
          
          setAuthState({
            session,
            user: session?.user ?? null,
            loading: false,
          });
        } else {
          console.log("Actualización del estado de autenticación:", event);
          setAuthState({
            session,
            user: session?.user ?? null,
            loading: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      
      if (session?.user) {
        // También verificar aquí si el usuario tiene patrón
        const checkIfNewUser = async (userId: string) => {
          try {
            const { data, error } = await patternService.getPattern(userId);
            if (error || !data || data.length === 0) {
              console.log("Usuario sin patrón detectado en verificación inicial - activando modo de creación");
              // Marcar como primera sesión para que se muestre el patrón
              sessionStorage.setItem('firstLogin', 'true');
            }
          } catch (err) {
            console.error("Error al verificar si es usuario nuevo en inicio:", err);
            sessionStorage.setItem('firstLogin', 'true');
          }
        };
        
        checkIfNewUser(session.user.id);
      }
      
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
      console.log("Registro exitoso:", response.data?.user?.id);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
      
      // Set flag for first login to trigger pattern creation
      sessionStorage.setItem('firstLogin', 'true');
      
      // Log in the user immediately after successful registration
      if (response.data?.user) {
        console.log("Auto-iniciando sesión después del registro");
        await signIn(email, password);
      }
    }
    
    return response;
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await signInUser(email, password);
    
    if (response.error) {
      console.error("Error de inicio de sesión:", response.error);
      
      // Si el error es de email no confirmado, informamos al usuario
      if (response.error.message.includes("Email not confirmed") || 
          response.error.message.includes("Email no confirmado")) {
        
        console.log("Email no confirmado, se intentará confirmar automáticamente");
        toast({
          variant: "destructive",
          title: "Email no confirmado",
          description: "Tu email no ha sido confirmado. Contacta al administrador.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: response.error.message,
        });
      }
    } else {
      console.log("Inicio de sesión exitoso:", response.data?.user?.id);
      
      // Check if it's the first login after registration
      if (sessionStorage.getItem('firstLogin') === 'true') {
        console.log("Primera sesión detectada - se iniciará creación de patrón");
      }
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
    } else {
      console.log("Sesión cerrada correctamente");
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
