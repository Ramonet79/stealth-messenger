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
      // 1) Crea la cuenta en Auth
      const { data, error: signError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      }, {
        data: { username: values.username } // puedes guardar metadata si quieres
      });

      if (signError || !data.user) {
        toast({
          title: 'Error al crear cuenta',
          description: signError?.message ?? 'No se pudo registrar',
          variant: 'destructive',
        });
        return;
      }

      const userId = data.user.id;

      // 2) Inserta el perfil en la tabla `profiles`
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: values.username,
          email: values.email,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('No se pudo crear el perfil:', profileError);
        toast({
          title: 'Registro incompleto',
          description: 'La cuenta se creó, pero no el perfil. Contacta soporte.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Cuenta creada con éxito',
        description: 'Ya puedes iniciar sesión o revisar tu correo.',
      });

      onSuccess();

    } catch (err) {
      console.error(err);
      toast({ title: 'Error inesperado', variant: 'destructive' });
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
            onBlur={e => { const u = e.target.value; if (u) checkUsername(u); }}
          />
          {loading && <p className="text-sm text-gray-500">Verificando usuario…</p>}
          {isAvailable === true && <p className="text-sm text-green-600">✔ Disponible</p>}
          {isAvailable === false && (
            <p className="text-sm text-red-600">
              ❌ En uso {suggested && <>. Prueba: <strong>{suggested}</strong></>}
            </p>
          )}
        </div>

        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
};
