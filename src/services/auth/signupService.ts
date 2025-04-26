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
    // Validar que el nombre de usuario no esté en uso (tabla 'profiles')
    const { data: existingUsernames, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (usernameError) {
      return { data: null, error: { message: 'Error al comprobar el nombre de usuario.' } };
    }

    if (existingUsernames && existingUsernames.length > 0) {
      return { data: null, error: { message: 'Este nombre de usuario ya está en uso.' } };
    }

    // Validar que el correo electrónico no esté en uso (Supabase Auth)
    const { data: authUsers, error: emailError } = await supabase.auth.admin.listUsers();
    if (emailError) {
      return { data: null, error: { message: 'Error al comprobar el correo electrónico.' } };
    }

    const emailAlreadyInUse = authUsers?.users.some(user => user.email?.toLowerCase() === email.toLowerCase());
    if (emailAlreadyInUse) {
      return { data: null, error: { message: 'Este correo electrónico ya está en uso.' } };
    }

    // Crear el usuario en Supabase Auth
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

    if (error || !data.user) {
      return { data: null, error: { message: error?.message || 'Error al crear el usuario.' } };
    }

    // Crear el perfil con función RPC
    try {
      await supabase.rpc(
        'ensure_user_profile',
        {
          user_id: data.user.id,
          user_email: email,
          user_name: username,
        } as Database['public']['Functions']['ensure_user_profile']['Args']
      );
    } catch (rpcError: any) {
      console.error('Error en RPC:', rpcError);
      return { data: null, error: { message: 'Error al crear el perfil del usuario.' } };
    }

    sessionStorage.setItem('firstLogin', 'true');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error general en signUpUser:', error);
    return { data: null, error: { message: error.message || 'Error inesperado durante el registro.' } };
  }
};
