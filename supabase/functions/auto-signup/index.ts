
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
    console.log("Payload recibido:", payload);
    
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

    // Verificar si ya existe un perfil para este usuario
    const { data: existingProfile, error: profileQueryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();
    
    if (profileQueryError && profileQueryError.message !== 'No rows found') {
      console.error("Error al consultar perfil existente:", profileQueryError);
    }
    
    // Si no existe perfil, intentar crearlo
    if (!existingProfile) {
      console.log("No se encontró perfil existente, creando uno nuevo");
      
      // Obtener datos del usuario para crear el perfil
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
      
      if (userError) {
        console.error("Error al obtener datos del usuario:", userError);
      } else if (userData && userData.user) {
        // Extraer username de los metadatos del usuario
        const username = userData.user.user_metadata?.username || email.split('@')[0];
        console.log("Datos para crear perfil:", { id: user_id, email, username });
        
        // Crear perfil
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user_id,
            email: email,
            username: username
          });
          
        if (insertError) {
          console.error("Error al crear perfil desde edge function:", insertError);
        } else {
          console.log("Perfil creado exitosamente desde edge function");
        }
      }
    } else {
      console.log("Perfil ya existente:", existingProfile);
      
      // Actualizar el email en el perfil si es necesario
      if (existingProfile.email !== email) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email })
          .eq('id', user_id);
        
        if (updateError) {
          console.error("Error al actualizar email en perfil:", updateError);
        } else {
          console.log("Email actualizado en perfil existente");
        }
      }
    }
    
    // Respuesta exitosa
    return new Response(JSON.stringify({ 
      success: true,
      message: "Email confirmado y perfil verificado"
    }), {
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
