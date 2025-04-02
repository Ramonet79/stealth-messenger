
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Crear un cliente Supabase con la URL y clave anónima
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener el cuerpo de la petición
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "El correo electrónico es obligatorio" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verificar si el usuario existe
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "No se encontró ningún usuario con ese correo electrónico" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Generar un nuevo patrón para el usuario (por ejemplo, [1,2,3,4])
    const newPattern = "1,2,3,4";
    
    // Actualizar el patrón del usuario en la base de datos
    const { error: updateError } = await supabase
      .from("unlock_patterns")
      .update({ pattern: newPattern })
      .eq("user_id", user.id);
    
    if (updateError) {
      // Si no existe un patrón existente, crear uno nuevo
      const { error: insertError } = await supabase
        .from("unlock_patterns")
        .insert([{ user_id: user.id, pattern: newPattern }]);
        
      if (insertError) {
        throw new Error("No se pudo restablecer el patrón");
      }
    }

    // En una implementación real, aquí enviaríamos un correo electrónico al usuario
    // con el nuevo patrón o un enlace para configurar uno nuevo

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Se ha restablecido el patrón correctamente" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
