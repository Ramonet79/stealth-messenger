
-- Función para garantizar que exista un perfil para cada usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutado con privilegios del creador
SET search_path = ''
AS $$
BEGIN
  -- Extraer nombre de usuario de diferentes fuentes posibles en el orden de prioridad
  DECLARE
    username TEXT := COALESCE(
      NEW.raw_user_meta_data->>'username',     -- Primero intentamos con username directo
      NEW.raw_user_meta_data->>'name',         -- Luego con name
      NEW.raw_user_meta_data->>'full_name',    -- Luego con full_name
      split_part(NEW.email, '@', 1)            -- Finalmente usamos la parte del email
    );
  BEGIN
    -- Guardamos en el user_metadata para asegurarnos que está disponible en todas partes
    UPDATE auth.users SET raw_user_meta_data = 
      jsonb_set(
        jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{name}', to_jsonb(username)),
        '{username}', to_jsonb(username)
      )
    WHERE id = NEW.id;
    
    -- Crear o actualizar el perfil con el username
    INSERT INTO public.profiles (id, email, username, created_at, updated_at)
    VALUES (
      NEW.id, 
      NEW.email, 
      username,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = EXCLUDED.username,
        updated_at = now();
        
    -- Log para debug
    RAISE NOTICE 'Profile created for % with username %', NEW.email, username;
        
    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't break the signup flow
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NEW;
  END;
END;
$$;

-- Disparador que ejecuta la función cada vez que se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- También actualicemos la función ensure_user_profile para mayor seguridad
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID, user_email TEXT, user_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutado con privilegios del creador
SET search_path = ''
AS $$
BEGIN
  -- Update the auth.users table to ensure display_name is set
  UPDATE auth.users 
  SET raw_user_meta_data = 
    jsonb_set(
      jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{name}', to_jsonb(user_name)),
      '{username}', to_jsonb(user_name)
    )
  WHERE id = user_id;
  
  -- Create or update the profile
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (user_id, user_email, user_name, now(), now())
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, public.profiles.email),
      username = COALESCE(EXCLUDED.username, public.profiles.username),
      updated_at = now();
      
  -- Log para debug
  RAISE NOTICE 'Profile ensured for % with username %', user_email, user_name;
END;
$$;
