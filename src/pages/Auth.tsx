// src/pages/Auth.tsx
import React, { useState } from 'react';
import { AuthContainer }   from '@/components/auth/AuthContainer';
import { AuthHeader }      from '@/components/auth/AuthHeader';
import { AuthFormToggle }  from '@/components/auth/AuthFormToggle';
import { LoginForm }       from '@/components/auth/LoginForm';
import { SignupForm }      from '@/components/auth/SignupForm';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthContainer>
      <AuthHeader title={isLogin ? 'Iniciar sesión' : 'Regístrate'} />

      {isLogin
        ? <LoginForm />
        : <SignupForm />
      }

      <AuthFormToggle 
        isLogin={isLogin} 
        onToggle={() => setIsLogin(!isLogin)} 
      />
    </AuthContainer>
  );
};

export default Auth;
