
// supabase/functions/auto-signup/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: CORS_HEADERS 
    });
  }

  try {
    // Configuración de Supabase con variables de entorno
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Inicializamos el cliente con la clave de servicio para operaciones admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Leer payload
    let payload;
    try {
      payload = await req.json();
      console.log("Payload recibido:", JSON.stringify(payload));
    } catch (err) {
      console.error("Error al parsear JSON:", err);
      throw new Error("JSON inválido en el request");
    }

    // Extraer información del usuario
    const user = payload.user || payload.record;

    if (!user || !user.id) {
      console.error("Información de usuario incompleta:", user);
      throw new Error("Información de usuario incompleta");
    }

    const id = user.id as string;
    const email = user.email as string;
    
    // Extraer username de múltiples posibles ubicaciones
    const userMetadata = user.user_metadata || {};
    console.log("Metadata recibido:", JSON.stringify(userMetadata));
    
    // Intentamos extraer el username de varias fuentes posibles
    const username = userMetadata.username || 
                     userMetadata.name || 
                     userMetadata.full_name ||
                     userMetadata.display_name ||
                     email.split("@")[0];

    console.log("Auto-signup procesando usuario:", { id, email, username });

    // Confirmar el email automáticamente y asegurar que el username esté en metadata
    try {
      await supabase.auth.admin.updateUserById(id, { 
        email_confirm: true,
        user_metadata: {
          ...userMetadata,
          username: username,
          name: username,
          full_name: username,
          display_name: username
        }
      });
      console.log("Email confirmado y metadata actualizado para:", email);
    } catch (confirmError) {
      console.error("Error al confirmar email o actualizar metadatos:", confirmError);
    }

    // Verificar si el perfil ya existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', id)
      .maybeSingle();
      
    console.log("Verificación de perfil existente:", existingProfile || "No existe");

    if (!existingProfile) {
      console.log("Creando nuevo perfil para usuario:", id);
      
      // Insertar el perfil directamente
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id,
          email,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error("Error al insertar perfil directamente:", insertError);
        
        // Si falla, intentamos usar la función RPC segura
        console.log("Intentando con función RPC segura");
        const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
          user_id: id,
          user_email: email,
          user_name: username
        });
        
        if (rpcError) {
          console.error("Error llamando a ensure_user_profile:", rpcError);
          throw rpcError;
        }
        
        console.log("Perfil creado correctamente mediante RPC");
      } else {
        console.log("Perfil creado correctamente mediante inserción directa");
      }
    } else if (!existingProfile.username) {
      console.log("El perfil existe pero sin username, actualizando username:", username);
      
      // Actualizar el perfil para asignar el username
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (updateError) {
        console.error("Error al actualizar username en perfil:", updateError);
      } else {
        console.log("Perfil actualizado correctamente con username:", username);
      }
    } else {
      console.log("El perfil ya existe con username:", existingProfile.username);
    }
      
    // Crear un patrón de desbloqueo vacío para el nuevo usuario
    const { data: existingPattern, error: checkPatternError } = await supabase
      .from("unlock_patterns")
      .select("id")
      .eq("user_id", id)
      .maybeSingle();

    if (!existingPattern) {
      console.log("Creando patrón inicial para el usuario");
      const { error: patternError } = await supabase
        .from("unlock_patterns")
        .insert({
          user_id: id,
          pattern: '[]', // Patrón vacío inicial
        });

      if (patternError) {
        console.error("Error al crear patrón inicial:", patternError);
      } else {
        console.log("Patrón inicial creado con éxito");
      }
    } else {
      console.log("Patrón existente, no es necesario crear uno nuevo");
    }

    // Responde OK
    return new Response(JSON.stringify({ success: true, username }), {
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (err: any) {
    console.error("auto-signup error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
});
