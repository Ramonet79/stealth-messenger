
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

// Esquema de validación para el registro
const signupSchema = z.object({
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario no puede tener más de 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

type SignupFormProps = {
  onSuccess: () => void;
};

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const { signUp } = useSupabaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Formulario para registro
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Verificar disponibilidad de nombre de usuario
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (error && error.code === 'PGRST116') {
        setUsernameAvailable(true);
      } else {
        setUsernameAvailable(false);
      }
    } catch (error) {
      console.error('Error al verificar nombre de usuario:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Detectar cambios en el campo de nombre de usuario
  useEffect(() => {
    const username = form.watch('username');
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (username && username.length >= 3) {
      const timeout = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      
      setTypingTimeout(timeout);
    } else {
      setUsernameAvailable(null);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [form.watch('username')]);

  // Manejar registro
  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    try {
      setIsSubmitting(true);
      const { email, password, username } = data;
      
      // Usando el mismo email como correo de recuperación
      const { data: authData, error } = await signUp(
        email, 
        password, 
        username, 
        email // El mismo email como recuperación
      );
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error de registro",
          description: error.message,
        });
        return;
      }
      
      if (authData?.user) {
        toast({
          title: "Registro exitoso",
          description: "Por favor, revisa tu correo para confirmar tu cuenta",
        });
        
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error en el proceso de registro:', error);
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: error.message || "Ocurrió un error durante el registro",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    placeholder="usuario123" 
                    className={`pr-10 ${
                      usernameAvailable === true ? 'border-green-500' : 
                      usernameAvailable === false ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {checkingUsername && (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <span className="text-green-500">✓</span>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span className="text-red-500">✗</span>
                    )}
                  </div>
                </div>
              </FormControl>
              {!checkingUsername && usernameAvailable === false && (
                <p className="text-xs text-red-500 mt-1">Este nombre de usuario ya está en uso</p>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Nombre de usuario disponible</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
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
              <p className="text-xs text-gray-500 mt-1">
                Este correo se utilizará para acceder a tu cuenta y para recuperarla si la olvidas
              </p>
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
          disabled={isSubmitting || usernameAvailable === false || checkingUsername}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Registrarse
        </Button>
      </form>
    </Form>
  );
};
