
// src/hooks/useCheckEmail.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckEmail = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const checkEmail = useCallback(async (email: string) => {
    const e = email.trim().toLowerCase();
    // mínima longitud y formato muy básico
    if (!e || e.length < 5 || !/@/.test(e)) {
      setIsAvailable(null);
      return;
    }
    setLoading(true);

    try {
      // Intentar verificar primero con la función signInWithOtp para comprobar si el email ya existe
      // Esto es más fiable que verificar sólo en profiles
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: e,
        options: {
          shouldCreateUser: false // No queremos crear un usuario, sólo verificar
        }
      });

      // Si no hay error en signInWithOtp, significa que el usuario ya existe
      if (!signInError) {
        setIsAvailable(false);
        setLoading(false);
        return;
      }

      // Si el error no es de usuario no encontrado, sino de otra cosa, comprobamos en profiles
      if (signInError && !signInError.message.includes("Email not found")) {
        // Contamos cuántos perfiles tienen ese email
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { head: true, count: 'exact' })
          .eq('email', e);

        if (error) {
          console.error('Error comprobando email:', error);
          setIsAvailable(null);
        } else {
          setIsAvailable((count ?? 0) === 0);
        }
      } else {
        // Si el error es de usuario no encontrado, significa que el email está disponible
        setIsAvailable(true);
      }
    } catch (err) {
      console.error('Error general comprobando email:', err);
      setIsAvailable(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isAvailable, loading, checkEmail };
};
