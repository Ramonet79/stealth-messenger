import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import PatternLock from '@/components/PatternLock';
import { patternService } from '@/services/patternService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  
  const { user, loading, signIn, signUp, sendPasswordResetEmail } = useSupabaseAuth();
  const { toast } = useToast();

  if (user && !isCreatePattern) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetPassword) {
      await sendPasswordResetEmail(email);
      return;
    }

    if (isLogin) {
      const { data, error } = await signIn(email, password);
      if (!error && data?.user) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo",
        });
      }
    } else {
      const { data, error } = await signUp(email, password);
      if (!error) {
        toast({
          title: "Registro exitoso",
          description: "Se ha enviado un correo de confirmación",
        });
        setIsLogin(true);
      }
    }
  };

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
        <PatternLock onPatternComplete={handlePatternCreate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {!isResetPassword ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "Iniciar sesión" : "Registrarse"}
              </Button>
            </form>
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
                onClick={() => setIsLogin(!isLogin)}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar correo de recuperación
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsResetPassword(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Esta es la aplicación de mensajería secreta dScrt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
