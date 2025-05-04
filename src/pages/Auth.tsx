
import React, { useState, useEffect } from 'react';
import { AuthContainer }   from '@/components/auth/AuthContainer';
import { AuthHeader }      from '@/components/auth/AuthHeader';
import { AuthFormToggle }  from '@/components/auth/AuthFormToggle';
import { LoginForm }       from '@/components/auth/LoginForm';
import { SignupForm }      from '@/components/auth/SignupForm';
import { PatternCreation } from '@/components/auth/PatternCreation';
import { useAuthState }    from '@/hooks/useAuthState';
import { Navigate }        from 'react-router-dom';
import { patternService }  from '@/services/patternService';

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
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  console.log("Auth render - usuario:", user?.id, "isCreatePattern:", isCreatePattern);

  // Effects are moved outside of conditionals to ensure consistent hook execution
  useEffect(() => {
    // Only proceed with pattern verification if there's a user and we're not in pattern creation mode
    if (user && !isCreatePattern) {
      console.log("Usuario autenticado, verificando si tiene patrón");
      
      const checkPatternAndNavigate = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await patternService.getPattern(user.id);
          
          if (error || !data || data.length === 0) {
            console.log("Usuario sin patrón detectado - activando creación de patrón");
            // Marcar para que se cree el patrón
            sessionStorage.setItem('firstLogin', 'true');
            // Recargar la página para que entre en el flujo de creación
            window.location.reload();
          } else {
            console.log("Usuario tiene patrón, redirigiendo al index");
            setShouldRedirect("/");
          }
        } catch (err) {
          console.error("Error al verificar patrón:", err);
          // Por precaución, si hay error marcamos para crear patrón
          sessionStorage.setItem('firstLogin', 'true');
          // Recargar la página para entrar al flujo de creación
          window.location.reload();
        } finally {
          setIsLoading(false);
        }
      };
      
      checkPatternAndNavigate();
    }
  }, [user, isCreatePattern]);

  // 1️⃣ Primero: si estamos en el flujo de CREACIÓN de patrón, mostramos PatternCreation
  if (isCreatePattern && user) {
    console.log("Mostrando creación de patrón para usuario:", user.id);
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
  
  // 2️⃣ Segundo: si hay usuario (y no estamos creando patrón), redirigimos según el estado
  if (user) {
    // Si ya determinamos que debe redirigir, lo hacemos
    if (shouldRedirect) {
      return <Navigate to={shouldRedirect} replace />;
    }
    
    // Si estamos cargando, mostramos spinner
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }
  }

  // 3️⃣ Tercero: si no hay usuario, mostramos formulario de login/signup
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
