
// src/components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UsernameField } from './UsernameField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { signupSchema, SignupFormValues } from './validation-schemas';
import { useCheckUsername } from '@/hooks/useCheckUsername';
import { supabase } from '@/integrations/supabase/client';

type SignupFormProps = { onSuccess: () => void };

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAvailable, suggested, loading, checkUsername } = useCheckUsername();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Iniciando registro con:", values);

      // Verificar disponibilidad del nombre de usuario antes de continuar
      const { data: existingUsernames } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', values.username)
        .maybeSingle();

      if (existingUsernames) {
        toast({ 
          variant: 'destructive',
          title: 'Nombre de usuario no disponible', 
          description: 'Este nombre de usuario ya está en uso' 
        });
        setIsSubmitting(false);
        return;
      }

      // Registrar al usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            email_confirmed: true
          }
        }
      });

      if (error) throw error;

      console.log("Usuario registrado:", data?.user?.id);

      // Intentar crear manualmente el perfil en caso de que la función auto-signup falle
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: values.username,
              email: values.email,
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error("Error al crear el perfil manualmente:", profileError);
          } else {
            console.log("Perfil creado manualmente con éxito");
          }
        } catch (profileError) {
          console.error("Excepción al crear el perfil manualmente:", profileError);
        }
      }

      toast({ title: 'Registro exitoso', description: 'Cuenta creada correctamente' });
      onSuccess();
    } catch (err: any) {
      console.error("Error en registro:", err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Error durante el registro', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <UsernameField
            form={form}
            onBlur={e => {
              const u = e.target.value;
              if (u) checkUsername(u);
            }}
          />
          {loading && <p className="text-sm text-gray-500">Verificando nombre de usuario…</p>}
          {isAvailable === true && <p className="text-sm text-green-600">✔ Disponible</p>}
          {isAvailable === false && (
            <p className="text-sm text-red-600">
              ❌ En uso{suggested && <>. Prueba: <strong>{suggested}</strong></>}
            </p>
          )}
        </div>

        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
};
