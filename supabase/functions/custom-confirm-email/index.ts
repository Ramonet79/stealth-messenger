
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Inicializamos Resend con la API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Inicializamos el cliente de Supabase con la URL y la clave de servicio
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Edge function custom-confirm-email invocada");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Decodificar la información del webhook
    const payload = await req.json();
    console.log("Payload recibido:", JSON.stringify(payload));
    
    const { email, user_id } = payload;

    if (!email || !user_id) {
      console.error("Email o ID de usuario no proporcionado");
      throw new Error("Email o ID de usuario no proporcionado");
    }

    // Generar un token de confirmación único usando la API de Supabase Auth Admin
    console.log("Generando token de verificación para el usuario:", user_id);
    
    // Genera un token OTP de verificación para el usuario
    const { data: verificationData, error: verificationError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        // Asegurarse que redirectTo sea una URL absoluta correcta
        redirectTo: `${Deno.env.get("PUBLIC_APP_URL") || "https://ca70e353-ea8f-4f74-8cd4-4e57c75305d7.lovableproject.com"}/auth?confirmSuccess=true`
      }
    });

    if (verificationError) {
      console.error("Error al generar el token de verificación:", verificationError);
      throw new Error(`Error al generar token: ${verificationError.message}`);
    }

    console.log("Token generado exitosamente:", verificationData);
    
    // Extraer la URL generada para el enlace de confirmación
    const confirmationUrl = verificationData.properties.action_link;
    
    if (!confirmationUrl) {
      throw new Error("No se pudo generar la URL de confirmación");
    }
    
    console.log("URL de confirmación generada:", confirmationUrl);
    
    // La URL generada por Supabase ya es válida, usarla directamente sin modificaciones adicionales
    // Esto asegura que todas las partes del token y los parámetros se conserven correctamente
    
    console.log("Enviando email de confirmación a:", email);

    // Enviar email personalizado con la URL de confirmación oficial de Supabase
    const emailResponse = await resend.emails.send({
      from: "dScrt Messenger <onboarding@resend.dev>",
      to: [email],
      subject: "Confirma tu cuenta en dScrt Messenger",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://ca70e353-ea8f-4f74-8cd4-4e57c75305d7.lovableproject.com/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
                alt="dScrt Logo" style="width: 80px; height: 80px; border-radius: 10px;">
          </div>
          
          <h1 style="color: #333; text-align: center; font-size: 24px; margin-bottom: 20px;">
            Confirma tu cuenta en dScrt
          </h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 25px; text-align: center;">
            Gracias por registrarte en dScrt, la aplicación de mensajería más segura y privada.
            Para completar tu registro y comenzar a usar dScrt, por favor confirma tu dirección de correo electrónico.
          </p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${confirmationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Confirmar mi cuenta
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 10px;">
            Si no has solicitado esta cuenta, puedes ignorar este correo.
          </p>
          
          <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 20px; color: #999; font-size: 12px;">
            © 2025 dScrt Messenger - Comunicación segura y privada
          </div>
        </div>
      `,
    });

    console.log("Email personalizado enviado:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error al enviar email personalizado:", error);
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
