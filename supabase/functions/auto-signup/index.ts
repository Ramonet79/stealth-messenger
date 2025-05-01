
// supabase/functions/auto-signup/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
    // 2) Leer payload estándar de Auth Hook
    //    Supabase envía { user: User, session: Session, ... }
    const { user } = (await req.json()) as { user: any };

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

    // 4) Intentar insertar primero (si no existe)
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error al verificar perfil existente:", checkError);
    }

    if (!existingProfile) {
      console.log("Perfil no encontrado, creando nuevo perfil");
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id,
          email,
          username,
          recovery_email,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error al insertar perfil:", insertError);
        throw insertError;
      }
      console.log("Perfil insertado correctamente");
    } else {
      console.log("Perfil existente, actualizando");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email,
          username,
          recovery_email,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error al actualizar perfil:", updateError);
        throw updateError;
      }
      console.log("Perfil actualizado correctamente");
    }

    // 5) Responde OK
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
