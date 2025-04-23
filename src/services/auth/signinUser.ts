
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        data: null,
        error: { message: error.message },
      };
    }

    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message },
    };
  }
};
