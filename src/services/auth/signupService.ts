import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { Database } from '@/integrations/supabase/types';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    // Validar que el username no esté en uso (tabla 'profiles')
    const { data: usernameData, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) {
      console.error('Error consultando username:', usernameError);
      return { data: null, error: { message: 'Error verificando nombre de usuario.' } };
    }

    if (usernameData) {
      return { data: null, error: { message: 'Este nombre de usuario ya está en uso.' } };
    }

    // Intentar registrar el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          email_confirmed: true,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.status === 400) {
        return { data: null, error: { message: 'Este correo electrónico ya está en uso.' } };
      }
      return { data: null, error: { message: error.message || 'Error registrando usuario.' } };
    }

    if (!data.user) {
      return { data: null, error: { message: 'Usuario no creado.' } };
    }

    // Crear perfil en 'profiles' usando RPC
    await supabase.rpc(
      'ensure_user_profile',
      {
        user_id: data.user.id,
        user_email: email,
        user_name: username,
      } as Database['public']['Functions']['ensure_user_profile']['Args']
    );

    sessionStorage.setItem('firstLogin', 'true');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error general en signUpUser:', error);
    return { data: null, error: { message: error.message || 'Error inesperado durante el registro.' } };
  }
};
