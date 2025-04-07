
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

// Esquema para la recuperación de acceso por email de recuperación
const recoverySchema = z.object({
  email: z.string().email("Email inválido"),
});

type RecoveryFormProps = {
  onCancel: () => void;
};

export const RecoveryForm = ({ onCancel }: RecoveryFormProps) => {
  const { recoverAccount } = useSupabaseAuth();

  // Formulario para recuperación por email secundario
  const form = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });

  // Manejar recuperación por email secundario
  const handleRecovery = async (data: z.infer<typeof recoverySchema>) => {
    const { email } = data;
    await recoverAccount(email);
    onCancel();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">
        Recuperar acceso por correo de recuperación
      </h1>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Si olvidaste tu patrón de desbloqueo, puedes recuperar el acceso usando tu correo de recuperación.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRecovery)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo de recuperación</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="recuperacion@email.com" 
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
            Recuperar acceso
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
