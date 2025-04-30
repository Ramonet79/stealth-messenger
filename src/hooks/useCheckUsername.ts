import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCheckUsername = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggested, setSuggested] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 4) {
      setIsAvailable(null);
      setSuggested(null);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Error comprobando username:', error);
      setIsAvailable(null);
      setSuggested(null);
    } else if (data) {
      setIsAvailable(false);
      // Proponer una alternativa como username123 o username456
      const alternative = `${username}${Math.floor(Math.random() * 900 + 100)}`;
      setSuggested(alternative);
    } else {
      setIsAvailable(true);
      setSuggested(null);
    }

    setLoading(false);
  }, []);

  return { isAvailable, suggested, loading, checkUsername };
};
