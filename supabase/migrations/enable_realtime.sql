
-- Habilitar la funcionalidad de tiempo real para la tabla de mensajes
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicación de tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
