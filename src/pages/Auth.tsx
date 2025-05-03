
// src/pages/Auth.tsx
import React, { useState } from 'react';
import { AuthContainer }   from '@/components/auth/AuthContainer';
import { AuthHeader }      from '@/components/auth/AuthHeader';
import { AuthFormToggle }  from '@/components/auth/AuthFormToggle';
import { LoginForm }       from '@/components/auth/LoginForm';
import { SignupForm }      from '@/components/auth/SignupForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { useAuthState }    from '@/hooks/useAuthState';
import { Navigate }        from 'react-router-dom';

const Auth: React.FC = () => {
  const { 
    user, 
    isCreatePattern, 
    patternStep, 
    newPattern,
    setPatternStep,
    setNewPattern,
    handleCompletePatternCreation
  } = useAuthState();
  
  const [isLogin, setIsLogin] = useState(true);

  // 1️⃣ Primero: si estamos en el flujo de CREACIÓN de patrón, mostramos PatternCreation
  if (isCreatePattern && user) {
    return (
      <PatternCreation
        userId={user.id}
        step={patternStep}
        setStep={(step) => setPatternStep(step as 0 | 1)}
        newPattern={newPattern}
        setNewPattern={setNewPattern}
        onComplete={handleCompletePatternCreation}
      />
    );
  }
  
  // 2️⃣ Segundo: si ya hay usuario (y no estamos creando patrón), vamos al /
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthContainer>
      <AuthHeader title={isLogin ? 'Iniciar sesión' : 'Regístrate'} />

      {isLogin
        ? <LoginForm onResetClick={() => {}} onRecoveryClick={() => {}} />
        : <SignupForm onSuccess={() => setIsLogin(true)} />
      }

      <AuthFormToggle 
        isLogin={isLogin} 
        onToggle={() => setIsLogin(!isLogin)} 
      />
    </AuthContainer>
  );
};

export default Auth;
