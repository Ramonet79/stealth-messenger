
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  recoveryEmail: string
): Promise<AuthResponse> => {
  try {
    console.log("SignupService: iniciando registro para", username);
    
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
          recovery_email: recoveryEmail,
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

    console.log("Usuario creado con ID:", data.user.id);
    
    // Intentar crear el perfil manualmente
    try {
      const profileData = {
        id: data.user.id,
        username: username,
        email: email,
        recovery_email: recoveryEmail || null,
        updated_at: new Date().toISOString()
      };
      
      console.log("Creando perfil con datos:", profileData);
      
      // Primero verificamos si ya existe un perfil para evitar conflictos
      const { data: existingProfile, error: checkProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (checkProfileError) {
        console.error("Error al verificar perfil existente:", checkProfileError);
      }
      
      // Si no existe, lo insertamos, si existe, lo actualizamos
      let profileError;
      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
        profileError = error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.user.id);
        profileError = error;
      }
        
      if (profileError) {
        console.error("Error al insertar/actualizar perfil:", profileError);
        // No retornamos error aquí, intentamos continuar con la creación del patrón
      } else {
        console.log("Perfil insertado/actualizado con éxito");
      }
      
      // Verificamos si ya existe un patrón de desbloqueo para este usuario
      const { data: existingPattern, error: checkPatternError } = await supabase
        .from('unlock_patterns')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();
        
      if (checkPatternError) {
        console.error("Error al verificar patrón existente:", checkPatternError);
      }
      
      // Si no existe, creamos uno vacío
      if (!existingPattern) {
        const { error: patternError } = await supabase
          .from('unlock_patterns')
          .insert({
            user_id: data.user.id,
            pattern: '[]', // Patrón vacío inicial
          });
          
        if (patternError) {
          console.error("Error al crear patrón inicial:", patternError);
        } else {
          console.log("Patrón inicial creado con éxito");
        }
      }
    } catch (profileError) {
      console.error("Error al gestionar perfil/patrón:", profileError);
      // No retornamos error, para que el usuario pueda continuar con el proceso
    }

    // Establecer bandera de primer inicio de sesión para mostrar creación de patrón
    sessionStorage.setItem('firstLogin', 'true');

    return { data, error: null };
  } catch (error: any) {
    console.error('Error general en signUpUser:', error);
    return { data: null, error: { message: error.message || 'Error inesperado durante el registro.' } };
  }
};
