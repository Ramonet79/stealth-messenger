import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUsername = () => {
  const [username, setUsername] = useState<string>('');
  const { user } = useSupabaseAuth();

  useEffect(() => {
    const generateUsername = async () => {
      if (!user?.email) return;

      let baseUsername =
        user.user_metadata?.username ||
        user.email.split('@')[0] ||
        `usuario_${user?.id?.substring(0, 8) || Math.floor(Math.random() * 10000)}`

      let finalUsername = baseUsername;
      let attempts = 0;

      while (attempts < 5) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', finalUsername)
          .maybeSingle();

        if (!error && !data) {
          break; // Nombre libre
        }

        finalUsername = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
        attempts++;
      }

      setUsername(finalUsername);
    };

    generateUsername();
  }, [user]);

  return { username };
};
