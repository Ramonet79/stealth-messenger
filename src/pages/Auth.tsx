
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RecoveryForm } from '@/components/auth/RecoveryForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isCreatePattern, setIsCreatePattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);
  const [step, setStep] = useState(1);
  
  const { user, loading } = useSupabaseAuth();

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const showResetPassword = () => setIsResetPassword(true);
  const hideResetPassword = () => setIsResetPassword(false);
  
  const showRecoveryMode = () => setIsRecoveryMode(true);
  const hideRecoveryMode = () => setIsRecoveryMode(false);

  const startPatternCreation = () => setIsCreatePattern(true);
  
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

  if (user && !isCreatePattern) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
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
        {!isResetPassword && !isRecoveryMode ? (
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
              <SignupForm onSuccess={startPatternCreation} />
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
