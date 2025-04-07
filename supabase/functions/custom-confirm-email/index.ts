
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Esta función será llamada por un webhook de Supabase
// cuando se genere un evento de signup
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Decodificar la información del webhook
    const { email, confirmation_url } = await req.json();

    if (!email || !confirmation_url) {
      throw new Error("Email o URL de confirmación no proporcionados");
    }

    // Enviar email personalizado
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
            <a href="${confirmation_url}" 
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
