
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { patternService } from '@/services/patternService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [isCheckingPattern, setIsCheckingPattern] = useState(false);

  // Estado interno para el componente PatternCreation
  const [patternStep, setPatternStep] = useState<0 | 1>(0);
  const [newPattern, setNewPattern] = useState<number[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 1️⃣ Escucha cambios en la sesión y guarda el user
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2️⃣ Si hay user, comprueba si es primer login para arrancar flujo patrón
  useEffect(() => {
    const checkIfNeedsPattern = async () => {
      if (!user || isCheckingPattern) return;
      
      // Prevenir múltiples ejecuciones
      setIsCheckingPattern(true);
      
      try {
        // Verificar si ya existe patrón en sessionStorage para evitar múltiples comprobaciones
        const firstLogin = sessionStorage.getItem('firstLogin') === 'true';
        
        if (firstLogin) {
          console.log("First login detected, activating pattern creation");
          setIsCreatePattern(true);
          setIsCheckingPattern(false);
          return;
        }
        
        // Si no hay flag en sesión, verificamos en base de datos
        const { data, error } = await patternService.getPattern(user.id);
        
        if (error || !data || data.length === 0) {
          console.log("No pattern found for user, activating pattern creation");
          setIsCreatePattern(true);
          sessionStorage.setItem('firstLogin', 'true');
        } else {
          console.log("User already has pattern configured");
          setIsCreatePattern(false);
        }
      } catch (error) {
        console.error("Error checking existing pattern:", error);
        // En caso de error, por seguridad activamos el flujo de creación
        setIsCreatePattern(true);
      } finally {
        // Siempre liberar el flag de comprobación
        setIsCheckingPattern(false);
      }
    };
    
    if (user && !isCheckingPattern) {
      checkIfNeedsPattern();
    }
  }, [user, isCheckingPattern]);

  // → Función que lanzas desde SignupForm
  const handleSignup = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message,
      });
      return;
    }
    // marcamos primer login y dejamos que el componente Auth.tsx redirija al mismo /auth
    sessionStorage.setItem('firstLogin', 'true');
    toast({
      title: "Registro creado",
      description: "Por favor confirma tu email y luego haz login."
    });
  };

  // → Función que lanzas desde LoginForm
  const handleLogin = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error.message,
      });
      return;
    }
    // login exitoso → Auth.tsx detectará user y redirigirá a Index
  };

  // → Callback que recibe PatternCreation cuando el usuario confirma su patrón
  const handleCompletePatternCreation = async () => {
    if (!user) return;
    
    try {
      // Guardar el patrón en la base de datos
      await patternService.savePattern(user.id, newPattern);
      
      // eliminamos la flag para no volver a pedir patrón
      sessionStorage.removeItem('firstLogin');
      setIsCreatePattern(false);

      // y ya que terminó, le llevamos al /
      navigate('/', { replace: true });
      
      toast({
        title: "Patrón guardado",
        description: "Tu patrón de desbloqueo ha sido configurado correctamente."
      });
    } catch (error) {
      console.error("Error al guardar patrón:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar patrón",
        description: "No se pudo guardar el patrón. Por favor intenta de nuevo."
      });
    }
  };

  return {
    user,
    isCreatePattern,
    isCheckingPattern,
    patternStep,
    newPattern,
    setPatternStep,
    setNewPattern,
    handleSignup,
    handleLogin,
    handleCompletePatternCreation,
  };
};
