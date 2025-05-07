
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
import { signUpUser } from '@/services/auth'; // Usar el servicio centralizado

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
      
      // Usar el servicio centralizado para el registro con la firma actualizada
      const response = await signUpUser(
        values.email, 
        values.password,
        values.username,
        '' // Recovery email opcional
      );
      
      if (response.error) {
        console.error("Error en SignupForm:", response.error);
        toast({
          title: 'Error al registrarse',
          description: response.error.message,
          variant: 'destructive',
        });
        return;
      }

      console.log("Registro exitoso, usuario creado:", response.data?.user?.id);
      console.log("Estableciendo firstLogin=true en sessionStorage");
      sessionStorage.setItem('firstLogin', 'true');
      
      toast({
        title: '¡Registro exitoso!',
        description: 'Bienvenido a Stealth Messenger.',
      });
      
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
