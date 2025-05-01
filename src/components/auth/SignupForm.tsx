
// src/components/auth/SignupForm.tsx
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
import { signUpUser } from '@/services/auth';
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
    // Verificar que el nombre de usuario esté disponible antes de enviar
    if (isAvailable === false) {
      toast({ 
        title: 'Error', 
        description: 'El nombre de usuario ya está en uso. Prueba con otro nombre.',
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Iniciando registro con:", values);
      
      // Usar el servicio centralizado de registro
      const { data, error } = await signUpUser(
        values.email, 
        values.password, 
        values.username,
        '' // recoveryEmail opcional (no incluido en este formulario)
      );

      if (error) {
        console.error("Error en registro:", error);
        toast({ 
          title: 'Error', 
          description: error.message, 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Usuario registrado exitosamente:", data);
      toast({ 
        title: 'Registro exitoso', 
        description: 'Cuenta creada correctamente' 
      });
      
      // Verificación adicional para asegurar que se creó el perfil
      const userId = data.user?.id;
      if (userId) {
        // Verificar que el perfil exista
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError || !profileData) {
          console.log('Perfil no encontrado, intentando crear manualmente');
          // Intentar crear el perfil manualmente si no existe
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: values.username,
              email: values.email,
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error al crear perfil manualmente:', insertError);
          }
        }

        // Verificar que el patrón exista
        const { data: patternData, error: patternError } = await supabase
          .from('unlock_patterns')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (patternError || !patternData) {
          console.log('Patrón no encontrado, intentando crear manualmente');
          // Intentar crear el patrón manualmente si no existe
          const { error: insertPatternError } = await supabase
            .from('unlock_patterns')
            .insert({
              user_id: userId,
              pattern: '[]' // Patrón vacío inicial
            });

          if (insertPatternError) {
            console.error('Error al crear patrón manualmente:', insertPatternError);
          }
        }
      }
      
      onSuccess();
    } catch (err: any) {
      console.error("Error inesperado en registro:", err);
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
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <UsernameField 
              field={field} 
              form={form} 
              onBlur={(e) => {
                if (e.target.value) checkUsername(e.target.value);
              }} 
            />
          )}
        />
        {loading && <p className="text-sm text-gray-500">Verificando nombre de usuario…</p>}
        {isAvailable === true && <p className="text-sm text-green-600">✔ Disponible</p>}
        {isAvailable === false && (
          <p className="text-sm text-red-600">
            ❌ En uso{suggested && <>. Prueba: <strong>{suggested}</strong></>}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <EmailField control={form.control} name="email" />
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={() => (
            <PasswordField control={form.control} />
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
};
