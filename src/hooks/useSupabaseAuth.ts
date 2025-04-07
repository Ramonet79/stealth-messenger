
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

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

  const signUp = async (email: string, password: string, username: string, recoveryEmail: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: error.message,
        });
        return { data: null, error };
      }

      // Si el registro fue exitoso y tenemos un usuario
      if (data.user) {
        // Actualizar el perfil del usuario con el nombre de usuario y el correo de recuperación
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            username,
            recovery_email: recoveryEmail 
          })
          .eq('id', data.user.id);

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Error al guardar perfil",
            description: profileError.message,
          });
          // Aunque haya error en el perfil, el usuario ya está creado
        }
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message,
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: error.message,
        });
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error.message,
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error al cerrar sesión",
          description: error.message,
        });
      }
      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
      return { error };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return { error };
    }
  };

  const recoverAccountWithEmail = async (email: string) => {
    try {
      // Verificar si existe un perfil con este correo de recuperación
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('recovery_email', email)
        .maybeSingle();

      if (profileError || !profile) {
        toast({
          variant: "destructive",
          title: "Error de recuperación",
          description: "No se encontró ninguna cuenta asociada a este correo de recuperación",
        });
        return { error: profileError || new Error("No se encontró la cuenta") };
      }

      // Si encontramos el perfil, recuperamos la cuenta del usuario asociado
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error de recuperación",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu acceso",
      });
      
      return { error: null, profile };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de recuperación",
        description: error.message,
      });
      return { error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    recoverAccountWithEmail,
  };
};
