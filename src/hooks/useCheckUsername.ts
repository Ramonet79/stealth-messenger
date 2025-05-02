
// src/hooks/useCheckUsername.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckUsername = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggested, setSuggested] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const checkUsername = useCallback(async (username: string) => {
    // Si está vacío o muy corto, no comprobamos
    if (!username || username.trim().length < 4) {
      setIsAvailable(null);
      setSuggested(null);
      return;
    }
    setLoading(true);

    try {
      // Verificamos si hay un perfil con el mismo nombre de usuario
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', username.trim());

      if (error) {
        console.error('Error comprobando username:', error);
        setIsAvailable(null);
        setSuggested(null);
      } else if ((count ?? 0) > 0) {
        setIsAvailable(false);
        setSuggested(`${username.trim()}${Math.floor(Math.random() * 900 + 100)}`);
      } else {
        setIsAvailable(true);
        setSuggested(null);
      }
    } catch (err) {
      console.error('Error general verificando username:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isAvailable, suggested, loading, checkUsername };
};
