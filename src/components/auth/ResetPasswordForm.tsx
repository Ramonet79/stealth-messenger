
import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Esquema para la recuperación de contraseña
const resetSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ResetPasswordFormProps = {
  onCancel: () => void;
};

export const ResetPasswordForm = ({ onCancel }: ResetPasswordFormProps) => {
  const { sendPasswordResetEmail } = useSupabaseAuth();

  // Formulario para recuperación de contraseña
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Manejar recuperación de contraseña
  const handleReset = async (data: z.infer<typeof resetSchema>) => {
    const { email } = data;
    await sendPasswordResetEmail(email);
    onCancel();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">
        Restablecer contraseña
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleReset)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="tu@email.com" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Enviar correo de recuperación
          </Button>
        </form>
      </Form>
      
      <div className="mt-4 text-center">
        <button
          onClick={onCancel}
          className="text-sm text-blue-600 hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </>
  );
};
