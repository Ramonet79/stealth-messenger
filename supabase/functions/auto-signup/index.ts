
// supabase/functions/auto-signup/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

serve(async (req: Request) => {
  // 1) Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // Configuración de Supabase con variables de entorno
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Inicializamos el cliente con la clave de servicio para operaciones admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2) Leer payload estándar de Auth Hook
    //    Supabase envía { user: User, session: Session, ... }
    const { user } = (await req.json()) as { user: any };

    if (!user || !user.id) {
      console.error("Información de usuario incompleta:", user);
      throw new Error("Información de usuario incompleta");
    }

    const id = user.id as string;
    const email = user.email as string;
    const username = (user.user_metadata?.username as string) || email.split("@")[0];
    const recovery_email = (user.user_metadata?.recovery_email as string) || null;

    console.log("Auto-signup procesando usuario:", { id, email, username });

    // 3) Confirma el email automáticamente
    try {
      await supabase.auth.admin.updateUserById(id, { email_confirm: true });
      console.log("Email confirmado automáticamente para:", email);
    } catch (confirmError) {
      console.error("Error al confirmar email:", confirmError);
      // Continuamos a pesar del error, ya que lo importante es crear el perfil
    }

    // 4) Verificar si el perfil ya existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    console.log("Verificación de perfil existente:", existingProfile || "No existe");

    if (!existingProfile) {
      console.log("Creando nuevo perfil para usuario:", id);
      
      // Intentar insertar el perfil directamente (como servicio admin)
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
    } else {
      console.log("El perfil ya existe, no es necesario crearlo");
    }
      
    // 5) Crear un patrón de desbloqueo vacío para el nuevo usuario
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

    // 6) Responde OK
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("auto-signup error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
