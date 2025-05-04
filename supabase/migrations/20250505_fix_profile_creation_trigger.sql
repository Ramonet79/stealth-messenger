
-- Función para garantizar que exista un perfil para cada usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutado con privilegios del creador
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      username = COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
      updated_at = now();
  RETURN NEW;
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
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (user_id, user_email, user_name, now(), now())
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, public.profiles.email),
      username = COALESCE(EXCLUDED.username, public.profiles.username),
      updated_at = now();
END;
$$;
