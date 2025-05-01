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

    const id       = user.id as string;
    const email    = user.email as string;
    const username = (user.user_metadata?.username as string) || email.split("@")[0];

    // 3) Confirma el email automáticamente (opcional)
    await supabase.auth.admin.updateUserById(id, { email_confirm: true });

    // 4) Inserta o actualiza el perfil en una sola operación
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        { id, email, username, updated_at: new Date().toISOString() },
        { onConflict: ["id"] }
      );

    if (upsertError) throw upsertError;

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
