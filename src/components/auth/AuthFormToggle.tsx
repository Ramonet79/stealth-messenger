
import React from 'react';

interface AuthFormToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthFormToggle = ({ isLogin, onToggle }: AuthFormToggleProps) => {
  return (
    <div className="mt-4 text-center">
      <button
        onClick={onToggle}
        className="text-sm text-blue-600 hover:underline"
      >
        {isLogin
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
};
