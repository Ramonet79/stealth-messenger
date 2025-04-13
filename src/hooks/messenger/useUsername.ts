
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const useUsername = () => {
  const [username, setUsername] = useState<string>('');
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user && user.email) {
      const extractedUsername = user.user_metadata?.username || 
                              user.email.split('@')[0] || 
                              `usuario_${user.id.substring(0, 8)}`;
      setUsername(extractedUsername);
      console.log('Username actualizado:', extractedUsername);
    }
  }, [user]);

  return { username };
};
