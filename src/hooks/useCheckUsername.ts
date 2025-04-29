import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckUsername = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 4) {
      setIsAvailable(null);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Error comprobando nombre de usuario:', error);
      setIsAvailable(null);
    } else {
      setIsAvailable(!data); // true si no existe
    }

    setLoading(false);
  }, []);

  return { isAvailable, loading, checkUsername };
};
