// src/pages/Auth.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// ————— RUTAS CORREGIDAS ————— 
// Asegúrate de que estos tres archivos existen exactamente aquí:
import PatternCreation from '../components/auth/PatternCreation';
import LoginForm       from '../components/auth/LoginForm';
import SignupForm      from '../components/auth/SignupForm';
// ——————————————————————————

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

  // 1️⃣ Si estamos creando patrón, mostramos ese flujo
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

  // 2️⃣ Si ya hay usuario autenticado (y no creación de patrón), redirigimos al chat
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Si no hay usuario, mostramos los formularios
  return (
    <div className="auth-container">
      {isSignup
        ? <SignupForm onSubmit={handleSignup} />
        : <LoginForm  onSubmit={handleLogin} />
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
