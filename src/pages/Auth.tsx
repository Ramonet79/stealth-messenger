import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import PatternCreation from '../components/PatternCreation';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
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

  // 1️⃣ Primero: si estamos en el flujo de CREACIÓN de patrón, mostramos PatternCreation
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

  // 2️⃣ Segundo: si ya hay usuario (y no estamos creando patrón), vamos al /
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3️⃣ Si no hay usuario, mostramos formularios de login/registro
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
