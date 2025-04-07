
import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { RecoveryForm } from '@/components/auth/RecoveryForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { Loader2 } from 'lucide-react';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFormToggle } from '@/components/auth/AuthFormToggle';
import { VerificationEmailSent } from '@/components/auth/VerificationEmailSent';
import { VerificationError } from '@/components/auth/VerificationError';
import { VerificationSuccess } from '@/components/auth/VerificationSuccess';
import { useAuthState } from '@/hooks/useAuthState';

const Auth = () => {
  const {
    isLogin,
    isResetPassword,
    isRecoveryMode,
    isCreatePattern,
    newPattern,
    step,
    emailSent,
    confirmationError,
    processingConfirmation,
    confirmationSuccess,
    user,
    loading,
    toggleMode,
    showResetPassword,
    hideResetPassword,
    showRecoveryMode,
    hideRecoveryMode,
    startPatternCreation,
    handlePatternStep,
    handleSignupSuccess,
    handleLoginAfterConfirmation,
    setStep,
    // Include the new exported functions
    setEmailSent,
    setConfirmationError,
    setIsLogin
  } = useAuthState();

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
        setNewPattern={newPattern => handlePatternStep(newPattern, false)}
        onComplete={() => handlePatternStep([], true)}
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
