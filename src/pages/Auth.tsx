
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import PatternLock from '@/components/PatternLock';
import { patternService } from '@/services/patternService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
  recoveryEmail: z.string().email("Email de recuperación inválido"),
});

// Esquema para el inicio de sesión
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// Esquema para la recuperación de contraseña
const resetSchema = z.object({
  email: z.string().email("Email inválido"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { user, loading, signIn, signUp, sendPasswordResetEmail } = useSupabaseAuth();
  const { toast } = useToast();

  // Formulario para inicio de sesión
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Formulario para registro
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      recoveryEmail: "",
    },
  });
  
  // Formulario para recuperación de contraseña
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
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
        // PGRST116 significa que no se encontraron resultados
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
    const username = signupForm.watch('username');
    
    // Limpiar el timeout anterior si existe
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Crear un nuevo timeout
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
  }, [signupForm.watch('username')]);

  if (user && !isCreatePattern) {
    return <Navigate to="/" />;
  }

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

  // Manejar registro
  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    const { email, password, username, recoveryEmail } = data;
    
    const { data: authData, error } = await signUp(email, password);
    
    if (!error && authData?.user) {
      // Guardar el nombre de usuario y email de recuperación en el perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username,
          recovery_email: recoveryEmail
        })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Error al guardar perfil:', profileError);
        toast({
          variant: "destructive",
          title: "Error al guardar perfil",
          description: profileError.message,
        });
        return;
      }
      
      toast({
        title: "Registro exitoso",
        description: "Por favor, crea tu patrón de desbloqueo",
      });
      
      // Ir al paso de creación de patrón
      setIsCreatePattern(true);
    }
  };

  // Manejar recuperación de contraseña
  const handleReset = async (data: z.infer<typeof resetSchema>) => {
    const { email } = data;
    await sendPasswordResetEmail(email);
  };

  // Manejar creación de patrón
  const handlePatternCreate = async (pattern: number[]): Promise<boolean> => {
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      toast({
        title: "Patrón registrado",
        description: "Por favor, confirma tu patrón",
      });
      return true;
    } else {
      // Comparar patrones
      const patternsMatch = pattern.length === newPattern.length && 
        pattern.every((val, idx) => val === newPattern[idx]);
      
      if (patternsMatch) {
        if (user) {
          await patternService.savePattern(user.id, pattern);
          toast({
            title: "Patrón establecido",
            description: "Tu patrón de desbloqueo ha sido guardado",
          });
          setIsCreatePattern(false);
        }
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Los patrones no coinciden",
          description: "Por favor, intenta nuevamente",
        });
        setStep(1);
        return false;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isCreatePattern && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-6">
          {step === 1 ? "Crear patrón de desbloqueo" : "Confirmar patrón"}
        </h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          {step === 1 
            ? "Dibuja un patrón que usarás para desbloquear la aplicación. Recuérdalo bien." 
            : "Dibuja nuevamente el mismo patrón para confirmarlo."}
        </p>
        <PatternLock onPatternComplete={handlePatternCreate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {!isResetPassword ? (
          <>
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/8185c5d9-bbd3-4143-a4a8-0d524ebfaeec.png" 
                alt="dScrt Logo" 
                className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? "Iniciar sesión en dScrt" : "Crear cuenta en dScrt"}
            </h1>
            
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
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
                    control={loginForm.control}
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
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Iniciar sesión
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
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
                    control={signupForm.control}
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
                    control={signupForm.control}
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
                  
                  <FormField
                    control={signupForm.control}
                    name="recoveryEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo de recuperación (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="recuperacion@email.com" 
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">
                          Este correo se utilizará para recuperar el acceso si olvidas tu patrón de desbloqueo
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={signupForm.formState.isSubmitting || usernameAvailable === false || checkingUsername}
                  >
                    {signupForm.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Registrarse
                  </Button>
                </form>
              </Form>
            )}
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  if (isLogin) {
                    loginForm.reset();
                  } else {
                    signupForm.reset();
                  }
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Restablecer contraseña
            </h1>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
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
                  disabled={resetForm.formState.isSubmitting}
                >
                  {resetForm.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Enviar correo de recuperación
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsResetPassword(false);
                  resetForm.reset();
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            dScrt - Mensajería segura y privada
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
