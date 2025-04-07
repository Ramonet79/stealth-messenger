
import React from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
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

// Esquema para el inicio de sesión
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormProps = {
  onResetClick: () => void;
  onRecoveryClick: () => void;
};

export const LoginForm = ({ onResetClick, onRecoveryClick }: LoginFormProps) => {
  const { signIn } = useSupabaseAuth();
  const { toast } = useToast();

  // Formulario para inicio de sesión
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Manejar inicio de sesión
  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    const { email, password } = data;
    const { data: authData, error } = await signIn(email, password);
    
    if (!error && authData?.user) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="********" 
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
          Iniciar sesión
        </Button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <button
          onClick={onResetClick}
          className="text-sm text-blue-600 hover:underline block"
        >
          ¿Olvidaste tu contraseña?
        </button>
        
        <button
          onClick={onRecoveryClick}
          className="text-sm text-blue-600 hover:underline block"
        >
          ¿Olvidaste tu patrón de desbloqueo?
        </button>
      </div>
    </Form>
  );
};
