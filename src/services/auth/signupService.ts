import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';
import { AutoSignupPayload } from '@/types/auth-functions';
import { Database } from '@/integrations/supabase/types';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    const { data: existingUsernames, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', username)
      .limit(1);

    if (usernameCheckError || (existingUsernames && existingUsernames.length > 0)) {
      return {
        data: null,
        error: { message: 'Este nombre de usuario ya está en uso o no se pudo verificar.' },
      };
    }

    const { data: existingEmails, error: emailCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (emailCheckError || (existingEmails && existingEmails.length > 0)) {
      return {
        data: null,
        error: { message: 'Este correo electrónico ya está en uso o no se pudo verificar.' },
      };
    }

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
      return {
        data: null,
        error: { message: error?.message || 'Error al crear el usuario' },
      };
    }

    const autoSignupPayload = {
      email: data.user.email ?? '',
      user_id: data.user.id,
    } as Record<string, unknown>;

    try {
      await supabase.functions.invoke('auto-signup', {
        body: autoSignupPayload,
      });
    } catch (funcError) {
      console.error('Error auto-signup:', funcError);
    }

    await createUserProfile(data.user.id, username, email);
    sessionStorage.setItem('firstLogin', 'true');

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

const createUserProfile = async (userId: string, username: string, email: string) => {
  for (let i = 0; i < 3; i++) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, username, email });

      if (!profileError) return;

      await new Promise((r) => setTimeout(r, 500));

      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkProfile) return;

      if (i === 1) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username, email })
          .eq('id', userId);

        if (!updateError) return;
      }
    } catch (e) {
      console.error(`Error intento ${i + 1}:`, e);
    }
  }

  const { data: finalCheck, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!finalCheck || checkError) {
    try {
      await supabase.rpc<'ensure_user_profile', Database['public']['Functions']['ensure_user_profile']['Args']>(
        'ensure_user_profile',
        {
          user_id: userId,
          user_email: email,
          user_name: username,
        }
      );
    } catch (rpcError) {
      console.error('Error en RPC:', rpcError);
    }
  }
};

export { createUserProfile };
