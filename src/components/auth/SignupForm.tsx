
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form, FormField } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UsernameField } from './UsernameField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { signupSchema, SignupFormValues } from './validation-schemas';
import { useCheckUsername } from '@/hooks/useCheckUsername';
import { signUpUser } from '@/services/auth'; // ajusta la ruta si tu export está en otro fichero
import { supabase } from '@/integrations/supabase/client';

type SignupFormProps = {
  onSuccess: () => void;
};

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAvailable, suggested, loading: checkingUsername, checkUsername } = useCheckUsername();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  // Verificamos el estado del usuario y email antes de enviar el formulario
  const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value) {
      await checkUsername(e.target.value);
    }
  };

  const handleSubmit = async (values: SignupFormValues) => {
    // Verificar de nuevo antes de enviar
    await checkUsername(values.username);
    
    // Si el username ya está en uso, no seguimos
    if (isAvailable === false) {
      toast({
        title: 'Error',
        description: 'El nombre de usuario ya está en uso.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Iniciando registro con:", values.email, values.username);
      
      // Modificamos para asegurarnos de que el nombre de usuario se guarda correctamente
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            full_name: values.username // También guardamos en full_name para redundancia
          }
        }
      });

      if (error) {
        console.error("Error en SignupForm:", error);
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Bienvenido a Stealth Messenger.',
      });
      
      // Una vez registrado, asegurémonos de crear el perfil explícitamente
      if (data?.user?.id) {
        try {
          // Llamamos directamente a la función RPC para garantizar la creación del perfil
          const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
            user_id: data.user.id,
            user_email: values.email,
            user_name: values.username
          });
          
          if (rpcError) {
            console.error("Error al crear perfil con RPC:", rpcError);
            
            // Si falla la RPC, intentamos insertar directamente
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ 
                id: data.user.id,
                email: values.email,
                username: values.username 
              });
              
            if (insertError) {
              console.error("También falló la inserción directa:", insertError);
            } else {
              console.log("Perfil creado mediante inserción directa");
            }
          } else {
            console.log("Perfil creado correctamente con RPC");
          }
        } catch (err) {
          console.error("Error al crear perfil de usuario:", err);
        }
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error inesperado en SignupForm:', err);
      toast({
        title: 'Error inesperado',
        description: err.message || 'Ha ocurrido un error.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <UsernameField
              field={field}
              form={form}
              onBlur={handleUsernameBlur}
            />
          )}
        />
        {checkingUsername && <p className="text-sm text-gray-500">Verificando nombre de usuario…</p>}
        {isAvailable && <p className="text-sm text-green-600">✔ Disponible</p>}
        {isAvailable === false && (
          <p className="text-sm text-red-600">
            ❌ En uso{suggested && <>. Prueba: <strong>{suggested}</strong></>}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => <EmailField control={form.control} name="email" />}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => <PasswordField control={form.control} />}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
};
