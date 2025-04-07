
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Edge function auto-signup invocada");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Decodificar la información
    const payload = await req.json();
    console.log("Payload recibido:", JSON.stringify(payload));
    
    const { email, user_id } = payload;

    if (!email || !user_id) {
      console.error("Email o ID de usuario no proporcionado");
      throw new Error("Email o ID de usuario no proporcionado");
    }

    // Confirmar el email automáticamente
    console.log("Confirmando email para el usuario:", user_id);
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      user_id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error("Error al confirmar email:", confirmError);
      throw new Error(`Error al confirmar email: ${confirmError.message}`);
    }

    console.log("Email confirmado automáticamente para:", email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error en auto-signup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
