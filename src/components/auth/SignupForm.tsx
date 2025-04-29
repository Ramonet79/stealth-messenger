
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

type SignupFormProps = {
  onSuccess: () => void;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signUp } = useSupabaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        values.email // Usando el mismo email como recoveryEmail por ahora
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
    } catch (error: any) {
      toast({
        title: "Error inesperado",
        description: error?.message || "Ha ocurrido un error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UsernameField control={form.control} name="username" />
        <EmailField control={form.control} name="email" />
        <PasswordField control={form.control} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrarse"}
        </Button>
      </form>
    </Form>
  );
};
