
-- Añadir campo de correo de recuperación a la tabla de perfiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;
-- Añadir restricción de unicidad para el nombre de usuario
ALTER TABLE public.profiles ADD CONSTRAINT unique_username UNIQUE (username);
