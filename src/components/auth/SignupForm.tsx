
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsernameField } from './UsernameField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { signupSchema, SignupFormValues } from './validation-schemas';
import { useCheckUsername } from '@/hooks/useCheckUsername';

type SignupFormProps = {
  onSuccess: () => void;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signUp } = useSupabaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAvailable, suggested, loading, checkUsername } = useCheckUsername();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);

    try {
      const { error } = await signUp(
        values.email,
        values.password,
        values.username,
        values.email // recoveryEmail opcional
      );

      if (error) {
        toast({
          title: "Error al crear cuenta",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Cuenta creada con éxito",
        description: "Ya puedes iniciar sesión.",
      });

      onSuccess();
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
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              const username = e.target.value;
              if (username) {
                checkUsername(username);
              }
            }}
          />
          {loading && <p className="text-sm text-gray-500">Verificando nombre de usuario...</p>}
          {isAvailable === true && (
            <p className="text-sm text-green-600">✔ Nombre de usuario disponible</p>
          )}
          {isAvailable === false && (
            <p className="text-sm text-red-600">
              ❌ Este nombre ya está en uso
              {suggested && (
                <>
                  . Puedes probar con: <strong>{suggested}</strong>
                </>
              )}
            </p>
          )}
        </div>

        <EmailField form={form} name="email" />
        <PasswordField control={form.control} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrarse"}
        </Button>
      </form>
    </Form>
  );
};
