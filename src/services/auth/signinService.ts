
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { AutoSignupPayload } from '@/types/auth-functions';

export const confirmUserWithFunction = async (
  email: string,
  userId: string
): Promise<AuthResponse> => {
  try {
    const payload = {
      email,
      user_id: userId,
    } as unknown as Record<string, unknown>; // ✅ Solución a TS2352

    const { data, error } = await supabase.functions.invoke('auto-signup', {
      body: payload,
    });

    return { data, error: error ? { message: error.message } : null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};
