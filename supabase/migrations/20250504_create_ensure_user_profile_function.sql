
-- Función para garantizar que exista un perfil para cada usuario
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
  SET email = excluded.email,
      username = excluded.username,
      updated_at = now();
END;
$$;

-- Añadir política RLS para permitir insertar en profiles 
-- (asumimos que ya está habilitada la RLS en la tabla)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política que permite a los usuarios insertar su propio perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Política que permite a los usuarios ver/leer sus propios perfiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política que permite a los usuarios actualizar sus propios perfiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Política que permite a los usuarios ver los perfiles de otros usuarios
-- Esto es necesario para funciones como búsqueda de usuarios
DROP POLICY IF EXISTS "Users can view other profiles username" ON public.profiles;
CREATE POLICY "Users can view other profiles username" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Añadimos restricción de unicidad para usernames
ALTER TABLE public.profiles ADD CONSTRAINT unique_username UNIQUE (username);
