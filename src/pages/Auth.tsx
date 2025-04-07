
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RecoveryForm } from '@/components/auth/RecoveryForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFormToggle } from '@/components/auth/AuthFormToggle';
import { VerificationEmailSent } from '@/components/auth/VerificationEmailSent';
import { VerificationError } from '@/components/auth/VerificationError';
import { VerificationSuccess } from '@/components/auth/VerificationSuccess';

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
    <AuthContainer>
      {emailSent ? (
        <VerificationEmailSent onBack={() => setEmailSent(false)} />
      ) : confirmationError ? (
        <VerificationError 
          error={confirmationError} 
          onRetry={() => {
            setConfirmationError(null);
            setIsLogin(false);
          }} 
        />
      ) : confirmationSuccess ? (
        <VerificationSuccess onLogin={handleLoginAfterConfirmation} />
      ) : !isResetPassword && !isRecoveryMode ? (
        <>
          <AuthHeader 
            title={isLogin ? "Iniciar sesión en dScrt" : "Crear cuenta en dScrt"} 
          />
          
          {isLogin ? (
            <LoginForm onResetClick={showResetPassword} onRecoveryClick={showRecoveryMode} />
          ) : (
            <SignupForm onSuccess={handleSignupSuccess} />
          )}
          
          <AuthFormToggle isLogin={isLogin} onToggle={toggleMode} />
        </>
      ) : isResetPassword ? (
        <ResetPasswordForm onCancel={hideResetPassword} />
      ) : (
        <RecoveryForm onCancel={hideRecoveryMode} />
      )}
    </AuthContainer>
  );
};

export default Auth;
