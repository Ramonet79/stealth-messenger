import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const confirmSuccess = searchParams.get('confirmSuccess') === 'true';
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const email = searchParams.get('email');
  
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    const handleConfirmation = async () => {
      if (confirmSuccess && token && type === 'signup' && email && !user) {
        setProcessingConfirmation(true);
        setConfirmationError(null);
        
        try {
          console.log("Verificando token de confirmación:", token, "para email:", email);
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: 'signup',
            email: email
          });
          
          if (error) {
            console.error('Error al confirmar token:', error);
            setConfirmationError(error.message);
          } else {
            console.log('Token verificado correctamente');
            const { error: signInError } = await supabase.auth.signInWithOtp({
              email: email,
              token: token,
              options: {
                shouldCreateUser: false
              }
            });
            
            if (signInError) {
              console.error('Error al iniciar sesión automática:', signInError);
              setConfirmationError(null);
            } else {
              console.log('Inicio de sesión automático exitoso');
              startPatternCreation();
              sessionStorage.setItem('firstLoginAfterConfirmation', 'true');
            }
          }
        } catch (error: any) {
          console.error('Error al procesar confirmación:', error);
          setConfirmationError(error.message);
        } finally {
          setProcessingConfirmation(false);
        }
      }
    };
    
    handleConfirmation();
  }, [confirmSuccess, token, type, email, user]);

  useEffect(() => {
    if (confirmSuccess && user) {
      console.log("Usuario confirmado y autenticado, iniciando creación de patrón");
      startPatternCreation();
      
      sessionStorage.setItem('firstLoginAfterConfirmation', 'true');
    }
  }, [confirmSuccess, user]);

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

  useEffect(() => {
    if ((confirmSuccess && user) || confirmationError) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [confirmSuccess, user, confirmationError]);

  if (loading || processingConfirmation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (user && !isCreatePattern && !confirmSuccess) {
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
        ) : confirmSuccess && !user ? (
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
              onClick={() => {
                if (email) {
                  sessionStorage.setItem('autoFillEmail', email);
                }
                setIsLogin(true);
                window.history.replaceState({}, '', '/auth');
              }}
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
