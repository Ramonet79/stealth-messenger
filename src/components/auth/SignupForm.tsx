
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsernameField } from './UsernameField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { signupSchema, SignupFormValues } from './validation-schemas';

type SignupFormProps = {
  onSuccess: () => void;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signUp } = useSupabaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario para registro
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Función para verificar disponibilidad del usuario y correo
  const checkAvailability = async (username: string, email: string): Promise<{usernameAvailable: boolean, emailAvailable: boolean}> => {
    try {
      console.log("Verificando disponibilidad de username y email:", username, email);
      
      // Verificar nombre de usuario (case insensitive)
      const { data: existingUsernames, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .limit(1);
      
      if (usernameError) {
        console.error("Error al verificar disponibilidad del usuario:", usernameError);
        throw new Error("No se pudo verificar la disponibilidad del nombre de usuario");
      }
      
      // Verificar también en auth.users (metadatos) por seguridad adicional
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);
        
      if (authError) {
        console.error("Error al verificar metadatos de usuario:", authError);
      }
      
      // Verificar email (exacto, case insensitive)
      const { data: existingEmails, error: emailError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', email.toLowerCase())
        .limit(1);
        
      if (emailError) {
        console.error("Error al verificar disponibilidad del email:", emailError);
        throw new Error("No se pudo verificar la disponibilidad del correo electrónico");
      }
      
      const usernameExists = existingUsernames && existingUsernames.length > 0 || 
                            authUsers && authUsers.length > 0;
                            
      console.log("Resultado verificación:", { 
        usernameExists,
        emailExists: existingEmails && existingEmails.length > 0,
        usernamesFound: existingUsernames,
        emailsFound: existingEmails
      });
      
      return {
        usernameAvailable: !usernameExists,
        emailAvailable: !existingEmails || existingEmails.length === 0
      };
    } catch (error) {
      console.error("Error en la verificación de disponibilidad:", error);
      throw error;
    }
  };

  // Manejar registro
  const handleSignup = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      const { email, password, username } = data;
      
      console.log("Iniciando proceso de registro con:", { email, username });
      
      // Verificación final antes del registro
      const availability = await checkAvailability(username, email);
      
      if (!availability.usernameAvailable) {
        toast({
          variant: "destructive",
          title: "Nombre de usuario no disponible",
          description: "Este nombre de usuario ya está registrado. Por favor, elige otro.",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!availability.emailAvailable) {
        toast({
          variant: "destructive",
          title: "Correo electrónico no disponible",
          description: "Este correo electrónico ya está registrado. Por favor, utiliza otro o recupera tu contraseña.",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Validaciones pasadas, procediendo con registro");
      
      // Sign up user directly without email verification
      const { data: authData, error } = await signUp(
        email, 
        password, 
        username, 
        "" // Enviamos string vacío en lugar del recoveryEmail
      );
      
      if (error) {
        console.error("Error durante el registro:", error);
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: error.message,
        });
        setIsSubmitting(false);
        return;
      }
      
      if (authData?.user) {
        console.log("Registro exitoso, usuario creado:", authData.user.id);
        
        // Verificar que el perfil se haya creado correctamente
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
          
        if (profileError || !profile) {
          console.error("Advertencia: Perfil posiblemente no creado:", profileError);
          console.log("Intentando crear perfil manualmente...");
          
          // Intentar crear perfil manualmente
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: username,
              email: email
            });
            
          if (insertError) {
            console.error("Error al crear perfil manualmente:", insertError);
          } else {
            console.log("Perfil creado manualmente con éxito");
          }
        } else {
          console.log("Perfil verificado correctamente:", profile);
        }
        
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente",
        });
        
        // Mark as first login for pattern creation after login
        sessionStorage.setItem('firstLogin', 'true');
        console.log("Estableciendo firstLogin=true en sessionStorage");
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error en el proceso de registro:', error);
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: error.message || "Ocurrió un error durante el registro",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
        <UsernameField control={form.control} name="username" />
        <EmailField control={form.control} />
        <PasswordField control={form.control} />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Registrarse
        </Button>
      </form>
    </Form>
  );
};
