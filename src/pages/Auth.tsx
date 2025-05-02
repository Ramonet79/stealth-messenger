// src/pages/Auth.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// Import corregido, fija bien la ruta relativa
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

  // 1️⃣ Flujo de creación de patrón
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

  // 2️⃣ Usuario autenticado → chat
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Login / Signup
  return (
    <div className="auth-container">
      {isSignup
        ? <SignupForm onSubmit={handleSignup} />
        : <LoginForm  onSubmit={handleLogin}  />
      }
      <button
        onClick={() => setIsSignup(!isSignup)}
        className="mt-4 underline text-sm text-blue-600"
      >
        {isSignup
          ? '¿Ya tienes cuenta? Iniciar sesión'
          : '¿No tienes cuenta? Regístrate'
        }
      </button>
    </div>
  );
};

export default Auth;
