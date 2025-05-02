import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// ← RUTAS CORREGIDAS aquí
import PatternCreation from '../components/auth/PatternCreation';
import LoginForm       from '../components/auth/LoginForm';
import SignupForm      from '../components/auth/SignupForm';

import { useAuthState } from '../hooks/useAuthState';

const Auth: React.FC = () => {
  const {
    user,
    isCreatePattern,
    patternStep,
    newPattern,
    setPatternStep,
    setNewPattern,
    handleSignup,
    handleLogin,
    handleCompletePatternCreation,
  } = useAuthState();

  const [isSignup, setIsSignup] = useState(false);

  if (isCreatePattern && user) {
    return (
      <PatternCreation
        userId={user.id}
        step={patternStep}
        setStep={setPatternStep}
        newPattern={newPattern}
        setNewPattern={setNewPattern}
        onComplete={handleCompletePatternCreation}
      />
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      {isSignup ? (
        <SignupForm onSubmit={handleSignup} />
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
      <button
        onClick={() => setIsSignup(!isSignup)}
        className="mt-4 underline text-sm text-blue-600"
      >
        {isSignup ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};

export default Auth;
