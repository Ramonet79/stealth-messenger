
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export const useAuthState = () => {
  const [user, setUser] = useState(supabase.auth.user());
  const [isCreatePattern, setIsCreatePattern] = useState(false);

  // Estado interno para el componente PatternCreation
  const [patternStep, setPatternStep] = useState<0 | 1>(0);
  const [newPattern, setNewPattern] = useState<number[]>([]);

  const navigate = useNavigate();

  // 1️⃣ Escucha cambios en la sesión y guarda el user
  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.unsubscribe();
    };
  }, []);

  // 2️⃣ Si hay user, comprueba si es primer login para arrancar flujo patrón
  useEffect(() => {
    if (user) {
      const firstLogin = sessionStorage.getItem('firstLogin') === 'true';
      if (firstLogin) {
        setIsCreatePattern(true);
      }
    }
  }, [user]);

  // → Función que lanzas desde SignupForm
  const handleSignup = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    // marcamos primer login y dejamos que el componente Auth.tsx redirija al mismo /auth
    sessionStorage.setItem('firstLogin', 'true');
    toast.success('Registro creado. Por favor confirma tu email y luego haz login.');
  };

  // → Función que lanzas desde LoginForm
  const handleLogin = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signIn({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    // login exitoso → Auth.tsx detectará user y redirigirá a Index
  };

  // → Callback que recibe PatternCreation cuando el usuario confirma su patrón
  const handleCompletePatternCreation = async () => {
    // aquí guardas el patrón en tu tabla (por ejemplo, via RPC)
    // await supabase.from('patterns').insert({ user_id: user.id, pattern: newPattern });

    // eliminamos la flag para no volver a pedir patrón
    sessionStorage.removeItem('firstLogin');
    setIsCreatePattern(false);

    // y ya que terminó, le llevamos al /
    navigate('/', { replace: true });
  };

  return {
    user,
    isCreatePattern,
    patternStep,
    newPattern,
    setPatternStep,
    setNewPattern,
    handleSignup,
    handleLogin,
    handleCompletePatternCreation,
  };
};
