
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RecoveryForm } from '@/components/auth/RecoveryForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { Loader2, CheckCircle, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  const [emailSent, setEmailSent] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [processingConfirmation, setProcessingConfirmation] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useSupabaseAuth();
  
  // Extraer parámetros de la URL directamente en cada render
  const searchParams = new URLSearchParams(location.search);
  const hasConfirmSuccess = searchParams.get('confirmSuccess') === 'true';

  useEffect(() => {
    // Si el usuario llega a la página de auth con una URL que incluye #access_token
    // esto es un callback de la confirmación de Supabase, lo procesamos
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log("Detectada URL de callback de Supabase Auth");
      // Permitimos que Supabase procese este hash automáticamente
      // No necesitamos hacer nada, el evento onAuthStateChange lo manejará
    }
    
    // Si hay un parámetro confirmSuccess=true en la URL, pero no hay usuario
    if (hasConfirmSuccess && !user) {
      console.log("Cuenta verificada, redirigiendo a login");
      setConfirmationSuccess(true);
      // Limpiamos la URL para evitar intentos repetidos
      window.history.replaceState({}, '', '/auth');
    }
    
    // Si hay un user confirmado y acabamos de verificar (firstLoginAfterConfirmation)
    if (user && sessionStorage.getItem('firstLoginAfterConfirmation') === 'true') {
      console.log("Usuario confirmado y logueado, iniciando creación de patrón");
      startPatternCreation();
    }
  }, [user, hasConfirmSuccess, location]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmailSent(false);
  };

  const showResetPassword = () => setIsResetPassword(true);
  const hideResetPassword = () => setIsResetPassword(false);
  
  const showRecoveryMode = () => setIsRecoveryMode(true);
  const hideRecoveryMode = () => setIsRecoveryMode(false);

  const startPatternCreation = () => {
    setIsCreatePattern(true);
    setEmailSent(false);
  };
  
  const handlePatternStep = (pattern: number[], isComplete: boolean) => {
    if (step === 1) {
      setNewPattern(pattern);
      setStep(2);
      return true;
    } else if (isComplete) {
      setIsCreatePattern(false);
      return true;
    }
    return false;
  };

  const handleSignupSuccess = () => {
    setEmailSent(true);
  };
  
  const handleLoginAfterConfirmation = () => {
    setConfirmationSuccess(false);
    setIsLogin(true);
    
    // Auto-llenamos el email si está disponible
    const email = searchParams.get('email');
    if (email) {
      sessionStorage.setItem('autoFillEmail', email);
      toast({
        title: "Email recordado",
        description: "Hemos rellenado automáticamente tu email para facilitar el inicio de sesión",
      });
    }
  };

  if (loading || processingConfirmation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (user && !isCreatePattern) {
    return <Navigate to="/" replace />;
  }

  if (isCreatePattern && user) {
    return (
      <PatternCreation 
        userId={user.id}
        step={step} 
        setStep={setStep}
        newPattern={newPattern}
        setNewPattern={setNewPattern}
        onComplete={() => setIsCreatePattern(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {emailSent ? (
          <>
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
                alt="dScrt Logo" 
                className="h-20 w-20 rounded-lg" />
            </div>
            
            <div className="flex justify-center mb-6">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-center">
              Verifica tu correo electrónico
            </h1>
            
            <p className="text-center mb-6">
              Hemos enviado un enlace de confirmación a tu correo. 
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
            </p>
            
            <Alert className="mb-4">
              <AlertDescription>
                Después de confirmar, regresarás aquí para crear tu patrón de desbloqueo.
              </AlertDescription>
            </Alert>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setEmailSent(false)}
            >
              Volver
            </Button>
          </>
        ) : confirmationError ? (
          <>
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
                alt="dScrt Logo" 
                className="h-20 w-20 rounded-lg" />
            </div>
            
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-center">
              Error de confirmación
            </h1>
            
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {confirmationError}
              </AlertDescription>
            </Alert>
            
            <p className="text-center mb-6">
              Ha ocurrido un error al confirmar tu cuenta. Por favor, intenta registrarte nuevamente 
              o contacta con soporte si el problema persiste.
            </p>
            
            <Button 
              type="button" 
              className="w-full"
              onClick={() => {
                setConfirmationError(null);
                setIsLogin(false);
              }}
            >
              Intentar de nuevo
            </Button>
          </>
        ) : confirmationSuccess ? (
          <>
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
                alt="dScrt Logo" 
                className="h-20 w-20 rounded-lg" />
            </div>
            
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-center">
              ¡Cuenta verificada!
            </h1>
            
            <p className="text-center mb-6">
              Tu cuenta ha sido verificada correctamente. Por favor, inicia sesión para continuar y crear tu patrón de desbloqueo.
            </p>
            
            <Button 
              type="button" 
              className="w-full"
              onClick={handleLoginAfterConfirmation}
            >
              Iniciar sesión
            </Button>
          </>
        ) : !isResetPassword && !isRecoveryMode ? (
          <>
            <div className="flex justify-center mb-6">
              <img src="/lovable-uploads/3f963389-b035-45c6-890b-824df3549300.png" 
                alt="dScrt Logo" 
                className="h-20 w-20 rounded-lg" />
            </div>
            <h1 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? "Iniciar sesión en dScrt" : "Crear cuenta en dScrt"}
            </h1>
            
            {isLogin ? (
              <LoginForm onResetClick={showResetPassword} onRecoveryClick={showRecoveryMode} />
            ) : (
              <SignupForm onSuccess={handleSignupSuccess} />
            )}
            
            <div className="mt-4 text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </>
        ) : isResetPassword ? (
          <ResetPasswordForm onCancel={hideResetPassword} />
        ) : (
          <RecoveryForm onCancel={hideRecoveryMode} />
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
