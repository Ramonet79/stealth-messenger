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
    setLoading(false);
  }, []);

  return { isAvailable, loading, checkEmail };
};
